// Model IDs from the build brief (section 4), checked on Anthropic's models
// page on Oct 29. Changing any of these is a model change: run `npm run eval`
export const MODELS = {
  // "What's going on?" and the pre-visit check-in (PRs 5 and 8)
  steps: "claude-sonnet-5-5",
  // The separate crisis flag on every patient message
  crisisFlag: "claude-haiku-5-5",
  // The eval grader, used only by evals/
  grader: "claude-opus-5-5",
} as const;
