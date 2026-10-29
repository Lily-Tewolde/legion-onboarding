# Design

The design rules for the build. Copied from the parts of Lily's `Design fundamentals.md` (Oct 28) that the build uses, plus the tokens and components as built in PR 1. Code: `src/app/globals.css` (tokens), `src/components/` (components and the page shell).

## Principles (Lily's)

- Simple and sleek, very user-focused. Patients can be up to 65, so it has to read easily for older users
- Follow Apple's interface guidelines and Atlassian's design rules
- Desktop gives the task the full page. No split screen, no testimonial panel inside the flow
- Calm colour. No red for normal answers, no expanding colour cards. Red only for errors and the crisis path
- One progress style for the whole flow
- No AI markers per screen. One AI notice at the start, a "Talk to a person" help link on every screen, a demo banner on every screen
- Hint text under a question, not expanding cards. Skeleton loading, not loading text

## Colour

Legion's palette, read from the computed styles of legionhealth.com (Oct 28). Tailwind's default colours are switched off, so these are the only colours in the build.

| Token | Value | Use | Contrast |
|---|---|---|---|
| `ink` | #000614 | Main text | 20.3:1 on white |
| `navy` | #061B4D | Deep accents, text on `wash` | 16.5:1 on white, 14.7:1 on `wash` |
| `brand` | #3E70F7 | Legion's blue. Large text and decoration only | 4.3:1 with white: fails for normal text |
| `action` | #2F5FE0 | Button fills, text links, selected states, focus ring | 5.5:1 with white, 4.9:1 on `wash` |
| `action-hover` | #244CC0 | Hover on buttons and links | 7.3:1 with white |
| `slate` | #607086 | Secondary and hint text | 5.1:1 on white, 4.5:1 on `wash` |
| `wash` | #EEF2FC | Soft panels, the banner, selected fills | Background only |
| `pale` | #B6D3EA | Decoration only | Background only |
| `line` | #DCE2EA | Dividers | Decoration only (1.3:1) |
| `line-control` | #7D879A | Borders of anything you tap, the switch track when off | 3.6:1 on white |
| `error` | #DC2626 | Errors and the crisis path only | 4.8:1 on white |

