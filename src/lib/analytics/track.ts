"use client";

import posthog from "posthog-js";
import { type RefObject, useEffect } from "react";
import type { EventName, EventProperties, LegionPath } from "./events";

// Sends events to PostHog (US Cloud) from the browser. Set up in
// src/instrumentation-client.ts with autocapture, session recording and every
// other automatic capture turned off, so only these named events are sent.
// Without a key (local runs, tests) nothing is sent

const enabled = () => typeof window !== "undefined" && Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY) && posthog.__loaded;

export function track<K extends EventName>(event: K, ...properties: EventProperties[K] extends Record<string, never> ? [] : [EventProperties[K]]) {
  capture(event, properties[0]);
}

function capture<K extends EventName>(event: K, properties?: EventProperties[K]) {
  if (!enabled()) return;
  posthog.capture(event, properties ?? {});
}

// Legion's page views keep their /portal/join paths, so the funnels compare
export function trackPageview(path: LegionPath) {
  if (!enabled()) return;
  posthog.capture("$pageview", { $current_url: `${window.location.origin}${path}`, $pathname: path });
}

// Links later events to the made-up person once their details are saved
export function identify(personId: string) {
  if (!enabled()) return;
  posthog.identify(personId);
}

// "Start over" in Demo controls: the next run is a new person in the funnel
export function forget() {
  if (!enabled()) return;
  posthog.reset();
}

// Fires each time the screen is shown. Next keeps visited pages alive, and
// their effects run again when they're shown again
export function useTrackOnShow(fire: () => void) {
  useEffect(() => {
    fire();
    // Once per showing; the event doesn't change while it's shown
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// For screens rendered on the server: drop one in to fire when it's shown
export function TrackPageview({ path }: { path: LegionPath }) {
  useTrackOnShow(() => trackPageview(path));
  return null;
}

export function TrackEvent<K extends EventName>({ event, properties }: { event: K; properties?: EventProperties[K] }) {
  useTrackOnShow(() => capture(event, properties));
  return null;
}

// Fires once each time the section scrolls into view while the screen is
// shown, like Legion's page views for the checkout's sections
export function useTrackInView(ref: RefObject<Element | null>, fire: () => void) {
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        fire();
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
    // Once per showing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
