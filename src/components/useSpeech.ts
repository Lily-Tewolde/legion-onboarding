"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// The mic button's speech-to-text, using the browser's built-in speech
// recognition (decided Oct 29). The AI never talks back. Browsers without it,
// like Firefox, get no mic button. Each finished phrase is handed to onText;
// the words heard so far in the current phrase are in `interim`, for live
// dictation. `problem` says why listening stopped early: the mic is blocked,
// or nothing was heard (copy audit, Oct 29). It stops by itself after a pause
// once someone has spoken, or if nothing is heard at the start (Lily's
// testing notes, Oct 30), and anything still mid-phrase is kept

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

export type SpeechProblem = "blocked" | "nothing_heard";

type RecognitionConstructor = new () => Recognition;

// Stop after this long without a new word, once something has been heard
const PAUSE_MS = 4000;
// Stop with "We didn't hear anything" if nothing is heard this soon
const NOTHING_MS = 8000;

function recognitionConstructor(): RecognitionConstructor | null {
  const speechWindow = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export function useSpeech(onText: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [problem, setProblem] = useState<SpeechProblem | null>(null);
  const recognition = useRef<Recognition | null>(null);
  const handler = useRef(onText);
  const timer = useRef<number | undefined>(undefined);
  // Words heard in the current phrase that aren't final yet
  const pending = useRef("");

  useEffect(() => {
    handler.current = onText;
  }, [onText]);

  // Stop listening when the screen is left
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      recognition.current?.stop();
    },
    [],
  );

  // Ends listening on our side. Words still mid-phrase are handed on, since
  // a browser may never send them as final once it's stopped
  const finish = useCallback((nextProblem: SpeechProblem | null) => {
    window.clearTimeout(timer.current);
    const instance = recognition.current;
    recognition.current = null;
    if (instance) {
      instance.onresult = null;
      instance.onend = null;
      instance.onerror = null;
      instance.stop();
    }
    if (pending.current) handler.current(pending.current);
    pending.current = "";
    if (nextProblem) setProblem(nextProblem);
    setListening(false);
    setInterim("");
  }, []);

  const start = useCallback(() => {
    const Constructor = recognitionConstructor();
    if (!Constructor) return;
    const instance = new Constructor();
    setProblem(null);
    pending.current = "";
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => finish("nothing_heard"), NOTHING_MS);
    instance.lang = navigator.language || "en-US";
    instance.continuous = true;
    instance.interimResults = true;
    instance.onresult = (event) => {
      let words = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) handler.current(result[0].transcript.trim());
        else words += result[0].transcript;
      }
      pending.current = words.trim();
      setInterim(pending.current);
      // A new word: wait for the next pause
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => finish(null), PAUSE_MS);
    };
    // The browser ended it (its own timeout, or a dropped connection)
    instance.onend = () => finish(null);
    instance.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed" || event.error === "audio-capture") {
        finish("blocked");
      } else if (event.error === "no-speech") {
        finish("nothing_heard");
      } else {
        finish(null);
      }
    };
    recognition.current = instance;
    instance.start();
    setListening(true);
  }, [finish]);

  // Stopped on purpose, so not "nothing heard"
  const stop = useCallback(() => finish(null), [finish]);

  const clearProblem = useCallback(() => setProblem(null), []);

  return { supported: recognitionConstructor() !== null, listening, interim, problem, clearProblem, start, stop };
}
