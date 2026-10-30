"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// The mic button's speech-to-text, using the browser's built-in speech
// recognition (decided Oct 29). The AI never talks back. Browsers without it,
// like Firefox, get no mic button. Each finished phrase is handed to onText;
// the words heard so far in the current phrase are in `interim`, for live
// dictation. `problem` says why listening stopped early: the mic is blocked,
// or nothing was heard (copy audit, Oct 29)

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

  useEffect(() => {
    handler.current = onText;
  }, [onText]);

  // Stop listening when the screen is left
  useEffect(() => () => recognition.current?.stop(), []);

  const start = useCallback(() => {
    const Constructor = recognitionConstructor();
    if (!Constructor) return;
    const instance = new Constructor();
    let heard = false;
    let failed = false;
    setProblem(null);
    instance.lang = navigator.language || "en-US";
    instance.continuous = true;
    instance.interimResults = true;
    instance.onresult = (event) => {
      let pending = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        heard = true;
        if (result.isFinal) handler.current(result[0].transcript.trim());
        else pending += result[0].transcript;
      }
      setInterim(pending.trim());
    };
    instance.onend = () => {
      if (!heard && !failed) setProblem("nothing_heard");
      setListening(false);
      setInterim("");
    };
    instance.onerror = (event) => {
      failed = true;
      if (event.error === "not-allowed" || event.error === "service-not-allowed" || event.error === "audio-capture") {
        setProblem("blocked");
      } else if (event.error === "no-speech") {
        setProblem("nothing_heard");
      }
      setListening(false);
      setInterim("");
    };
    recognition.current = instance;
    instance.start();
    setListening(true);
  }, []);

  const stop = useCallback(() => {
    // Stopped on purpose, so not "nothing heard"
    if (recognition.current) recognition.current.onend = null;
    recognition.current?.stop();
    setListening(false);
    setInterim("");
  }, []);

  const clearProblem = useCallback(() => setProblem(null), []);

  return { supported: recognitionConstructor() !== null, listening, interim, problem, clearProblem, start, stop };
}
