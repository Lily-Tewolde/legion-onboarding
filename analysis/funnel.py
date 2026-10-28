"""Step-by-step funnel conversion from an events table.

Usage:
    from funnel import funnel
    funnel(events, user_col="patient_id", step_col="event", time_col="ts",
           steps=["quiz_completed", "intake_completed", "visit_booked", "visit_completed"])

Returns one row per step: users who reached it, conversion from the previous
step, and conversion from the first step. A user counts for a step only if they
also reached every earlier step, in order. Always report the denominator.
"""
import pandas as pd


def funnel(events: pd.DataFrame, user_col: str, step_col: str, time_col: str,
           steps: list[str]) -> pd.DataFrame:
    df = events[[user_col, step_col, time_col]].copy()
    df[time_col] = pd.to_datetime(df[time_col], errors="coerce")
    first = (df[df[step_col].isin(steps)]
             .groupby([user_col, step_col])[time_col].min()
             .unstack(step_col))
    reached = pd.Series(True, index=first.index)
    prev_time = None
    rows = []
    for step in steps:
        t = first.get(step)
        if t is None:
            reached = reached & False
        else:
            ok = t.notna()
            if prev_time is not None:
                ok = ok & (t >= prev_time)
            reached = reached & ok
            prev_time = t.where(reached)
        rows.append({"step": step, "users": int(reached.sum())})
    out = pd.DataFrame(rows)
    out["from_previous"] = (out["users"] / out["users"].shift(1)).round(3)
    out["from_first"] = (out["users"] / out["users"].iloc[0]).round(3) if len(out) and out["users"].iloc[0] else None
    return out
