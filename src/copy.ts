// Every user-facing string, from docs/copy-draft.md (Lily's edited version,
// Oct 29). One file so the readability check can read them all. Later PRs
// add each screen's strings here. {curly braces} are filled in by the app

export const copy = {
  shell: {
    tabTitle: "Legion Health · Prototype",
    name: "Legion Health",
    banner: "Demo prototype: don't enter real information",
    helpLink: "Talk to a person",
  },
  helpPanel: {
    title: "Talk to a person",
    // {number} is the tap-to-call link
    phone: "Call or text us at {number}.",
    phoneNumber: "(555) 010-0123",
    phoneLabel: "Demo number",
    hours: "Monday to Friday, 8 am to 6 pm Central.",
    hoursLabel: "Demo hours",
    crisis: "If you're in crisis, call or text {number} any time.",
    crisisNumber: "988",
    close: "Close",
  },
  progress: {
    step: "Step {step} of {total}",
  },
} as const;

export const fillCopy = (
  template: string,
  values: Record<string, string | number>,
) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
