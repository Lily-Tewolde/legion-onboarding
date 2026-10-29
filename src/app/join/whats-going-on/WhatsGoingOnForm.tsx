"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Chip } from "@/components/Chip";
import { cx } from "@/components/cx";
import { List } from "@/components/List";
import { copy } from "@/copy";
import { CONCERN_LABELS, type ConcernLabel } from "@/data";
import type { Understanding } from "@/lib/ai/whats-going-on";
import { nextAction, slowStage, toggleChip } from "@/lib/whats-going-on/flow";
import type { StepResponse } from "@/lib/whats-going-on/step";
import { crisisFromStore, safeKey, type WhatsGoingOnState, whatsGoingOnStore } from "@/lib/whats-going-on/stored";
import { useSpeech } from "./useSpeech";

// Screen 2. The patient types, speaks or taps starter chips, or a mix. On
// Continue the server runs the word list, then the crisis flag and the AI in
// parallel. At 5 seconds "Still working on it…", at 10 the simple form is
// offered with what they typed kept; it only switches on its own when the AI
// fails or a limit is reached. What they typed stays in this browser tab

const STARTER_CHIPS: ConcernLabel[] = ["ADHD", "Anxiety", "Depression", "Sleep", "Not sure"];
const MAX_TEXT = 2000;

export function WhatsGoingOnForm() {
  const state = useSyncExternalStore(whatsGoingOnStore.subscribe, whatsGoingOnStore.get, whatsGoingOnStore.getServer);
  if (!state) return <FormSkeleton />;
  return state.form ? <SimpleForm state={state} /> : <TypedStep state={state} />;
}

function FormSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <div className="h-32 rounded-lg bg-wash motion-safe:animate-pulse" />
      <div className="h-control-sm w-2/3 rounded-full bg-wash motion-safe:animate-pulse" />
    </div>
  );
}

const save = (state: WhatsGoingOnState, patch: Partial<WhatsGoingOnState>) =>
  whatsGoingOnStore.save({ ...state, ...patch });