- **Why a darker blue:** white on Legion's #3E70F7 measures 4.3:1, just under the 4.5:1 normal text needs. #2F5FE0 keeps the look and passes. An accessibility improvement worth naming in the readout
- **Why a darker control border:** Inspo Book 01's border grey (#DCE2EA) is 1.3:1 on white. Apple and WCAG ask for 3:1 for controls and selection states, so tappable things use `line-control`
- **Where the error red comes from:** Legion's public palette has no red, so it's Inspo Book 01's negative text colour
- Amber (#EAAF27, Legion's rating stars) isn't used: 2.0:1 on white

## Type

- **Inter** for body text, **Inter Display** for headings. Both SIL Open Font License. Loaded with `next/font/google` with Inter's optical size axis: optical size 32 is Inter Display, so headings set `font-variation-settings: "opsz" 32` and no font files are self-hosted
- Body 16px (1rem), line height 1.5, regular weight. Question labels 18px, medium. Fine print (tags, the banner) 14px. All in rem, so text scales with the browser's text size
- Headings semibold (600) on regular (400) body, Lily's call between Legion's 500 and Atlassian's bold. Line height 1.25, letter spacing -0.01em. Never smaller than body or more than twice body: 32px at most
- Lines of 60 to 80 characters: the task column is 40rem wide
- No all caps. Never truncate text without a way to read it all. Use correct heading levels
- No Satoshi: its licence rules out a public repo

## Spacing and sizes

- **Spacing:** Atlassian's 8px base, on Tailwind's 4px steps. The scale 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px is `0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20`. 0 to 8px inside components, 12 to 24px between related items, 32 to 80px for page layout. Related items sit closer than unrelated ones
- **Control heights** (Inspo Book 01): `h-control` 54px for main buttons and segmented controls; `h-control-sm` 44px for small buttons, chips and list rows. Inspo's small size is 42px, raised to 44 for Apple's tap target minimum
- **Tap targets:** at least 44 x 44px, including the help link and the switch row
- **Radii** (Inspo Book 01): 2, 4, 8, 12px, 16px for cards and the help panel, full for pills
- **Shadows** (Inspo Book 01): `shadow-card`, `shadow-float` (the help panel)
- **Focus ring** (Inspo Book 01): 2px `action` with a 2px gap, drawn as an outline so it shows in forced-colour modes. `focus-ring` utility
- **Motion** (Inspo Book 01): 150ms for small state changes, 200ms for buttons and the progress bar. Colour and position only, and off when the system asks for reduced motion

## Components

Adapted from Lily's own design library (Inspo Book 01): its structure, sizes, radii, focus ring and motion, rebuilt on Legion's colours and Inter. Only what the build uses. README credit: "Components adapted from my own design library (Inspo Book 01)."

| Component | File | Changes from Inspo Book 01 |
|---|---|---|
| Button | `Button.tsx` | Primary and secondary, large (54px) and small (44px). Primary is `action` blue, not black. Pill shape kept. Small text 16px, not 14. No rotating light ring and no arrow icon, to keep it calm |
| Chip | `Chip.tsx` | The filter chip only. 16px text, 44px tall (was 9px text). Selected: `wash` fill, `action` border and a tick, so the state doesn't rely on colour alone |
| SegmentedControl | `SegmentedControl.tsx` | Native radio inputs instead of `role="radio"` buttons, so arrow keys and forms work. 54px segments. The question is the legend, with optional hint and error text |
| Switch | `Switch.tsx` | For settings only. Track 44 x 26px (was 18 x 10). `action` when on, `line-control` when off. The whole row is a 44px tap target |
| Checkbox | `Checkbox.tsx` | Not in Inspo Book 01. For choices inside the flow: "Tell me if an earlier time opens", the consent and "I'm safe right now and want to keep going". A native checkbox drawn as a 24px box (`line-control` border, `action` fill and a white tick when checked) in a 44px row, with optional error text. The label can hold a link |
| List | `List.tsx` | A choose-one list on native radio inputs (Inspo's is a nav list). 44px rows, 16px text, optional second line. The chosen row keeps Inspo's left bar, in `action` |
| Tag | `Tag.tsx` | Sentence case, 14px (was all caps, 9px). For on-screen labels like "Demo: payment simulated" |

Left out of the repo: Tabs, UnitToggle, NavLink, LiveIndicator, FeatureCard, ActionNode, MockWindow, GridBackground, IconButton (until a screen needs it), and the Satoshi font.

## Page shell

Every screen, from the root layout (`src/app/layout.tsx`):

- **Demo banner** (`DemoBanner.tsx`): "Demo prototype: don't enter real information", full width at the top, `navy` on `wash`
- **Header:** "Legion Health" as plain text on the left, `navy` semibold. No logo
- **Help link** (`HelpPanel.tsx`): "Talk to a person", on the right of the header. Opens the help panel, a native dialog that traps focus, closes on Escape, on "Close" or on a tap outside, and returns focus to the link. Centred on larger screens; on phones (under 640px) it slides up from the bottom, with no slide when the system asks for reduced motion. The phone number and 988 are tap-to-call links with 44px tap areas. The 988 line sits in a soft `wash` box: prominent but not alarming, no red
- **Task column:** one centred column, 40rem wide, 16px side gutters. No split screen
- **Progress** (`ProgressBar.tsx`): the one progress style. "Step 2 of 4" in small `slate` text above a thin `action` bar on a `wash` track. On the booking screens only, ending at "You're booked". Screens place it at the top of the column. The same text is the screen reader label
- **Tab title and icon:** "Legion Health · Prototype". The favicon is a plain neutral mark (a white dot on `slate`), not Legion's logo
- **`/design`:** a reference page with every token and component, for checking on the live link. Not part of the patient flow and not indexed

All shell strings live in `src/copy.ts`.

## Sources

- Lily's `Design fundamentals.md`, Oct 28
- Apple: UI design dos and don'ts, https://developer.apple.com/design/tips/
- Apple: Sufficient contrast evaluation criteria, https://developer.apple.com/help/app-store-connect/manage-app-accessibility/sufficient-contrast-evaluation-criteria
- Atlassian: Spacing, https://atlassian.design/foundations/spacing
- Atlassian: Applying typography, https://atlassian.design/foundations/typography/applying-typography
- Legion Health homepage, https://legionhealth.com/ (computed styles, read once Oct 28)
