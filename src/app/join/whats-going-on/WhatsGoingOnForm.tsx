"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { ConcernIcon } from "@/components/concernIcons";
import { Dictate } from "@/components/Dictate";
import { Info } from "@/components/icons";
import { List } from "@/components/List";
import { Card, PageTitle, Screen } from "@/components/Screen";
import { FieldError } from "@/components/SegmentedControl";
import { Skeleton } from "@/components/Skeleton";
import { copy } from "@/copy";
import { CONCERN_LABELS, type ConcernLabel } from "@/data";
import { overallDiagnosed, type Understanding } from "@/lib/ai/whats-going-on";
import { nextAction, slowStage, toggleChip } from "@/lib/whats-going-on/flow";
import type { StepResponse } from "@/lib/whats-going-on/step";
import { crisisFromStore, safeKey, type WhatsGoingOnState, whatsGoingOnStore } from "@/lib/whats-going-on/stored";
import { fallbackReason } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

// Screen 2. The patient types, speaks or taps starter chips, or a mix. On
// Continue the server runs the word list, then the crisis flag and the AI in
// parallel. At 5 seconds "Still working on it…", at 10 the simple form is
// offered with what they typed kept; it only switches on its own when the AI
// fails or a limit is reached. What they typed stays in this browser tab

// Legion's full conditions list, "Not sure" last (decided Oct 29)
const STARTER_CHIPS: ConcernLabel[] = [
  "ADHD",
  "Anxiety",
  "Depression",
  "Sleep",
  "PTSD",
  "OCD",
  "Panic disorder",
  "Bipolar disorder",
  "Not sure",
];

const chipName = (label: ConcernLabel) => (label === "Not sure" ? copy.whatsGoingOn.notSureChip : copy.conditions[label]);

const FLOW = { phase: "whats_going_on" as const, part: 1, parts: 2, back: "/join/safety" };
const MAX_TEXT = 1000;

export function WhatsGoingOnForm() {
  const state = useSyncExternalStore(whatsGoingOnStore.subscribe, whatsGoingOnStore.get, whatsGoingOnStore.getServer);
  if (!state) {
    return (
      <Screen flow={FLOW} width="picker">
        <Heading />
        <Skeleton rows={1} />
      </Screen>
    );
  }
  return state.form ? <SimpleForm state={state} /> : <TypedStep state={state} />;
}