function TypedStep({ state }: { state: WhatsGoingOnState }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState<"empty" | "retry" | null>(null);
  const request = useRef<AbortController | null>(null);

  // Next keeps this screen alive when people move on. Stop what was in
  // progress as it's hidden, so it isn't still "working" when they come back
  useLayoutEffect(
    () => () => {
      request.current?.abort();
      setPending(false);
      setMessage(null);
    },
    [],
  );

  // Every screen this one can lead to, loaded in advance so a crisis screen
  // never waits on the network
  useEffect(() => {
    for (const path of ["/help-now", "/help-now/immediate-danger", "/help-now/being-hurt", "/join/someone-else", "/join/confirm"]) {
      router.prefetch(path);
    }
  }, [router]);

  useEffect(() => {
    if (!pending) return;
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Date.now() - started), 250);
    return () => clearInterval(timer);
  }, [pending]);

  const speech = useSpeech((spoken) => {
    const current = whatsGoingOnStore.get();
    const joined = [current.text.trim(), spoken].filter(Boolean).join(" ").slice(0, MAX_TEXT);
    save(current, { text: joined, spoken: true });
  });

  const openForm = (reason: "chosen" | "fallback") => {
    request.current?.abort();
    setPending(false);
    save(whatsGoingOnStore.get(), { form: { reason, conditions: state.chips } });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const answer = state.clarifyingAnswer ?? "";
    const empty = state.clarifyingQuestion
      ? !answer.trim()
      : !state.text.trim() && state.chips.length === 0;
    if (empty) {
      setMessage("empty");
      return;
    }

    setMessage(null);
    setElapsed(0);
    setPending(true);
    const controller = new AbortController();
    request.current = controller;
    const key = safeKey(state.text, answer);

    let response: StepResponse;
    try {
      const result = await fetch("/api/ai/whats-going-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          text: state.text,
          chips: state.chips,
          ...(state.clarifyingQuestion ? { clarification: { question: state.clarifyingQuestion, answer } } : {}),
          afterSafe: state.safeText === key,
        }),
      });
      if (!result.ok) throw new Error(`whats-going-on failed: ${result.status}`);
      response = await result.json();
    } catch {
      if (controller.signal.aborted) return;
      response = { result: "fallback", reason: "api_error" };
    }
    setPending(false);

    const current = whatsGoingOnStore.get();
    const action = nextAction(response, { retried: !!current.retried, forThemselves: !!current.forThemselves });
    switch (action.to) {
      case "crisis":
        crisisFromStore.save({ from: "whats_going_on" });
        save(current, { safeText: undefined });
        router.push(action.path);
        return;
      case "form":
        openForm("fallback");
        return;
      case "retry":
        save(current, { retried: true });
        setMessage("retry");
        return;
      case "clarify":
        save(current, { clarifyingQuestion: action.question });
        return;
      case "someone_else":
        router.push("/join/someone-else");
        return;
      case "confirm":
        save(current, {
          understanding: action.understanding,
          confirmChips: action.understanding.chips,
          // Unknown starts unanswered, so the confirm screen's row is a real question
          diagnosed: action.understanding.diagnosed === "not_sure" ? undefined : action.understanding.diagnosed,
        });
        router.push("/join/confirm");
    }
  };

  const stage = pending ? slowStage(elapsed) : "waiting";
  const offerForm = !pending || stage === "offer_form";

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <textarea
          aria-labelledby="wgo-title"
          aria-describedby={cx("wgo-intro", message === "empty" && !state.clarifyingQuestion && "wgo-empty") || undefined}
          placeholder={copy.whatsGoingOn.placeholder}
          value={state.text}
          maxLength={MAX_TEXT}
          rows={4}
          onChange={(event) => {
            setMessage(null);
            save(state, { text: event.target.value });
          }}
          className={cx(
            "focus-ring w-full rounded-lg border bg-white p-4 text-base text-ink",
            message === "empty" && !state.clarifyingQuestion ? "border-error" : "border-line-control",
          )}
        />
        {speech.supported && (
          <Button
            variant="secondary"
            size="small"
            className="self-start"
            aria-pressed={speech.listening}
            onClick={speech.listening ? speech.stop : speech.start}
          >
            {speech.listening ? copy.whatsGoingOn.listening : copy.whatsGoingOn.speak}
          </Button>
        )}
        <div className="flex flex-wrap gap-2">
          {STARTER_CHIPS.map((label) => (
            <Chip
              key={label}
              label={label}
              selected={state.chips.includes(label)}
              onToggle={() => {
                setMessage(null);
                save(state, { chips: toggleChip(state.chips, label) });
              }}
            />
          ))}
        </div>
      </div>

      {state.clarifyingQuestion && (
        <div className="flex flex-col gap-3">
          {/* The AI's one clarifying question, shown as plain text */}
          <label htmlFor="wgo-answer" className="text-lg font-medium text-ink">
            {state.clarifyingQuestion}
          </label>
          <textarea
            id="wgo-answer"
            aria-describedby={message === "empty" ? "wgo-empty" : undefined}
            value={state.clarifyingAnswer ?? ""}
            maxLength={MAX_TEXT}
            rows={3}
            onChange={(event) => {
              setMessage(null);
              save(state, { clarifyingAnswer: event.target.value });
            }}
            className={cx(
              "focus-ring w-full rounded-lg border bg-white p-4 text-base text-ink",
              message === "empty" ? "border-error" : "border-line-control",
            )}
          />
        </div>
      )}

      {message === "empty" && (
        <p id="wgo-empty" className="text-error">
          {copy.whatsGoingOn.empty}
        </p>
      )}
      {message === "retry" && (
        <p role="alert">
          {copy.whatsGoingOn.notUnderstood.split("{link}")[0]}
          <button
            type="button"
            onClick={() => openForm("chosen")}
            className="focus-ring cursor-pointer rounded-sm font-medium text-action underline underline-offset-4"
          >
            {copy.whatsGoingOn.notUnderstoodLink}
          </button>
          {copy.whatsGoingOn.notUnderstood.split("{link}")[1]}
        </p>
      )}

      <div className="flex flex-col items-start gap-3">
        <Button type="submit" disabled={pending}>
          {copy.common.continue}
        </Button>
        {pending && (
          <div className="flex w-full flex-col gap-2">
            <div aria-hidden="true" className="h-4 w-1/2 rounded-md bg-wash motion-safe:animate-pulse" />
            <p role="status" className="text-slate">
              {stage !== "waiting" ? copy.whatsGoingOn.stillWorking : ""}
            </p>
          </div>
        )}
        {offerForm && (
          <Button variant="text" onClick={() => openForm("chosen")}>
            {copy.whatsGoingOn.useForm}
          </Button>
        )}
      </div>
    </form>
  );
}

