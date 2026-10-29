"""Rough sizing for a 50/50 test of the new onboarding against the current flow.

Usage:
    python3 analysis/test_plan.py

Traffic and baselines come from Legion's funnel CSV (sessions, rolling 30
days to Aug 29, 2026). Two-sided test, alpha 0.05, power 0.80, standard
two-proportion sample size. Standard library only.

First-visit completion has no baseline today (nothing after the payment page
is measured), so its rows use assumed baselines and say so. The real baseline
comes from the first 30 days of measurement.
"""
import csv
import math
from pathlib import Path
from statistics import NormalDist

CSV_PATH = Path(__file__).parent / "data" / "legion_funnel_30d_to_2026-08-29.csv"
ALPHA, POWER = 0.05, 0.80
LIFTS = [0.02, 0.03, 0.05]  # absolute percentage-point lifts to detect
ASSUMED_FIRST_VISIT_BASELINES = [0.10, 0.15, 0.20]  # assumptions, not data
WINDOW_DAYS = 30  # first visit must be completed within 30 days of starting


def n_per_arm(p1: float, p2: float) -> int:
    z_a = NormalDist().inv_cdf(1 - ALPHA / 2)
    z_b = NormalDist().inv_cdf(POWER)
    p_bar = (p1 + p2) / 2
    num = (z_a * math.sqrt(2 * p_bar * (1 - p_bar)) + z_b * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2
    return math.ceil(num / (p2 - p1) ** 2)


def table(label: str, baseline: float, daily_entrants: float, note: str = "") -> None:
    per_arm_daily = daily_entrants / 2
    print(f"\n{label}")
    print(f"   Baseline {baseline:.1%}; {daily_entrants:.0f} entrants a day, {per_arm_daily:.0f} per arm{note}")
    for lift in LIFTS:
        n = n_per_arm(baseline, baseline + lift)
        days = math.ceil(n / per_arm_daily)
        print(f"   +{lift * 100:.0f} points: {n:,} per arm, about {days} days of traffic")


def main() -> None:
    with CSV_PATH.open(newline="") as f:
        s = {r["phase"]: int(r["sessions"]) for r in csv.DictReader(f)}
    days = 30

    print("Rough test plan: 50/50, two-sided, alpha 0.05, power 0.80. Sessions, not patients.")
    table("1. Reach the payment page (leading indicator, measurable today)",
          s["Payment page"] / s["Start"], s["Start"] / days)
    table("2. Match page to provider selected (the 36.6% drop)",
          s["Provider selected"] / s["Provider match"], s["Provider match"] / days)
    table("3. Fit check to conditions (the 34.8% drop; includes screen-outs)",
          s["Conditions"] / s["Fit check"], s["Fit check"] / days)
    for b in ASSUMED_FIRST_VISIT_BASELINES:
        table(f"4. First-visit completion, ASSUMED baseline {b:.0%}",
              b, s["Start"] / days,
              f". Add {WINDOW_DAYS} days after enrolment ends for the last starters' window to close")


if __name__ == "__main__":
    main()
