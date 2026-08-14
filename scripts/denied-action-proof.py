#!/usr/bin/env python3
"""Bind /denied-action-proof to the recording it publishes. AAASM-5589.

    python3 scripts/denied-action-proof.py generate          # recording -> module
    python3 scripts/denied-action-proof.py check build       # built page vs recording
    python3 scripts/denied-action-proof.py compare BASE.json # re-record vs a baseline

Standard library only, and no network. That is what lets the CI gate run on the
runner's system `python3` with no install step, which is what keeps it cheap
enough to leave switched on. The half that needs the SDK and a real agent
framework lives in `scripts/denied-action-capture.py`, which produces the
recording by running the scenario; this script may only read that recording back
and compare it against what shipped. Keeping the producer out of here means the
checker cannot manufacture the numbers it is checking.

Two artifacts, one `generate` run
---------------------------------
RECORDING is the checked-in output of a real run and the reference every
comparison is made against. It stays JSON so reading it back is `json.loads`:
`prettier` rewrites the TypeScript module to single-quoted, unquoted-key TS,
which is valid TypeScript and is not valid JSON.

MODULE is what the page imports, rendered from RECORDING in the same run. The
page therefore cannot render a number the recording does not carry, and `check`
proves the shipped HTML still renders that module.

Why the display strings are computed here and not in the page
-------------------------------------------------------------
`observedSideEffect: false` becomes the word `absent` exactly once, in this
file. If the page did that mapping, a page edit could turn a `false` into
"absent" for one row and "not written" for another, and the check -- which reads
the shipped text -- would have to know both spellings. One spelling, generated,
means any drift between the run and the page is a comparison failure rather than
a wording judgement.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parent.parent
RECORDING = REPO / "metadata" / "denied-action-proof.json"
MODULE = REPO / "src" / "generated" / "denied-action-proof.ts"
ROUTE = "denied-action-proof"

#: The exact column headings the page must render. These strings are the binding
#: contract between the page and this checker: `check` locates a table by an
#: exact heading cell and fails loudly if it finds zero or more than one, so a
#: heading reworded on the page fails here instead of silently comparing nothing.
HEADING_ARMS = "Run"
HEADING_DECISION = "Decision field"

#: Provenance and scenario values that must appear somewhere in the page text.
#: Checked by containment rather than position because they are rendered in
#: prose and in a definition list, not in a table with a stable row order.
INLINE_PROVENANCE = ("sdk", "framework", "python", "platform", "capturedOn")
INLINE_SCENARIO = (
    "tool",
    "policyRule",
    "sideEffectFile",
    "launchPath",
    "enforcementPoint",
)


# --------------------------------------------------------------------------- #
# Recording -> display rows
# --------------------------------------------------------------------------- #
def _rows_from(recording: dict) -> list[dict[str, str]]:
    """One row per arm, in the order the arms were run."""
    rows = []
    for arm in recording["arms"]:
        rows.append(
            {
                "id": arm["id"],
                "enforcement": "installed" if arm["enforcementInstalled"] else "removed",
                "policy": "deny" if arm["policyDeniesTool"] else "allow",
                "reportFile": "present" if arm["observedSideEffect"] else "absent",
                "postCondition": "held" if arm["postConditionHolds"] else "failed",
            }
        )
    return rows


def _decision_from(recording: dict) -> list[dict[str, str]]:
    """The decision record the shim acted on in the denied arm, field by field.

    Flattened to (field, value) pairs so the page renders it as a table a reader
    can compare against the recording line by line, and so `check` can assert on
    it without knowing the nesting.
    """
    denied = next(arm for arm in recording["arms"] if arm["id"] == "denied")
    if not denied["decisionRecords"]:
        raise ValueError("the denied arm carries no decision record")
    record = denied["decisionRecords"][0]
    pairs = [("tool_name", str(record["tool_name"]))]
    for key, value in record["args"].items():
        pairs.append((f"args.{key}", str(value)))
    pairs.append(("status", str(record["status"])))
    pairs.append(("reason", str(record["reason"])))
    return [{"field": field, "value": value} for field, value in pairs]


def project(recording: dict) -> dict[str, Any]:
    denied = next(arm for arm in recording["arms"] if arm["id"] == "denied")
    return {
        "provenance": recording["provenance"],
        "scenario": recording["scenario"],
        "rows": _rows_from(recording),
        "decision": _decision_from(recording),
        "observer": " ".join(denied["observerArgv"][:2])
        + " '"
        + denied["observerArgv"][2]
        + "' "
        + denied["observerArgv"][3],
        "returnedToCaller": denied["returnedToCaller"],
        "totals": recording["totals"],
    }


#: The one field a re-record is allowed to change.
#:
#: `scripts/denied-action-capture.py` takes the capture date from the clock
#: inside the run and offers no way to override it, so this field advances when
#: and only when the measurement was actually re-taken. Naming it here, in one
#: place, is what lets `compare` demand equality of everything else instead of
#: settling for a vague "roughly the same" -- an exclusion that is enumerated
#: can be argued with; one that is implied cannot.
REPRODUCTION_EXCLUSIONS = (("provenance", "capturedOn"),)


def _check_captured_on(data: dict[str, Any]) -> None:
    """The capture date is excluded from comparison, so it is checked instead.

    A field nothing compares is a field anything can be. Excluding it from
    `compare` without asserting it separately would create exactly the hole the
    exclusion was meant to be narrow enough to avoid.
    """
    raw = data.get("provenance", {}).get("capturedOn")
    try:
        captured = date.fromisoformat(str(raw))
    except (TypeError, ValueError) as exc:
        raise ValueError(f"provenance.capturedOn is not an ISO date: {raw!r}") from exc
    today = date.today()
    if captured > today:
        raise ValueError(
            f"provenance.capturedOn is in the future: {captured} > {today} — "
            "a recording cannot have been taken on a day that has not happened"
        )


def read_recording() -> dict[str, Any]:
    data = json.loads(RECORDING.read_text(encoding="utf-8"))
    for key in ("provenance", "scenario", "arms", "totals"):
        if key not in data:
            raise ValueError(f"{RECORDING.name} has no {key!r} key")
    _check_captured_on(data)
    if len(data["arms"]) != 3:
        raise ValueError(
            f"expected 3 arms in {RECORDING.name}, found {len(data['arms'])} — "
            "the denied arm alone proves nothing without its two controls"
        )
    if data.get("severed"):
        raise ValueError(
            f"{RECORDING.name} is the output of a --sever-enforcement run and must "
            "never be committed as the recording"
        )
    return data


# --------------------------------------------------------------------------- #
# Module emission
# --------------------------------------------------------------------------- #
HEADER = """\
// GENERATED BY scripts/denied-action-proof.py — DO NOT EDIT.
// AAASM-5589.
//
// Source of truth: `metadata/denied-action-proof.json`, written by
// `scripts/denied-action-capture.py` from a real run of the released Python SDK
// against a real agent framework. Under ADR 0034 this site is a downstream
// layer: it may simplify what the run showed, and may never broaden it.
//
// Re-record (needs the SDK and smolagents installed):
//   python3 scripts/denied-action-capture.py
//
// Regenerate this module from the recording:
//   pnpm proof:generate
//
// Prove the built page still renders it:
//   pnpm build && pnpm proof:check
//
// Show the post-condition is capable of failing:
//   python3 scripts/denied-action-capture.py --sever-enforcement   # exits 1
//
// Every value below was read back from the filesystem by a separate process
// after the call, not reported by the component that made the decision.
"""


def _ts(value: Any, indent: int = 0) -> str:
    pad = "  " * indent
    if isinstance(value, dict):
        inner = "".join(
            f"{pad}  {key}: {_ts(val, indent + 1)},\n" for key, val in value.items()
        )
        return "{\n" + inner + pad + "}"
    if isinstance(value, list):
        inner = "".join(f"{pad}  {_ts(item, indent + 1)},\n" for item in value)
        return "[\n" + inner + pad + "]"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("\\", "\\\\").replace("'", "\\'") + "'"


_DOC = {
    "PROVENANCE": "What was running when the scenario was recorded, and when.",
    "SCENARIO": "The action, the path it took, and the component that refused it.",
    "ROWS": (
        "One row per run. `reportFile` is what a separate process saw in the\n"
        " * directory afterwards — it is the measurement, not a restatement of the\n"
        " * decision. The two rows below `denied` are what make it one: they move the\n"
        " * policy and the enforcement point one at a time."
    ),
    "DECISION": "The decision record the enforcement point acted on, field by field.",
    "OBSERVER": "The program that read the directory back. It imports no product code.",
    "RETURNED": "What the caller received in place of the tool's result.",
    "TOTALS": "How many runs ended with the post-condition their design predicted.",
}


def emit(proj: dict[str, Any]) -> str:
    parts = [HEADER]
    for name, value in (
        ("PROVENANCE", proj["provenance"]),
        ("SCENARIO", proj["scenario"]),
        ("ROWS", proj["rows"]),
        ("DECISION", proj["decision"]),
        ("OBSERVER", proj["observer"]),
        ("RETURNED", proj["returnedToCaller"]),
        ("TOTALS", proj["totals"]),
    ):
        parts.append(f"\n/** {_DOC[name]} */\nexport const {name} = {_ts(value)} as const;\n")
    return "".join(parts)


def cmd_generate(_args: argparse.Namespace) -> int:
    try:
        recording = read_recording()
    except (OSError, ValueError) as exc:
        print(f"FAIL: {exc}")
        return 2
    proj = project(recording)
    MODULE.parent.mkdir(parents=True, exist_ok=True)
    MODULE.write_text(emit(proj), encoding="utf-8")
    print(f"wrote {MODULE.relative_to(REPO)}")
    print(f"  sdk          {proj['provenance']['sdk']}")
    print(f"  framework    {proj['scenario']['framework']} {proj['provenance']['framework']}")
    print(f"  captured on  {proj['provenance']['capturedOn']}")
    print(f"  runs         {proj['totals']['postConditionsHeld']}/{proj['totals']['arms']} post-conditions held")
    return 0


# --------------------------------------------------------------------------- #
# Built-page extraction
# --------------------------------------------------------------------------- #
class _Tables(HTMLParser):
    """Collect every table as a list of rows of cell text.

    Matched on structure, never on CSS class names: Docusaurus hashes those at
    build time. `td`/`th`/`tr` are closed implicitly on the next opening tag
    because the production build omits every optional end tag.
    """

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.tables: list[list[list[str]]] = []
        self._table: list[list[str]] | None = None
        self._row: list[str] | None = None
        self._cell: list[str] | None = None

    def _close_cell(self) -> None:
        if self._cell is not None and self._row is not None:
            self._row.append(re.sub(r"\s+", " ", "".join(self._cell)).strip())
        self._cell = None

    def _close_row(self) -> None:
        self._close_cell()
        if self._row is not None and self._table is not None:
            self._table.append(self._row)
        self._row = None

    def handle_starttag(self, tag: str, _attrs: Any) -> None:
        if tag == "table":
            self._table = []
        elif tag == "tr" and self._table is not None:
            self._close_row()
            self._row = []
        elif tag in ("td", "th") and self._row is not None:
            self._close_cell()
            self._cell = []

    def handle_endtag(self, tag: str) -> None:
        if tag in ("td", "th"):
            self._close_cell()
        elif tag == "tr":
            self._close_row()
        elif tag == "table":
            self._close_row()
            if self._table is not None:
                self.tables.append(self._table)
            self._table = None

    def handle_data(self, data: str) -> None:
        if self._cell is not None:
            self._cell.append(data)


_TAG = re.compile(r"<[^>]+>")


def read_page(build: str) -> dict[str, Any]:
    path = Path(build) / ROUTE / "index.html"
    if not path.is_file():
        raise OSError(f"no built page at {path} — run `pnpm build` first")
    raw = path.read_text(encoding="utf-8")

    parser = _Tables()
    parser.feed(raw)

    def find(heading: str) -> list[list[str]]:
        hits = [t for t in parser.tables if t and heading in t[0]]
        if len(hits) == 1:
            return hits[0][1:]
        seen = [t[0] for t in parser.tables if t]
        raise ValueError(
            f"expected exactly one table on /{ROUTE} with the column heading "
            f"{heading!r}, found {len(hits)} — headers seen: {seen}"
        )

    text = re.sub(r"\s+", " ", html.unescape(_TAG.sub(" ", raw)))
    return {"rows": find(HEADING_ARMS), "decision": find(HEADING_DECISION), "text": text}


def compare_page(proj: dict, page: dict) -> list[str]:
    problems: list[str] = []

    want_rows = [
        [r["id"], r["enforcement"], r["policy"], r["reportFile"], r["postCondition"]]
        for r in proj["rows"]
    ]
    got_rows = [row[:5] for row in page["rows"]]
    if got_rows != want_rows:
        problems.append(
            "the run table does not render the recorded runs\n"
            f"      expected: {want_rows}\n"
            f"      rendered: {got_rows}"
        )

    want_dec = [[d["field"], d["value"]] for d in proj["decision"]]
    got_dec = [row[:2] for row in page["decision"]]
    if got_dec != want_dec:
        problems.append(
            "the decision table does not render the recorded decision\n"
            f"      expected: {want_dec}\n"
            f"      rendered: {got_dec}"
        )

    for key in INLINE_PROVENANCE:
        value = str(proj["provenance"][key])
        if value not in page["text"]:
            problems.append(f"provenance {key} {value!r} is not on the page")
    for key in INLINE_SCENARIO:
        value = str(proj["scenario"][key])
        if value not in page["text"]:
            problems.append(f"scenario {key} {value!r} is not on the page")

    return problems


def control_page(proj: dict, page: dict) -> str | None:
    """Refuse to believe a pass until a seeded defect is shown to fail it."""
    if not page["rows"] or not page["decision"]:
        return "extracted 0 rows from a bound table — nothing was compared"
    poisoned = json.loads(json.dumps(proj))
    # Every seed appends rather than substitutes a real value. Substituting
    # `absent` -> `present` was tried first and is wrong: a page that had
    # genuinely drifted to `present` made the seeded value match what shipped,
    # so the control stopped firing exactly when it was needed, and `check`
    # reported 2 (cannot prove itself) instead of 1 (drift). A suffix no
    # legitimate rendering can carry cannot be cancelled by the defect.
    poisoned["rows"][0]["reportFile"] += "_x"
    poisoned["decision"][0]["value"] += "_x"
    poisoned["provenance"]["sdk"] += "_x"
    fired = compare_page(poisoned, page)
    if len(fired) < 3:
        return (
            f"positive control fired {len(fired)} of 3 seeded drifts "
            "(observed side effect, decision field, SDK version)"
        )
    return None


def cmd_check(args: argparse.Namespace) -> int:
    try:
        proj = project(read_recording())
    except (OSError, ValueError) as exc:
        print(f"FAIL: {exc}")
        return 2
    try:
        page = read_page(args.build)
    except (OSError, ValueError) as exc:
        print(f"FAIL: {exc}")
        return 2

    print(f"recording   : {RECORDING.relative_to(REPO)}")
    print(f"built page  : {args.build}/{ROUTE}/index.html")
    print(
        f"{len(proj['rows'])} runs, {len(proj['decision'])} decision fields, "
        f"sdk {proj['provenance']['sdk']}, captured {proj['provenance']['capturedOn']}"
    )

    control = control_page(proj, page)
    if control:
        print(f"positive control : FAIL ({control})")
        return 2
    print(
        "positive control : PASS (a seeded observed-side-effect, decision-field "
        "and version drift is detected)"
    )

    problems = compare_page(proj, page)
    if problems:
        print(f"\nFAIL: the built page drifted from the recording in {len(problems)} place(s)\n")
        for problem in problems:
            print("  - " + problem)
        print("\nRe-record with scripts/denied-action-capture.py, then `pnpm proof:generate`.")
        return 1

    print(
        "\nPASS: the built page renders the recording exactly — "
        f"{len(proj['rows'])} runs, the decision the enforcement point acted on, "
        "and the versions it was recorded against."
    )
    return 0


def _strip_exclusions(data: dict[str, Any]) -> dict[str, Any]:
    stripped = json.loads(json.dumps(data))
    for path in REPRODUCTION_EXCLUSIONS:
        node = stripped
        for key in path[:-1]:
            node = node.get(key, {})
        node.pop(path[-1], None)
    return stripped


def cmd_compare(args: argparse.Namespace) -> int:
    """Assert a re-record reproduces a baseline everywhere it is allowed to."""
    try:
        current = read_recording()
        baseline = json.loads(Path(args.baseline).read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        print(f"FAIL: {exc}")
        return 2

    print(f"baseline  : {args.baseline}")
    print(f"current   : {RECORDING.relative_to(REPO)}")
    for path in REPRODUCTION_EXCLUSIONS:
        dotted = ".".join(path)
        was = baseline
        now = current
        for key in path:
            was = was.get(key, "<missing>") if isinstance(was, dict) else "<missing>"
            now = now.get(key, "<missing>") if isinstance(now, dict) else "<missing>"
        moved = "advanced" if was != now else "unchanged"
        print(f"excluded  : {dotted}  {was} -> {now}  ({moved})")

    if _strip_exclusions(current) != _strip_exclusions(baseline):
        print(
            "\nFAIL: the re-record differs from the baseline in a measured field.\n"
            "      Everything except the excluded field above must reproduce exactly;\n"
            "      a difference here is a difference in behaviour, not in the weather."
        )
        return 1

    print(
        "\nPASS: every measured field reproduced exactly — the three runs, the "
        "decision, the listings and the versions."
    )
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)

    g = sub.add_parser("generate", help="rewrite the module from the recording")
    g.set_defaults(fn=cmd_generate)

    c = sub.add_parser("check", help="built page vs the recording (no network)")
    c.add_argument("build", nargs="?", default="build")
    c.set_defaults(fn=cmd_check)

    p_cmp = sub.add_parser(
        "compare", help="a re-record vs a baseline, ignoring the capture date"
    )
    p_cmp.add_argument("baseline", help="path to the recording to compare against")
    p_cmp.set_defaults(fn=cmd_compare)

    args = ap.parse_args()
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