// The simple form, when the AI is down or slow, a limit is reached, or the
// patient chooses it. Legion's conditions list and their three needs options
function SimpleForm({ state }: { state: WhatsGoingOnState }) {
  const router = useRouter();
  const [errors, setErrors] = useState<{ conditions?: boolean; need?: boolean }>({});
  const form = state.form ?? { reason: "chosen" as const, conditions: [] };

  useLayoutEffect(() => () => setErrors({}), []);

  const update = (patch: Partial<NonNullable<WhatsGoingOnState["form"]>>) => {
    save(state, { form: { ...form, ...patch } });
    setErrors((current) => ({
      conditions: "conditions" in patch ? false : current.conditions,
      need: "need" in patch ? false : current.need,
    }));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const missing = { conditions: form.conditions.length === 0, need: !form.need };
    if (missing.conditions || missing.need) {
      setErrors(missing);
      return;
    }
    const need = form.need ?? "not_sure";
    const understanding: Understanding = {
      status: "ok",
      clarifying_question: null,
      concerns: form.conditions.map((label) => ({ label, quote: "" })),
      diagnosed: need === "medication_support" ? "yes" : "not_sure",
      need,
      eligibility_flags: [],
      chips: form.conditions.map((label) => ({ label, display: copy.conditions[label] })),
    };
    save(state, {
      understanding,
      confirmChips: understanding.chips,
      diagnosed: understanding.diagnosed === "not_sure" ? undefined : understanding.diagnosed,
    });
    router.push("/join/confirm");
  };

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-8">
      <p className="rounded-lg bg-wash px-4 py-3 text-navy">{copy.whatsGoingOn.formNote}</p>

      <fieldset aria-describedby={errors.conditions ? "form-conditions-error" : undefined}>
        <legend className="text-lg font-medium text-ink">{copy.whatsGoingOn.formConditions}</legend>
        <div className="mt-2 flex flex-col">
          {CONCERN_LABELS.map((label) => (
            <Checkbox
              key={label}
              label={copy.conditions[label]}
              checked={form.conditions.includes(label)}
              onChange={() => update({ conditions: toggleChip(form.conditions, label) })}
            />
          ))}
        </div>
        {errors.conditions && (
          <p id="form-conditions-error" className="mt-2 text-error">
            {copy.join.errors.required}
          </p>
        )}
      </fieldset>

      <div className="flex flex-col gap-2">
        <List
          legend={copy.whatsGoingOn.formNeed}
          name="need"
          items={(["medication_support", "new_diagnosis_or_medication", "not_sure"] as const).map((need) => ({
            value: need,
            label: copy.whatsGoingOn.needs[need],
          }))}
          value={form.need}
          onChange={(value) => update({ need: value as Understanding["need"] })}
        />
        {errors.need && <p className="text-error">{copy.join.errors.required}</p>}
      </div>

      <Button type="submit" className="self-start">
        {copy.common.continue}
      </Button>
    </form>
  );
}