function Heading() {
  return (
    <div className="flex flex-col gap-2">
      <PageTitle id="wgo-title">{copy.whatsGoingOn.title}</PageTitle>
      <p id="wgo-intro" className="text-body md:text-body-lg">
        {copy.whatsGoingOn.intro}
      </p>
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

    const words = Boolean(state.text.trim());
    const mode = words && state.chips.length ? "mixed" : words ? (state.spoken ? "spoken" : "typed") : "chips";
    track("portal.concern.submitted", { mode });

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
        if (response.result === "crisis") {
          track("portal.crisis.shown", { source: response.source, kind: response.kind, step: "whats_going_on" });
        }
        crisisFromStore.save({ from: "whats_going_on" });
        save(current, { safeText: undefined });
        router.push(action.path);
        return;
      case "form":
        track("portal.ai.fallback_used", { step: "whats_going_on", reason: fallbackReason(action.reason) });
        openForm("fallback");
        return;
      case "retry":
        track("portal.concern.retry_shown");
        save(current, { retried: true });
        setMessage("retry");
        return;
      case "clarify":
        save(current, { clarifyingQuestion: action.question });
        return;
      case "someone_else":
        track("portal.someone_else.flagged");
        router.push("/join/someone-else");
        return;
      case "confirm":
        // The confirm screen's diagnosis questions start unanswered
        save(current, { understanding: action.understanding, confirmChips: action.understanding.chips, diagnoses: {} });
        router.push("/join/confirm");
    }
  };

  const stage = pending ? slowStage(elapsed) : "waiting";
  const slow = pending && stage !== "waiting";
  const offerForm = !pending || stage === "offer_form";
  const errorId = message === "empty" ? "wgo-empty" : message === "retry" ? "wgo-retry" : undefined;

  return (
    <Screen
      flow={{ ...FLOW, part: slow ? 2 : 1 }}
      width="picker"
      footer={
        <div className="flex flex-col items-stretch gap-1">
          {slow ? (
            <div aria-hidden="true" className="shimmer h-control rounded-full" />
          ) : (
            <Button type="submit" form="wgo-form" disabled={pending} className="w-full">
              {copy.common.continue}
            </Button>
          )}
          {offerForm && (
            <Button variant="text" onClick={() => openForm("chosen")}>
              {copy.whatsGoingOn.useForm}
            </Button>
          )}
        </div>
      }
    >
      {slow ? (
        <div aria-busy="true" className="flex flex-col gap-3">
          <Skeleton rows={3} />
          <p role="status" className="flex items-center gap-2 text-body text-slate">
            <span aria-hidden="true" className="shimmer size-3 rounded-full" />
            {copy.whatsGoingOn.stillWorking}
          </p>
        </div>
      ) : (
        <form id="wgo-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-3 md:gap-4">
          <Heading />
          <Dictate
            id="wgo-text"
            labelledBy="wgo-title"
            describedBy={state.clarifyingQuestion ? "wgo-intro" : ["wgo-intro", errorId].filter(Boolean).join(" ")}
            placeholder={copy.whatsGoingOn.placeholder}
            value={state.text}
            maxLength={MAX_TEXT}
            invalid={!state.clarifyingQuestion && (message === "empty" || message === "retry")}
            minRows={2}
            onChange={(text) => {
              setMessage(null);
              save(whatsGoingOnStore.get(), { text });
            }}
            onSpoken={() => save(whatsGoingOnStore.get(), { spoken: true })}
          />
          {message === "empty" && !state.clarifyingQuestion && <FieldError id="wgo-empty">{copy.whatsGoingOn.empty}</FieldError>}
          {message === "retry" && (
            <div id="wgo-retry" role="alert">
              <FieldError>
                {copy.whatsGoingOn.notUnderstood.split("{link}")[0]}
                <button
                  type="button"
                  onClick={() => openForm("chosen")}
                  className="focus-ring cursor-pointer rounded-sm font-semibold text-action underline underline-offset-4"
                >
                  {copy.whatsGoingOn.notUnderstoodLink}
                </button>
                {copy.whatsGoingOn.notUnderstood.split("{link}")[1]}
              </FieldError>
            </div>
          )}
          <div role="group" aria-label={copy.whatsGoingOn.chipsLabel} className="flex flex-wrap gap-2">
            {STARTER_CHIPS.map((label) => (
              <Chip
                key={label}
                label={chipName(label)}
                icon={<ConcernIcon label={label} />}
                selected={state.chips.includes(label)}
                onToggle={() => {
                  setMessage(null);
                  save(whatsGoingOnStore.get(), { chips: toggleChip(whatsGoingOnStore.get().chips, label) });
                }}
              />
            ))}
          </div>

          {state.clarifyingQuestion && (
            <Card className="rise gap-3">
              {/* The AI's one clarifying question, shown as plain text */}
              <label htmlFor="wgo-answer" className="text-question font-semibold text-ink">
                {state.clarifyingQuestion}
              </label>
              <Dictate
                id="wgo-answer"
                describedBy={message === "empty" ? "wgo-empty" : undefined}
                value={state.clarifyingAnswer ?? ""}
                maxLength={MAX_TEXT}
                minRows={1}
                invalid={message === "empty"}
                onChange={(clarifyingAnswer) => {
                  setMessage(null);
                  save(whatsGoingOnStore.get(), { clarifyingAnswer });
                }}
              />
              {message === "empty" && <FieldError id="wgo-empty">{copy.whatsGoingOn.empty}</FieldError>}
            </Card>
          )}
        </form>
      )}
    </Screen>
  );
}

