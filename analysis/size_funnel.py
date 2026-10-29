"""Every figure in docs/data-read.md, computed from the funnel CSV.

Usage:
    python3 analysis/size_funnel.py

Reads analysis/data/legion_funnel_30d_to_2026-08-29.csv (Legion's PostHog
funnel, rolling 30 days ending Aug 29, 2026). All figures are browser
sessions per 30 days, not patients. Standard library only.

Sizing assumption, used everywhere below: if one step converts better, every
later step keeps converting at today's rate. "Reach payment" means reaching
the payment page, not a successful payment.
"""
import csv
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

CSV_PATH = Path(__file__).parent / "data" / "legion_funnel_30d_to_2026-08-29.csv"

# The three cliffs: (label, step that loses people, step it leads to)
CLIFFS = [
    ("Fit check to conditions", "Fit check", "Conditions"),
    ("Match page to provider selected", "Provider match", "Provider selected"),
    ("Patient details to account created", "Patient details", "Account created"),
]
WORKED_EXAMPLE_LIFT = 10  # percentage points, the same for every cliff so they compare
# Targets the first AI draft of the data read used, kept to show why its comparison misled
AI_DRAFT_TARGETS = {"Fit check": 75, "Provider match": 80, "Patient details": 90}


def r1(x: float) -> Decimal:
    return Decimal(str(x)).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)


def r0(x: float) -> int:
    return int(Decimal(str(x)).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def main() -> None:
    with CSV_PATH.open(newline="") as f:
        rows = list(csv.DictReader(f))
    sessions = {r["phase"]: int(r["sessions"]) for r in rows}
    order = [r["phase"] for r in rows]
    start, payment = sessions[order[0]], sessions[order[-1]]

    print("1. HEADLINE")
    print(f"   {start:,} sessions start, {payment:,} reach the payment page ({r1(payment / start * 100)}%)")

    print("\n2. EVERY STEP-TO-STEP DROP, RANKED")
    drops = []
    for prev, cur in zip(order, order[1:]):
        lost = sessions[prev] - sessions[cur]
        drops.append((f"{prev} -> {cur}", lost, lost / sessions[prev] * 100))
    print("   By sessions lost:")
    for i, (name, lost, rate) in enumerate(sorted(drops, key=lambda d: -d[1]), 1):
        print(f"   {i:>2}. {name:<42} {lost:>5,} lost ({r1(rate)}%)")
    print("   By rate:")
    for i, (name, lost, rate) in enumerate(sorted(drops, key=lambda d: -d[2]), 1):
        print(f"   {i:>2}. {name:<42} {r1(rate):>5}% ({lost:,} lost)")

    print("\n3. SIZING PER CLIFF (sessions per 30 days)")
    for label, before, after in CLIFFS:
        base, reached = sessions[before], sessions[after]
        rate = reached / base * 100
        to_payment = payment / reached  # today's conversion from this step to the payment page
        per_point = base * 0.01 * to_payment
        extra_here = base * WORKED_EXAMPLE_LIFT / 100
        print(f"   {label}")
        print(f"     Today: {reached:,} of {base:,} continue ({r1(rate)}%); {r1(to_payment * 100)}% of those reach payment")
        print(f"     Per +1 point: about {r1(base * 0.01)} more continue, about {r1(per_point)} more reach payment")
        print(f"     Worked example, +{WORKED_EXAMPLE_LIFT} points ({r1(rate)}% -> {r1(rate + WORKED_EXAMPLE_LIFT)}%):"
              f" about {r0(extra_here):,} more continue, about {r0(extra_here * to_payment):,} more reach payment")

    print("\n4. THE AI DRAFT'S TARGETS (different lift per cliff, so not comparable)")
    for label, before, after in CLIFFS:
        base, reached = sessions[before], sessions[after]
        target = AI_DRAFT_TARGETS[before]
        lift = target - reached / base * 100
        extra_payment = (base * target / 100 - reached) * payment / reached
        print(f"   {label}: to {target}% is a {r1(lift)} point lift, about {r0(extra_payment):,} more reach payment")


if __name__ == "__main__":
    main()
