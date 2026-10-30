"use client";

import { useSyncExternalStore } from "react";
import { NoticeText } from "@/components/Notice";
import { copy } from "@/copy";
import { crisisFromStore } from "@/lib/whats-going-on/stored";

// "We want to make sure you're okay.", only when the crisis came from
// something the patient typed or said, not from the safety question
export function FromFreeText() {
  const crisis = useSyncExternalStore(crisisFromStore.subscribe, crisisFromStore.get, crisisFromStore.getServer);
  return crisis && crisis.from !== "safety_question" ? <NoticeText>{copy.crisis.fromText}</NoticeText> : null;
}