// The simple form, when the AI is down or slow, a limit is reached, or the
// patient chooses it: Legion's conditions list, then their three needs
// options, one question at a time (Claude Design's U12)
function SimpleForm({ state }: { state: WhatsGoingOnState }) {
  const router = useRouter();
  const [question, setQuestion] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<{ conditions?: boolean; need?: boolean }>({});
  const form = state.form ?? { reason: "chosen" as const, conditions: [] };

  useLayoutEffect(
    () => () => {
      setErrors({});
      setQuestion(1);
    },
    [],
  );

  const update = (patch: Partial<NonNullable<WhatsGoingOnState["form"]>>) => {
    save(state, { form: { ...form, ...patch } });
    setErrors((current) => ({
      conditions: "conditions" in patch ? false : current.conditions,
      need: "need" in patch ? false : current.need,
    }));
  };

  const toNeeds = () => {
    if (form.conditions.length === 0) {
      setErrors({ conditions: true });
      return;
    }
    setQuestion(2);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (question === 1) {
      toNeeds();
      return;
    }
    if (!form.need) {
      setErrors({ need: true });
      return;
    }
    const need = form.need;
    // "I already have a diagnosis" covers what they chose; otherwise the
    // confirm screen asks for each
    const concerns = form.conditions.map((label) => ({
      label,
      quote: "",
      diagnosed: need === "medication_support" ? ("yes" as const) : ("not_sure" as const),
    }));
    const understanding: Understanding = {
      status: "ok",
      clarifying_question: null,
      concerns,
      diagnosed: overallDiagnosed(concerns),
      need,
      eligibility_flags: [],
      chips: form.conditions.map((label) => ({ label, display: copy.conditions[label] })),
    };
    track("portal.concern.submitted", { mode: "form" });
    save(state, { understanding, confirmChips: understanding.chips, diagnoses: {} });
    router.push("/join/confirm");
  };

  return (
    <Screen
      flow={FLOW}
      width="picker"
      footer={
        <div className="flex flex-col items-stretch gap-1">
          <Button type="submit" form="wgo-simple-form" className="w-full">
            {copy.common.continue}
          </Button>
          {question === 2 && (
            <Button variant="text" onClick={() => setQuestion(1)}>
              {copy.whatsGoingOn.backToFirst}
            </Button>
          )}
        </div>
      }
    >
      <p role="note" className="flex items-start gap-2 rounded-tile bg-tint px-4 py-3 text-body text-navy">
        <Info size={20} className="mt-0.5 flex-none text-action" />
        {copy.whatsGoingOn.formNote}
      </p>
      <form id="wgo-simple-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
        {question === 1 ? (
          <Card className="gap-3">
            <fieldset aria-describedby={errors.conditions ? "form-conditions-error" : undefined} className="flex flex-col gap-3">
              <legend className="mb-3 text-question font-semibold text-ink">{copy.whatsGoingOn.formConditions}</legend>
              <div className="flex flex-wrap gap-2">
                {CONCERN_LABELS.map((label) => (
                  <Chip
                    key={label}
                    label={copy.conditions[label]}
                    icon={<ConcernIcon label={label} />}
                    selected={form.conditions.includes(label)}
                    error={errors.conditions}
                    onToggle={() => update({ conditions: toggleChip(form.conditions, label) })}
                  />
                ))}
              </div>
              {errors.conditions && <FieldError id="form-conditions-error">{copy.join.errors.required}</FieldError>}
            </fieldset>
          </Card>
        ) : (
          <Card className="rise gap-3">
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
            {errors.need && <FieldError>{copy.join.errors.required}</FieldError>}
          </Card>
        )}
      </form>
    </Screen>
  );
}
