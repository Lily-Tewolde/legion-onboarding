"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { track } from "@/lib/analytics/track";

// "Book {day} at {time}": holds the chosen provider and time in the session
// and opens the checkout (or, when rescheduling, books it straight away). If
// someone else just took the time, the times are fetched again and they're
// asked to pick another (copy audit, Oct 29)
export function useBook(recommendedId: string) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [taken, setTaken] = useState(false);

  // Next keeps this screen alive when people move on; clear what was in progress
  useLayoutEffect(
    () => () => {
      setPending(false);
      setFailed(false);
      setTaken(false);
    },
    [],
  );

  const book = async (providerId: string, slotStart: string) => {
    setPending(true);
    setFailed(false);
    setTaken(false);
    try {
      const response = await fetch("/api/join/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, slotStart }),
      });
      if (response.status === 409 && (await response.json().catch(() => ({}))).error === "slot_unavailable") {
        setTaken(true);
        setPending(false);
        router.refresh();
        return;
      }
      if (!response.ok) throw new Error(`reserve failed: ${response.status}`);
      const { path } = await response.json();
      track("portal.provider_selected", { recommended: providerId === recommendedId });
      track("portal.provider.reservation.created");
      router.push(path);
    } catch {
      setFailed(true);
      setPending(false);
    }
  };

  return { book, pending, failed, taken };
}
