import posthog from "posthog-js";

// PostHog (US Cloud) for the events in the build brief, section 5. Only the
// named events in src/lib/analytics are sent: no autocapture, no session
// recording, no heatmaps, no surveys, no IP address, and nothing loaded from
// PostHog's servers. No free text ever goes in an event
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (key) {
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    person_profiles: "identified_only",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    capture_dead_clicks: false,
    capture_exceptions: false,
    capture_performance: false,
    enable_heatmaps: false,
    disable_session_recording: true,
    disable_surveys: true,
    disable_product_tours: true,
    disable_conversations: true,
    disable_external_dependency_loading: true,
    advanced_disable_flags: true,
    mask_all_text: true,
    ip: false,
  });
}
