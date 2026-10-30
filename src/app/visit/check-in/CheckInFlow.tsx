"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { cx } from "@/components/cx";
import { copy } from "@/copy";
import type { CheckInTurn } from "@/lib/ai/check-in";
import { type CheckInState, checkInStore, nextMessageId } from "@/lib/check-in/stored";
import { slowStage } from "@/lib/whats-going-on/flow";
import { useSpeech } from "@/app/join/whats-going-on/useSpeech";
import { track } from "@/lib/analytics/track";
import { finishCheckIn, sendTurns } from "./actions";
import { MedicationCheck } from "./MedicationCheck";

// The check-in, one question at a time. Its state lives in this browser tab
// (src/lib/check-in/stored.ts), so it survives the crisis screen and the
// clinician view can read it on the same device

const MAX_TEXT = 2000;

const save = (patch: Partial<CheckInState>) => checkInStore.save({ ...checkInStore.get(), ...patch });

export function CheckInFlow({ provider }: { provider: string }) {
  const state = useSyncExternalStore(checkInStore.subscribe, checkInStore.get, checkInStore.getServer);

  // A new visit's check-in starts fresh; the provider is kept for the
  // clinician view's title
  useEffect(() => {
    if (checkInStore.get().provider !== provider) save({ provider });
  }, [provider]);

  if (!state) return <div aria-hidden="true" className="h-40 rounded-lg bg-wash motion-safe:animate-pulse" />;
  if (state.stage === "done") return <Finished text={copy.checkIn.done} />;
  if (state.stage === "stopped") return <Finished text={copy.checkIn.under18} />;
  if (state.stage === "medications") return <MedicationCheck state={state} onDone={finishCheckIn} />;
  return state.form ? <SimpleForm state={state} /> : <QuestionStep state={state} />;
}

function Finished({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-start gap-6">
      <p role="status" className="text-lg">
        {text}
      </p>
      <ButtonLink href="/visit">{copy.checkIn.backToVisit}</ButtonLink>
    </div>
  );
}

function QuestionStep({ state }: { state: CheckInState }) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [pending, setPending] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [failed, setFailed] = useState(false);
  const request = useRef<AbortController | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  // Next keeps this page alive when people move on. Stop what was in
  // progress as it's hidden, and clear the box
  useLayoutEffect(
    () => () => {
      request.current?.abort();
      setPending(false);
      setAnswer("");
      setFailed(false);
    },
    [],
  );

  useEffect(() => {
    for (const path of ["/help-now", "/help-now/immediate-danger", "/help-now/being-hurt"]) router.prefetch(path);
  }, [router]);

  useEffect(() => {
    if (!pending) return;
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Date.now() - started), 250);
    return () => clearInterval(timer);
  }, [pending]);

  const speech = useSpeech((spoken) => setAnswer((current) => [current.trim(), spoken].filter(Boolean).join(" ").slice(0, MAX_TEXT)));

  const send = async (turns: CheckInTurn[]) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setFailed(false);
    try {
      const effect = await sendTurns(turns, { signal: controller.signal });
      setAnswer("");
      if (effect.to === "crisis") {
        router.push(effect.path);
        return;
      }
      field.current?.focus();
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error(error);
      setFailed(true);
    } finally {
      if (request.current === controller) setPending(false);
    }
  };

  const submit = (skipped: boolean) => {
    speech.stop();
    const text = answer.trim();
    const turn = { id: nextMessageId(state.turns), question: state.question, answer: skipped ? "" : text, skipped: skipped || !text };
    void send([...state.turns, turn]);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(false);
  };

  const stage = pending ? slowStage(elapsed) : "waiting";
  const answeredCount = state.turns.length;

  return (
    <div className="flex flex-col gap-6">
      <div
        role="progressbar"
        aria-label={copy.checkIn.progress}
        aria-valuemin={0}
        aria-valuemax={copy.checkIn.questions.length}
        aria-valuenow={Math.min(answeredCount, copy.checkIn.questions.length)}
        className="h-1.5 w-full rounded-full bg-wash"
      >
        <div
          className="h-full rounded-full bg-action"
          style={{ width: `${(Math.min(answeredCount, copy.checkIn.questions.length) / copy.checkIn.questions.length) * 100}%` }}
        />
      </div>

      {state.note && <InlineNoteText note={state.note} />}

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        {pending ? (
          <div aria-hidden="true" className="h-7 w-3/4 rounded-md bg-wash motion-safe:animate-pulse" />
        ) : (
          // The AI's question, shown as plain text
          <label htmlFor="check-in-answer" className="text-xl font-medium text-ink">
            {state.question}
          </label>
        )}
        <div className="relative">
          <textarea
            id="check-in-answer"
            ref={field}
            aria-label={pending ? copy.checkIn.answerLabel : undefined}
            placeholder={copy.checkIn.placeholder}
            value={answer}
            maxLength={MAX_TEXT}
            rows={4}
            disabled={pending}
            onChange={(event) => setAnswer(event.target.value)}
            className={cx(
              "focus-ring w-full rounded-lg border border-line-control bg-white p-4 text-base text-ink",
              speech.supported && "pb-14",
            )}
          />
          {speech.supported && (
            <Button
              variant="secondary"
              size="small"
              className="absolute right-3 bottom-4"
              aria-pressed={speech.listening}
              disabled={pending}
              onClick={speech.listening ? speech.stop : speech.start}
            >
              {speech.listening ? copy.whatsGoingOn.listening : copy.checkIn.speak}
            </Button>
          )}
        </div>

        {failed && (
          <p role="alert" className="text-error">
            {copy.common.somethingWentWrong}
          </p>
        )}

        <div className="flex flex-col items-start gap-1">
          <Button type="submit" disabled={pending}>
            {copy.checkIn.next}
          </Button>
          <Button variant="text" disabled={pending} onClick={() => submit(true)}>
            {copy.checkIn.skipQuestion}
          </Button>
          {pending && (
            <p role="status" className="text-slate">
              {stage !== "waiting" ? copy.whatsGoingOn.stillWorking : ""}
            </p>
          )}
          {stage === "offer_form" && (
            <Button
              variant="text"
              onClick={() => {
                request.current?.abort();
                setPending(false);
                save({ form: true, note: null });
              }}
            >
              {copy.whatsGoingOn.useForm}
            </Button>
          )}
        </div>
      </form>

      <SkipCheckIn />
    </div>
  );
}

