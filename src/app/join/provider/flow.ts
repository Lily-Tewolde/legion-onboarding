// The provider screens' place in the progress. Kept out of the "use client"
// files, since a server page importing a value from one gets a reference,
// not the value, and its loading screen showed no phase
export const PROVIDER_FLOW = { phase: "your_provider" as const, part: 1, parts: 1, back: "/join/confirm" };
