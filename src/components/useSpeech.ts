"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// The mic button's speech-to-text, using the browser's built-in speech
// recognition (decided Oct 29). The AI never talks back. Browsers without it,
// like Firefox, get no mic button. Each finished phrase is handed to onText;
// the words heard so far in the current phrase are in `interim`, for live
// dictation

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

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
    instance.lang = navigator.language || "en-US";
    instance.continuous = true;
    instance.interimResults = true;
    instance.onresult = (event) => {
      let pending = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) handler.current(result[0].transcript.trim());
        else pending += result[0].transcript;
      }
      setInterim(pending.trim());
    };
    instance.onend = () => {
      setListening(false);
      setInterim("");
    };
    instance.onerror = () => {
      setListening(false);
      setInterim("");
    };
    recognition.current = instance;
    instance.start();
    setListening(true);
  }, []);

  const stop = useCallback(() => {
    recognition.current?.stop();
    setListening(false);
    setInterim("");
  }, []);

  return { supported: recognitionConstructor() !== null, listening, interim, start, stop };
}