function InlineNoteText({ note }: { note: NonNullable<CheckInState["note"]> }) {
  const text = {
    cannot_answer: copy.checkIn.cannotAnswer,
    medication_question: copy.checkIn.medicationQuestion,
    eligibility: copy.checkIn.eligibilityNote,
    two_skips: copy.checkIn.twoSkips,
  }[note];
  return (
    <p role="status" className="rounded-lg bg-wash px-4 py-3">
      {text}
    </p>
  );
}

// "Skip the check-in": a small link at the bottom, always there. Skipping
// never blocks the visit
function SkipCheckIn() {
  return (
    <ButtonLink
      href="/visit"
      variant="text"
      size="small"
      className="self-start text-sm"
      onClick={() => track("portal.intake.skipped")}
    >
      {copy.checkIn.skipCheckIn}
    </ButtonLink>
  );
}

// The simple form, when the AI is down, slow or over a limit: the six
// starting questions on one page. The crisis layers still check every answer
function SimpleForm({ state }: { state: CheckInState }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<string[]>(() => copy.checkIn.questions.map(() => ""));
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  useLayoutEffect(
    () => () => {
      setPending(false);
      setFailed(false);
    },
    [],
  );

  const formTurns = (): CheckInTurn[] =>
    copy.checkIn.questions.map((question, i) => {
      const text = answers[i].trim();
      return { id: `m${state.turns.length + i + 1}`, question, answer: text, skipped: !text };
    });

  const send = async (turns: CheckInTurn[]) => {
    setPending(true);
    setFailed(false);
    try {
      const effect = await sendTurns([...checkInStore.get().turns, ...turns], { form: true });
      if (effect.to === "crisis") router.push(effect.path);
    } catch (error) {
      console.error(error);
      setFailed(true);
    } finally {
      setPending(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send(formTurns());
  };

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      <p className="rounded-lg bg-wash px-4 py-3">{copy.checkIn.formNote}</p>
      {copy.checkIn.questions.map((question, i) => (
        <div key={question} className="flex flex-col gap-3">
          <label htmlFor={`check-in-form-${i}`} className="text-lg font-medium text-ink">
            {question}
          </label>
          <textarea
            id={`check-in-form-${i}`}
            value={answers[i]}
            maxLength={MAX_TEXT}
            rows={3}
            onChange={(event) => setAnswers((current) => current.map((value, j) => (j === i ? event.target.value : value)))}
            className="focus-ring w-full rounded-lg border border-line-control bg-white p-4 text-base text-ink"
          />
        </div>
      ))}
      {failed && (
        <p role="alert" className="text-error">
          {copy.common.somethingWentWrong}
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {copy.checkIn.submitForm}
      </Button>
      <SkipCheckIn />
    </form>
  );
}
