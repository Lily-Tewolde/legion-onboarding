"""Profile every data file Legion sends, in one command.

Usage:
    python analysis/profile_data.py path/to/data_folder
    python analysis/profile_data.py path/to/file.csv

Writes analysis/output/profile.md: for each file, rows, columns, types, nulls,
distinct counts, date ranges and top values. Read it before deciding what to
compute. Needs pandas (pip install pandas openpyxl).
"""
import sys
import warnings
from pathlib import Path

import pandas as pd

warnings.filterwarnings("ignore", message="Could not infer format")

READERS = {
    ".csv": pd.read_csv,
    ".tsv": lambda p: pd.read_csv(p, sep="\t"),
    ".xlsx": pd.read_excel,
    ".xls": pd.read_excel,
    ".json": pd.read_json,
    ".parquet": pd.read_parquet,
}


def load(path: Path) -> dict[str, pd.DataFrame]:
    reader = READERS.get(path.suffix.lower())
    if reader is None:
        return {}
    if path.suffix.lower() in (".xlsx", ".xls"):
        sheets = pd.read_excel(path, sheet_name=None)
        return {f"{path.name} [{name}]": df for name, df in sheets.items()}
    return {path.name: reader(path)}


def try_dates(series: pd.Series) -> pd.Series | None:
    if pd.api.types.is_datetime64_any_dtype(series):
        return series
    if not (series.dtype == object or pd.api.types.is_string_dtype(series)):
        return None
    sample = series.dropna().astype(str).head(200)
    if sample.empty:
        return None
    parsed = pd.to_datetime(sample, errors="coerce")
    if parsed.notna().mean() < 0.9:
        return None
    return pd.to_datetime(series, errors="coerce")


def profile(name: str, df: pd.DataFrame) -> str:
    lines = [f"## {name}", "", f"- Rows: {len(df):,}", f"- Columns: {len(df.columns)}", ""]
    lines += ["| Column | Type | Nulls | Distinct | Range or top values |", "|---|---|---|---|---|"]
    for col in df.columns:
        s = df[col]
        nulls = f"{s.isna().mean():.0%}"
        distinct = f"{s.nunique(dropna=True):,}"
        dates = try_dates(s)
        if dates is not None and dates.notna().any():
            detail = f"{dates.min():%Y-%m-%d} to {dates.max():%Y-%m-%d}"
            kind = "date"
        elif pd.api.types.is_numeric_dtype(s):
            detail = f"min {s.min():,.2f} · median {s.median():,.2f} · max {s.max():,.2f}"
            kind = "number"
        else:
            top = s.astype(str).value_counts().head(4)
            detail = " · ".join(f"{v} ({c:,})" for v, c in top.items())
            kind = "text"
        lines.append(f"| {col} | {kind} | {nulls} | {distinct} | {detail[:120]} |")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    target = Path(sys.argv[1])
    files = sorted(p for p in target.rglob("*") if p.is_file()) if target.is_dir() else [target]
    sections = []
    for f in files:
        for name, df in load(f).items():
            sections.append(profile(name, df))
    out = Path(__file__).parent / "output"
    out.mkdir(exist_ok=True)
    report = "# Data profile\n\n" + ("\n".join(sections) or "No readable files found.\n")
    (out / "profile.md").write_text(report)
    print(report)


if __name__ == "__main__":
    main()
