"""Check the funnel CSV against the figures Legion published in the brief.

Usage:
    python3 analysis/check_funnel.py

Source: the table in Legion's take-home brief. PostHog production telemetry,
rolling 30 days ending Aug 29, 2026. Unit is browser sessions, not patients.

The CSV holds the session counts and the percentages and drops as published.
This script recomputes every derived column from the session counts alone and
fails if any of them differs from the published value. Standard library only.
"""
import csv
import sys
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

CSV_PATH = Path(__file__).parent / "data" / "legion_funnel_30d_to_2026-08-29.csv"


def pct(numerator: int, denominator: int) -> Decimal:
    value = Decimal(numerator) * 100 / Decimal(denominator)
    return value.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)


def main() -> int:
    with CSV_PATH.open(newline="") as f:
        rows = list(csv.DictReader(f))

    start = int(rows[0]["sessions"])
    previous = start
    errors = []

    print(f"{'#':>2}  {'Milestone':<20} {'Sessions':>8} {'From prev':>9} {'From start':>10} {'Drop':>6} {'Drop %':>6}")
    for row in rows:
        step = row["step"]
        sessions = int(row["sessions"])
        if sessions > previous:
            errors.append(f"step {step}: sessions went up ({previous} -> {sessions})")

        computed = {
            "pct_from_previous": pct(sessions, previous),
            "pct_from_start": pct(sessions, start),
        }
        if step != "1":
            computed["drop_from_previous"] = previous - sessions
            computed["pct_drop_from_previous"] = pct(previous - sessions, previous)

        for column, value in computed.items():
            published = row[column]
            expected = Decimal(published) if "pct" in column else int(published)
            if value != expected:
                errors.append(f"step {step} {column}: published {published}, recomputed {value}")

        print(
            f"{step:>2}  {row['phase']:<20} {sessions:>8,} {computed['pct_from_previous']:>8}% "
            f"{computed['pct_from_start']:>9}% {computed.get('drop_from_previous', ''):>6} "
            f"{str(computed.get('pct_drop_from_previous', '')) + ('%' if step != '1' else ''):>6}"
        )
        previous = sessions

    end = int(rows[-1]["sessions"])
    print(f"\nHeadline: {start:,} sessions start, {end:,} reach the payment page ({pct(end, start)}%).")

    if errors:
        print(f"\nFAIL: {len(errors)} mismatch(es)")
        for e in errors:
            print(f"  - {e}")
        return 1
    print(f"\nPASS: all derived figures in {len(rows)} rows match the brief.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
