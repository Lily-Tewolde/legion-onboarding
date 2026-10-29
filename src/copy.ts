// Every user-facing string, from docs/copy-draft.md (Lily's edited version,
// Oct 29). One file so the readability check can read them all. Later PRs
// add each screen's strings here

export const copy = {
  shell: {
    banner: "Demo prototype: don't enter real information",
    helpLink: "Talk to a person",
  },
  helpPanel: {
    title: "Talk to a person",
    phone: "Call or text us at (555) 010-0123.",
    phoneLabel: "Demo number",
    hours: "Monday to Friday, 8 am to 6 pm Central.",
    hoursLabel: "Demo hours",
    crisis: "If you're in crisis, call or text 988 any time.",
    close: "Close",
  },
} as const;
