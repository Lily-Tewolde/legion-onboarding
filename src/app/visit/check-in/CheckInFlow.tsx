"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { cx } from "@/components/cx";
import { Dictate } from "@/components/Dictate";
import { Card } from "@/components/Screen";
import { FieldError } from "@/components/SegmentedControl";
import { Skeleton } from "@/components/Skeleton";
import { copy } from "@/copy";
import type { CheckInTurn } from "@/lib/ai/check-in";
import { type CheckInState, checkInStore, nextMessageId } from "@/lib/check-in/stored";
import { slowStage } from "@/lib/whats-going-on/flow";
import { track } from "@/lib/analytics/track";
import { finishCheckIn, sendTurns } from "./actions";
import { CheckInScreen } from "./CheckInScreen";
import { MedicationCheck } from "./MedicationCheck";

// The check-in, one question at a time. Its state lives in this browser tab
// (src/lib/check-in/stored.ts), so it survives the crisis screen and the
// clinician view can read it on the same device

const MAX_TEXT = 1000;

const save = (patch: Partial<CheckInState>) => checkInStore.save({ ...checkInStore.get(), ...patch });

export function CheckInFlow({ provider }: { provider: string }) {
  const state = useSyncExternalStore(checkInStore.subscribe, checkInStore.get, checkInStore.getServer);

  // A new visit's check-in starts fresh; the provider is kept for the
  // clinician view's title
  useEffect(() => {
    if (checkInStore.get().provider !== provider) save({ provider });
  }, [provider]);

  if (!state) {
    return (
      <CheckInScreen answered={0}>
        <Skeleton rows={1} />
      </CheckInScreen>
    );
  }
  if (state.stage === "done") return <Finished text={copy.checkIn.done} />;
  if (state.stage === "stopped") return <Finished text={copy.checkIn.under18} />;
  if (state.stage === "medications") return <MedicationCheck state={state} onDone={finishCheckIn} />;
  return state.form ? <SimpleForm state={state} /> : <QuestionStep state={state} />;
}

function Finished({ text }: { text: string }) {
  return (
    <CheckInScreen
      answered={copy.checkIn.questions.length}
      footer={
        <ButtonLink href="/visit" className="w-full">
          {copy.checkIn.backToVisit}
        </ButtonLink>
      }
    >
      <Card>
        <p role="status" className="text-body-lg font-semibold text-ink">
          {text}
        </p>
      </Card>
    </CheckInScreen>
  );
}

function QuestionStep({ state }: { state: CheckInState }) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [pending, setPending] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [failed, setFailed] = useState(false);
  // How tall the question was, so its loading shimmer keeps the card the
  // same height until the next question arrives
  const [questionHeight, setQuestionHeight] = useState<number | null>(null);
  const question = useRef<HTMLLabelElement>(null);
  const request = useRef<AbortController | null>(null);

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
      // The next question: focus its answer box
      requestAnimationFrame(() => document.getElementById("check-in-answer")?.focus());
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error(error);
      setFailed(true);
    } finally {
      if (request.current === controller) setPending(false);
    }
  };

  const submit = (skipped: boolean) => {
    if (question.current) setQuestionHeight(question.current.offsetHeight);
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
    <CheckInScreen
      answered={answeredCount}
      footer={
        <div className="flex flex-col items-stretch gap-1">
          {pending && stage !== "waiting" && (
            <p role="status" className="text-center text-body text-slate">
              {copy.whatsGoingOn.stillWorking}
            </p>
          )}
          <Button type="submit" form="check-in-form" disabled={pending} className="w-full">
            {copy.checkIn.next}
          </Button>
          {stage === "offer_form" ? (
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
          ) : (
            <Button variant="text" disabled={pending} onClick={() => submit(true)}>
              {copy.checkIn.skipQuestion}
            </Button>
          )}
          <SkipCheckIn />
        </div>
      }
    >
      {state.note && <InlineNoteText note={state.note} />}
      <Card className="gap-3">
        <form id="check-in-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
          {pending ? (
            <QuestionShimmer height={questionHeight} />
          ) : (
            // The AI's question, shown as plain text
            <label ref={question} htmlFor="check-in-answer" className="text-question font-semibold text-ink md:text-card-question">
              {state.question}
            </label>
          )}
          <Dictate
            id="check-in-answer"
            label={pending ? copy.checkIn.answerLabel : undefined}
            placeholder={copy.checkIn.placeholder}
            value={answer}
            maxLength={MAX_TEXT}
            minRows={3}
            maxRows={7}
            disabled={pending}
            onChange={setAnswer}
          />
          {failed && (
            <div role="alert">
              <FieldError>{copy.common.somethingWentWrong}</FieldError>
            </div>
          )}
        </form>
      </Card>
    </CheckInScreen>
  );
}

// One shimmer line per line of the question it stands in for, at the same
// height, so the card doesn't shrink and grow back between questions
const QUESTION_LINE = 28;

function QuestionShimmer({ height }: { height: number | null }) {
  const lines = Math.max(1, Math.round((height ?? QUESTION_LINE) / QUESTION_LINE));
  return (
    <div aria-hidden="true" className="flex flex-col justify-center gap-2" style={{ minHeight: height ?? undefined }}>
      {Array.from({ length: lines }, (_, line) => (
        <div key={line} className={cx("shimmer h-5 rounded-full", line === lines - 1 ? "w-1/2" : "w-full")} />
      ))}
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
    <p role="status" className="rise rounded-tile bg-tint px-4 py-3 text-body text-navy">
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
      className="min-h-control-sm self-center text-label! font-medium! text-slate! underline underline-offset-4"
      onClick={() => track("portal.intake.skipped")}
    >
      {copy.checkIn.skipCheckIn}
    </ButtonLink>
  );
}

// The simple form, when the AI is down, slow or over a limit: the six
// starting questions on one page. The crisis layers still check every answer
// The simple form, when the AI is down, slow or over a limit: the six
// starting questions, one at a time so each fits on a phone. The crisis
// layers still check every answer when they're sent
function SimpleForm({ state }: { state: CheckInState }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<string[]>(() => copy.checkIn.questions.map(() => ""));
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const last = index === copy.checkIn.questions.length - 1;

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
    if (!last) {
      setIndex(index + 1);
      return;
    }
    void send(formTurns());
  };

  return (
    <CheckInScreen
      answered={state.turns.length + index}
      footer={
        <div className="flex flex-col items-stretch gap-1">
          <Button type="submit" form="check-in-simple-form" disabled={pending} className="w-full">
            {last ? copy.checkIn.submitForm : copy.checkIn.next}
          </Button>
          {index > 0 && (
            <Button variant="text" onClick={() => setIndex(index - 1)}>
              {copy.common.back}
            </Button>
          )}
          <SkipCheckIn />
        </div>
      }
    >
      <p role="note" className="rounded-tile bg-tint px-4 py-3 text-body text-navy">
        {copy.checkIn.formNote}
      </p>
      <Card className="gap-3">
        <form id="check-in-simple-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
          <label htmlFor={`check-in-form-${index}`} className="text-question font-semibold text-ink">
            {copy.checkIn.questions[index]}
          </label>
          <Dictate
            key={index}
            id={`check-in-form-${index}`}
            value={answers[index]}
            maxLength={MAX_TEXT}
            minRows={3}
            maxRows={7}
            onChange={(value) => setAnswers((current) => current.map((v, j) => (j === index ? value : v)))}
          />
          {failed && (
            <div role="alert">
              <FieldError>{copy.common.somethingWentWrong}</FieldError>
            </div>
          )}
        </form>
      </Card>
    </CheckInScreen>
  );
}
