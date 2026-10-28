# Build brief: [feature name]

For Claude Code. This is a spec, not a discussion. Everything here is decided. Anything undecided is marked OPEN QUESTION and comes back to Lily unanswered.

## 0. Before writing code

Working directory: `~/Projects/[repo]`. Run and report: `pwd`, `node --version`, `gh auth status`, `vercel whoami`, `git status`. If gh or vercel isn't logged in, stop and say so.

## 1. What this is

- **User:** [who]
- **Job:** [what they're trying to do]
- **The one metric:** [definition, with numerator and denominator]
- **Graded hardest:** [the requirement most of the time goes to]

## 2. Hard rules

- **Don't build:** [their exclusions] plus [ours]
- **Language:** [terms we must not overclaim]
- **Copy:** every user-facing string comes from section 6

## 3. Data model

[tables, columns, constraints, indexes, row-level security, as SQL in a committed migration]

## 4. Screens and flows

[each screen: what it shows, empty state, error state, loading state]

## 5. Events to track

[event name, when it fires, properties. Enough to compute the one metric]

## 6. Copy

[every string, exactly as it should appear]

## 7. PR plan

Ship in this order, one PR each:

- PR 1: scaffold, env, deploy a blank page to a preview URL
- PR 2: schema and policies
- PR 3: [core flow]
- PR 4: [states: empty, error, loading]
- PR 5: event tracking
- PR 6: [second requirement]
- PR 7: polish from the review

## 8. Verification

[the checks, each observed two ways]

## 9. Return to Lily

Live URL, PR list with preview links, anything implemented differently from this brief and why, OPEN QUESTIONs. Don't write the README.
