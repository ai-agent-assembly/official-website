#!/usr/bin/env python3
"""Bind the /trust page to the capability manifest, in both directions. AAASM-5588.

    python3 scripts/trust-evidence.py generate --manifest <path>   # manifest -> artifacts
    python3 scripts/trust-evidence.py check build                  # built page vs projection
    python3 scripts/trust-evidence.py upstream [--manifest <path>] # projection vs manifest

WHY THIS EXISTS
---------------
`governance/capability-manifest.yaml` in `ai-agent-assembly/agent-assembly` is
ADR 0034's layer T2. This website is T6 — the second-weakest layer in the
one-product-truth hierarchy, four below the manifest — so it "may simplify an
approved lower-layer fact. It may never broaden it" (ADR 0034 Decision 2).

The manifest's own consumer contract (`governance/README.md`, "Interfaces this
manifest provides") names this ticket:

    **AAASM-5588** (Trust, Evidence and Known Limitations) — `evidence[]`,
    `known_bypasses[]`, `boundary_class` and `boundary_attained` are the
    limitations surface. A row whose evidence is entirely `gap` must be
    presented as a gap.

A page that restates manifest facts in hand-written prose drifts from them
within a release — AAASM-5587 measured exactly that happening inside the branch
that created its copy, four separate times, every one of them mechanically
detectable and none mechanically detected. So the numbers on `/trust` are not
authored. They are generated here, and checked here.

WHY THE PAGE PUBLISHES COUNTS AND NOT SENTENCES
-----------------------------------------------
ADR 0034 §2.3: "An omitted dimension is read at the broadest value admissible
for that dimension — unless the claim carries a resolvable claim or capability
identifier in the same block." A prose capability sentence on a marketing page
asserts every platform, every channel and the top of every strength ordering
unless it carries a row id and every bound.

So the page mostly does not make capability claims. It reports what the manifest
records — "36 of 80 rows carry `coverage: unmeasured`" — which is a statement
about the manifest, exact, and resolvable against the manifest itself. The one
table that does speak per capability (the platform table) carries the row id in
the row, which is what §2.3 asks for.

THE THREE MODES, AND WHY THEY ARE SEPARATE
------------------------------------------
`generate` needs the manifest. `check` must run in CI, and CI here is
stdlib-Python-only with no network (see `.github/workflows/ci.yml`). So:

  - `check` compares the BUILT page against the committed projection. No
    network, no manifest, safe in CI. Catches a page that stopped rendering what
    was generated.
  - `upstream` compares the committed projection against the manifest —
    over the network by default. NOT wired into CI: whether this repository's CI
    may depend on another repository's content, and whether a merge in
    `agent-assembly` may turn `official-website` red, are cross-repo policy
    calls that AAASM-5587 deferred for `check-register-drift.py` and this ticket
    does not reopen. Run it by hand, and after any manifest release.

Together they close the loop: manifest -> projection (upstream) -> built page
(check). Neither half is believed on its own: each mode seeds a known drift into
its own comparison and refuses to report a pass unless that drift is caught.

WHY IT PARSES THE MANIFEST WITH THE STANDARD LIBRARY
----------------------------------------------------
PyYAML is not available to the CI job that runs the claim gates, and this script
should not need a different environment from the gate beside it. The manifest's
`capabilities:` entries put their scalar keys at a fixed two-space indent, so a
line scan anchored to that depth reads them exactly.

That is an assumption, so it was measured rather than assumed: the scan below
was run against the real 5,477-line manifest beside `yaml.safe_load` of the same
bytes, and the two derivations agree on every field of the whole projection —
not only `id`/`domain`/`coverage` but the counts, the per-area distributions and
the four platform rows. `_scan_manifest`
also refuses a document whose shape it does not recognise, rather than returning
a short list that would read as a small manifest.

WHY IT READS THE BUILT PAGE AND NOT THE SOURCE
----------------------------------------------
`<Translate>` resolves at build time, so the source cannot tell you what a reader
gets. It reads the English build only. A translation is not a copy of the English
string, so a text diff would fail on every row of the zh-Hant build; that locale
risk is a different check and a different ticket. This is why the values quoted
from the manifest are rendered untranslated on both locales — a translated copy
of a T2 value would be a second copy that nothing compares.
"""

from __future__ import annotations

import argparse
import collections
import html
import json
import pathlib
import re
import sys
import urllib.request
from html.parser import HTMLParser

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parent

# Two artifacts, one generate run, and the split is deliberate.
#
# PROJECTION is the checked-in snapshot of the manifest facts this site
# publishes. It is the reference every comparison is made against, and it is
# JSON so that reading it back is `json.loads` and not a TypeScript parser —
# `prettier` rewrites the module to single-quoted, unquoted-key TS, which is
# valid TypeScript and not valid JSON. A checker that had to parse the rendered
# module would be one prettier release away from a false pass.
#
# MODULE is what the page imports, rendered from PROJECTION in the same run.
PROJECTION = REPO / "metadata" / "trust-evidence.json"
MODULE = REPO / "src" / "generated" / "trust-evidence.ts"

# The published manifest. A constant, and the only URL this script fetches.
#
# It deliberately does not accept a URL on the command line, for the reason
# `check-register-drift.py` gives: taking one would mean validating an
# attacker-shaped string into a network request, and there is no case here that
# needs it. You either want the published manifest (the default) or the one in
# your `agent-assembly` checkout (`--manifest <path>`).
MANIFEST_URL = (
    "https://raw.githubusercontent.com/ai-agent-assembly/agent-assembly/main/"
    "governance/capability-manifest.yaml"
)

# ADR 0033 §6, in the ADR's own order. The machine tokens are
# `claim-vocabulary.md` §3.1's `coverage:` spellings; the prose forms are its
# public wording for the same rows.
#
# All ELEVEN are listed, including the two the manifest never reaches. A term
# rendered only when some row carries it is a term that disappears the moment
# nothing does, and "no row reaches Approval required" is the single most
# load-bearing fact this page publishes about that term. AC2: unknown and
# unmeasured states stay visible rather than being rendered as supported.
TERMS: tuple[tuple[str, str], ...] = (
    ("observed", "Observed"),
    ("detected", "Detected"),
    ("evaluated", "Evaluated"),
    ("denied_before_execution", "Denied before execution"),
    ("redacted", "Redacted"),
    ("approval_required", "Approval required"),
    ("degraded", "Degraded"),
    ("unmeasured", "Unmeasured"),
    ("experimental", "Experimental"),
    ("planned", "Planned"),
    ("unsupported", "Unsupported"),
)
TERM_TOKENS = frozenset(t for t, _ in TERMS)
PROSE = dict(TERMS)

# The four `domain: platform` rows are the platform matrix. They are pulled out
# by id rather than by filtering on a field, because this is the one table that
# speaks per capability and the set it speaks about must not silently grow or
# shrink under it.
PLATFORM_IDS = ("P1", "P2", "P3", "P4")


# --------------------------------------------------------------------------- #
# Reading the manifest
# --------------------------------------------------------------------------- #

_ENTRY = re.compile(r"^- id: (\S+)\s*$")
_FIELD = re.compile(r"^  (domain|coverage|reachability|default_state|capability): (.+?)\s*$")
_LIST_FIELD = re.compile(r"^  (platform|evidence):\s*$")
# ANY entry-level key, tracked or not. A list that is being read must stop at
# the next key of the same depth — the first version of this scanner only reset
# on the keys it wanted, so `policy_context:` (which follows `platform:` and is
# also a bare list key) appended its items to the platform list. P1 came out on
# three "platforms", two of which are policy names. Hence the enum guard below:
# a scanner that mis-attributes a list should fail, not publish.
_ANY_KEY = re.compile(r"^  ([a-z_0-9]+):\s*(.*)$")
_LIST_ITEM = re.compile(r"^  - (.+?)\s*$")
_EVIDENCE_KIND = re.compile(r"^  - kind: (\S+)\s*$")
_TOP_KEY = re.compile(r"^([a-z_]+):\s*$")
_META_FIELD = re.compile(r"^  ([a-z_]+): (.+?)\s*$")

# `definitions.platformid` plus the coarse family names `platform:` also uses.
PLATFORM_VALUES = frozenset(
    {"linux", "linux_x86_64", "linux_aarch64", "macos", "windows", "not_applicable"}
)


def _unquote(v: str) -> str:
    v = v.strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in "'\"":
        return v[1:-1]
    return v


def _scan_manifest(text: str) -> dict:
    """Read the manifest with the standard library only.

    Anchored to the two-space indent that `capabilities:` entries use for their
    own scalar keys. Nested blocks sit deeper and free-prose block scalars are
    indented further still, so neither can be mistaken for an entry field.

    Cross-checked against `yaml.safe_load` over the real manifest: identical for
    `id`, `domain` and `coverage` on all 80 rows.
    """
    meta: dict[str, str] = {}
    version = ""
    rows: list[dict] = []
    cur: dict | None = None
    section = None
    list_key = None

    for line in text.splitlines():
        m = re.match(r"^manifest_version:\s*(.+?)\s*$", line)
        if m:
            version = _unquote(m.group(1))
            continue
        top = _TOP_KEY.match(line)
        if top:
            section = top.group(1)
            cur = None
            list_key = None
            continue

        if section == "meta":
            f = _META_FIELD.match(line)
            if f and f.group(2).strip():
                meta.setdefault(f.group(1), _unquote(f.group(2)))
            continue

        if section != "capabilities":
            continue

        e = _ENTRY.match(line)
        if e:
            cur = {"id": e.group(1), "platform": [], "evidence_kinds": []}
            rows.append(cur)
            list_key = None
            continue
        if cur is None:
            continue

        f = _FIELD.match(line)
        if f:
            cur.setdefault(f.group(1), _unquote(f.group(2)))
            list_key = None
            continue
        any_key = _ANY_KEY.match(line)
        if any_key:
            lf = _LIST_FIELD.match(line)
            # Every entry-level key closes the list before it, tracked or not.
            list_key = lf.group(1) if lf else None
            continue
        if list_key == "platform":
            it = _LIST_ITEM.match(line)
            if it:
                cur["platform"].append(_unquote(it.group(1)))
                continue
        if list_key == "evidence":
            k = _EVIDENCE_KIND.match(line)
            if k:
                cur["evidence_kinds"].append(k.group(1))
                continue

    if not version:
        raise ValueError("no manifest_version — this is not a capability manifest")
    if len(rows) < 40:
        raise ValueError(
            f"scanned {len(rows)} capability rows, expected at least 40 — the "
            f"manifest's shape changed and this scanner did not"
        )
    bad = [r["id"] for r in rows if r.get("coverage") not in TERM_TOKENS]
    if bad:
        raise ValueError(
            f"rows carry a coverage value that is not an ADR 0033 §6 term: {bad[:5]}"
        )
    # Closed-enum guards. These are what turn a mis-attributed list into a loud
    # failure instead of a published wrong answer — the exact defect the first
    # version of this scanner shipped.
    stray = sorted(
        {p for r in rows for p in r["platform"] if p not in PLATFORM_VALUES}
    )
    if stray:
        raise ValueError(
            f"platform values outside the schema enum: {stray} — the scanner "
            f"attributed another key's list items to `platform:`"
        )
    empty = [r["id"] for r in rows if not r["platform"] or not r["evidence_kinds"]]
    if empty:
        raise ValueError(f"rows scanned with no platform or no evidence: {empty[:5]}")
    return {"manifest_version": version, "meta": meta, "capabilities": rows}


def load_manifest(src: str | None) -> dict:
    """Read the manifest: the published one, or a local checkout's copy."""
    if src is None:
        with urllib.request.urlopen(MANIFEST_URL, timeout=60) as fh:  # noqa: S310
            return _scan_manifest(fh.read().decode("utf-8"))
    if "://" in src:
        raise ValueError(
            "--manifest takes a local path, not a URL. Omit it to fetch the "
            "published manifest, or clone agent-assembly and pass the path to "
            "its governance/capability-manifest.yaml"
        )
    path = pathlib.Path(src).expanduser().resolve(strict=False)
    if path.suffix not in (".yaml", ".yml"):
        raise ValueError(f"expected a YAML file, got {path.name}")
    if not path.is_file():
        raise FileNotFoundError(f"no such file: {path}")
    return _scan_manifest(path.read_text(encoding="utf-8"))


# --------------------------------------------------------------------------- #
# The projection the page renders
# --------------------------------------------------------------------------- #


def project(doc: dict) -> dict:
    """Reduce the manifest to exactly what `/trust` publishes.

    Every number below is a count over the whole row set. A count cannot
    cherry-pick: there is no selection step in which a weaker row could be left
    out, which is the mechanism by which a marketing surface usually broadens.
    """
    caps = doc["capabilities"]
    meta = doc["meta"]
    by_term = collections.Counter(c["coverage"] for c in caps)

    domains: dict[str, list[dict]] = collections.defaultdict(list)
    for c in caps:
        domains[c["domain"]].append(c)

    def gap_only(c: dict) -> bool:
        k = c["evidence_kinds"]
        return bool(k) and set(k) == {"gap"}

    platform_rows = []
    for pid in PLATFORM_IDS:
        row = next((c for c in caps if c["id"] == pid), None)
        if row is None:
            raise ValueError(f"platform row {pid} is not in the manifest")
        platform_rows.append(
            {
                "id": pid,
                "capability": row["capability"],
                "coverage": row["coverage"],
                "platform": sorted(row["platform"]),
                "reachability": row["reachability"],
                "defaultState": row["default_state"],
                "gapOnly": gap_only(row),
            }
        )

    return {
        "provenance": {
            "manifestVersion": doc["manifest_version"],
            "ticket": meta.get("ticket", ""),
            "epic": meta.get("epic", ""),
            "fixVersion": meta.get("fix_version", ""),
            "evidenceTree": meta.get("evidence_tree", ""),
            "evidenceDate": meta.get("evidence_date", ""),
        },
        "totals": {
            "rows": len(caps),
            "gapOnly": sum(1 for c in caps if gap_only(c)),
            "withLocatedTest": sum(1 for c in caps if "test" in c["evidence_kinds"]),
            "withUnlocatedTest": sum(
                1 for c in caps if "test_unlocated" in c["evidence_kinds"]
            ),
        },
        "terms": [
            {"token": tok, "prose": PROSE[tok], "rows": by_term.get(tok, 0)}
            for tok, _ in TERMS
        ],
        "domains": [
            {
                "domain": d,
                "rows": len(rs),
                "ids": f"{rs[0]['id']}–{rs[-1]['id']}",
                "gapOnly": sum(1 for c in rs if gap_only(c)),
                "terms": [
                    {"token": t, "prose": PROSE[t], "rows": n}
                    for t, n in sorted(
                        collections.Counter(c["coverage"] for c in rs).items(),
                        key=lambda kv: (-kv[1], kv[0]),
                    )
                ],
            }
            for d, rs in sorted(domains.items(), key=lambda kv: (-len(kv[1]), kv[0]))
        ],
        "platforms": platform_rows,
    }


# --------------------------------------------------------------------------- #
# generate
# --------------------------------------------------------------------------- #

HEADER = """\
// GENERATED BY scripts/trust-evidence.py — DO NOT EDIT.
// AAASM-5588.
//
// Source of truth: `governance/capability-manifest.yaml` in
// ai-agent-assembly/agent-assembly — ADR 0034's layer T2. This site is T6 and
// may simplify what T2 says; it may never broaden it (ADR 0034 Decision 2).
//
// Regenerate with:
//   python3 scripts/trust-evidence.py generate --manifest <agent-assembly>/governance/capability-manifest.yaml
//
// Prove it still matches the published manifest:
//   python3 scripts/trust-evidence.py upstream
//
// Prove the built page still renders it:
//   pnpm build && python3 scripts/trust-evidence.py check build
//
// Every number here is a count over all %(rows)d manifest rows. Counts are used
// rather than selected examples because a count has no selection step in which
// a weaker row could be dropped.

"""


def emit(proj: dict) -> str:
    def ts(value, indent: int = 0) -> str:
        return json.dumps(value, indent=2, ensure_ascii=False).replace(
            "\n", "\n" + " " * indent
        )

    out = [HEADER % {"rows": proj["totals"]["rows"]}]
    out.append(
        "/** Where the numbers came from, and how stale they are. */\n"
        "export const PROVENANCE = " + ts(proj["provenance"]) + " as const;\n"
    )
    out.append(
        "/** Row counts over the whole manifest. */\n"
        "export const TOTALS = " + ts(proj["totals"]) + " as const;\n"
    )
    out.append(
        "/**\n"
        " * The eleven ADR 0033 §6 terms in the ADR's own order, with the number of\n"
        " * manifest rows each one reaches.\n"
        " *\n"
        " * The two zeroes are the point. A term rendered only where some row carries\n"
        " * it vanishes the moment none does, and that is exactly the state an\n"
        " * evaluator most needs to see.\n"
        " */\n"
        "export const TERMS = " + ts(proj["terms"]) + " as const;\n"
    )
    out.append(
        "/** Manifest rows grouped by domain, with the term distribution of each. */\n"
        "export const DOMAINS = " + ts(proj["domains"]) + " as const;\n"
    )
    out.append(
        "/**\n"
        " * The four `domain: platform` rows.\n"
        " *\n"
        " * The one table on the page that speaks per capability, so each row carries\n"
        " * its manifest id — ADR 0034 §2.3 reads an omitted dimension at its broadest\n"
        " * admissible value unless a resolvable identifier sits in the same block.\n"
        " *\n"
        " * `reachability` and `defaultState` are rendered beside every one of them,\n"
        " * because the manifest's consumer contract requires it: without them a\n"
        " * platform table asserts a capability is available that nothing reaches.\n"
        " */\n"
        "export const PLATFORMS = " + ts(proj["platforms"]) + " as const;\n"
    )
    return "\n".join(out)


def write_artifacts(proj: dict) -> None:
    PROJECTION.parent.mkdir(parents=True, exist_ok=True)
    PROJECTION.write_text(
        json.dumps(proj, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    MODULE.parent.mkdir(parents=True, exist_ok=True)
    MODULE.write_text(emit(proj), encoding="utf-8")


def cmd_generate(args) -> int:
    proj = project(load_manifest(args.manifest))
    write_artifacts(proj)
    print(f"wrote {PROJECTION.relative_to(REPO)}")
    print(f"wrote {MODULE.relative_to(REPO)}")
    print(f"  manifest_version {proj['provenance']['manifestVersion']}")
    print(f"  evidence_tree    {proj['provenance']['evidenceTree']}")
    print(f"  evidence_date    {proj['provenance']['evidenceDate']}")
    print(f"  rows             {proj['totals']['rows']}")
    return 0


# --------------------------------------------------------------------------- #
# Reading back what was generated, and what was rendered
# --------------------------------------------------------------------------- #


def read_projection() -> dict:
    """The checked-in snapshot every comparison is made against."""
    if not PROJECTION.is_file():
        raise FileNotFoundError(f"{PROJECTION} does not exist — run `generate` first")
    proj = json.loads(PROJECTION.read_text(encoding="utf-8"))
    for key in ("provenance", "totals", "terms", "domains", "platforms"):
        if key not in proj:
            raise ValueError(f"{PROJECTION.name}: no `{key}`")
    if len(proj["terms"]) != len(TERMS):
        raise ValueError(
            f"{PROJECTION.name}: holds {len(proj['terms'])} claim terms, "
            f"ADR 0033 §6 defines {len(TERMS)} — a term was dropped"
        )
    return proj


# The generated module is NOT parsed or diffed here, deliberately.
#
# It is the conduit between the projection and the page, and the page is the
# artifact that decides what a reader gets. A module hand-edited away from the
# projection renders a page that no longer matches the projection, and that is
# what `compare_page` reports — through the rendered output rather than through
# a second reading of the source. Parsing the module back would also mean
# parsing TypeScript: prettier rewrites it to single-quoted, unquoted-key
# literals that are valid TS and invalid JSON, so a `json.loads`-based reader
# would be one formatting pass away from failing open.


class _Tables(HTMLParser):
    """Collect every table on the page as rows of plain-text cells.

    Structure, not class names. CSS-module class names are hashed at build time
    and the build is minified with unquoted attributes; a table is a table in
    both. What a reader sees is the cell text, so the cell text is what is
    compared.
    """

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.tables: list[list[list[str]]] = []
        self._t: list[list[str]] | None = None
        self._r: list[str] | None = None
        self._c: list[str] | None = None

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self._t = []
        elif tag == "tr" and self._t is not None:
            self._r = []
        elif tag in ("td", "th") and self._r is not None:
            self._c = []

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self._c is not None and self._r is not None:
            self._r.append(re.sub(r"\s+", " ", "".join(self._c)).strip())
            self._c = None
        elif tag == "tr" and self._r is not None and self._t is not None:
            if self._c is not None:  # minified HTML may drop </td>
                self._r.append(re.sub(r"\s+", " ", "".join(self._c)).strip())
                self._c = None
            self._t.append(self._r)
            self._r = None
        elif tag == "table" and self._t is not None:
            if self._r is not None:
                self._t.append(self._r)
                self._r = None
            self.tables.append(self._t)
            self._t = None

    def handle_data(self, data):
        if self._c is not None:
            self._c.append(data)


def read_page(build_dir: str) -> dict:
    """Extract the three data tables and the provenance line from the build."""
    root = pathlib.Path(build_dir).expanduser().resolve(strict=False)
    if not root.is_dir():
        raise NotADirectoryError(f"no such build directory: {root}")
    page = root / "trust" / "index.html"
    if not page.is_file():
        raise FileNotFoundError(f"{page} does not exist — did `pnpm build` run?")
    doc = page.read_text(encoding="utf-8")

    p = _Tables()
    p.feed(doc)

    def find(header_token: str) -> list[list[str]]:
        for t in p.tables:
            if t and any(header_token in c for c in t[0]):
                return t[1:]
        raise ValueError(
            f"no table on /trust whose header row contains {header_token!r} — "
            f"found {len(p.tables)} table(s): {[t[0] if t else [] for t in p.tables]}"
        )

    text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", doc)))
    return {
        "text": text,
        "terms": find("Claim term"),
        "domains": find("Area"),
        "platforms": find("Manifest row"),
    }


# --------------------------------------------------------------------------- #
# check — built page vs the generated module
# --------------------------------------------------------------------------- #


def compare_page(mod: dict, page: dict) -> list[str]:
    problems: list[str] = []

    want_terms = [(t["prose"], str(t["rows"])) for t in mod["terms"]]
    got_terms = [(r[0], r[1]) for r in page["terms"] if len(r) >= 2]
    if got_terms != want_terms:
        problems.append(
            "the claim-term table does not render the published terms\n"
            f"      expected: {want_terms}\n"
            f"      rendered: {got_terms}"
        )

    want_dom = [(d["domain"], str(d["rows"])) for d in mod["domains"]]
    got_dom = [(r[0], r[1]) for r in page["domains"] if len(r) >= 2]
    if got_dom != want_dom:
        problems.append(
            "the area table does not render the published areas\n"
            f"      expected: {want_dom}\n"
            f"      rendered: {got_dom}"
        )

    want_plat = [
        (p["id"], p["capability"], PROSE[p["coverage"]], p["reachability"], p["defaultState"])
        for p in mod["platforms"]
    ]
    got_plat = [tuple(r[:5]) for r in page["platforms"] if len(r) >= 5]
    if got_plat != want_plat:
        problems.append(
            "the platform table does not render the published platform rows\n"
            f"      expected: {want_plat}\n"
            f"      rendered: {got_plat}"
        )

    # Provenance is prose, not a table, so it is asserted by containment.
    for label, value in (
        ("evidence tree", mod["provenance"]["evidenceTree"][:12]),
        ("evidence date", mod["provenance"]["evidenceDate"]),
        ("manifest version", mod["provenance"]["manifestVersion"]),
    ):
        if value and value not in page["text"]:
            problems.append(f"the page does not publish its {label} ({value})")
    for label, value in (
        ("row total", mod["totals"]["rows"]),
        ("gap-only total", mod["totals"]["gapOnly"]),
    ):
        if str(value) not in page["text"]:
            problems.append(f"the page does not publish its {label} ({value})")
    return problems


def control_page(mod: dict, page: dict) -> str | None:
    """Prove the page comparison can fail before believing it when it passes."""
    if not page["terms"]:
        return "extracted 0 rows from the claim-term table — nothing was compared"
    poisoned = json.loads(json.dumps(mod))
    poisoned["terms"][0]["rows"] += 1
    poisoned["platforms"][0]["reachability"] += "_x"
    poisoned["provenance"]["evidenceDate"] = "1999-01-01"
    fired = compare_page(poisoned, page)
    if len(fired) < 3:
        return (
            f"positive control fired {len(fired)} of 3 seeded drifts "
            f"(term count, platform reachability, evidence date)"
        )
    return None


def cmd_check(args) -> int:
    try:
        mod = read_projection()
    except (OSError, ValueError) as exc:
        print(f"FAIL: {exc}")
        return 2
    try:
        page = read_page(args.build)
    except (OSError, ValueError) as exc:
        print(f"FAIL: {exc}")
        return 2

    print(f"projection  : {PROJECTION.relative_to(REPO)}")
    print(f"built page  : {args.build}/trust/index.html")
    print(
        f"rows {mod['totals']['rows']}, terms {len(mod['terms'])}, "
        f"areas {len(mod['domains'])}, platform rows {len(mod['platforms'])}"
    )

    control = control_page(mod, page)
    if control:
        print(f"positive control : FAIL ({control})")
        return 2
    print("positive control : PASS (a seeded term, platform and date drift is detected)")

    problems = compare_page(mod, page)
    if problems:
        print(f"\nFAIL: the built page drifted from the projection in "
              f"{len(problems)} place(s)\n")
        for p in problems:
            print("  - " + p)
        return 1
    print(
        f"\nPASS: the built page renders the projection exactly — "
        f"{len(mod['terms'])} claim terms, {len(mod['domains'])} areas, "
        f"{len(mod['platforms'])} platform rows, and its provenance."
    )
    return 0


# --------------------------------------------------------------------------- #
# upstream — generated module vs the manifest
# --------------------------------------------------------------------------- #


def cmd_upstream(args) -> int:
    try:
        mod = read_projection()
    except (OSError, ValueError) as exc:
        print(f"FAIL: {exc}")
        return 2
    source = args.manifest or MANIFEST_URL
    try:
        fresh = project(load_manifest(args.manifest))
    except Exception as exc:  # noqa: BLE001
        print(f"FAIL: could not read the manifest from {source}: {exc}")
        return 2

    print(f"manifest         : {source}")
    print(f"projection       : {PROJECTION.relative_to(REPO)}")
    print(f"rows in manifest : {fresh['totals']['rows']}")

    # Positive control: the comparison must reject a manifest it disagrees with.
    poisoned = json.loads(json.dumps(fresh))
    poisoned["totals"]["gapOnly"] += 1
    if not _diff(mod, poisoned):
        print("positive control : FAIL (a corrupted gap-only total was not detected)")
        return 2
    print("positive control : PASS (a corrupted total is detected)")

    problems = _diff(mod, fresh)
    if problems:
        print(f"\nFAIL: the published projection drifted from the manifest in "
              f"{len(problems)} place(s)\n")
        for p in problems:
            print("  - " + p)
        print(
            "\nRegenerate with:\n"
            "  python3 scripts/trust-evidence.py generate --manifest <path>\n"
            "and re-translate any zh-Hant string whose English changed."
        )
        return 1
    print("\nPASS: the published projection matches the manifest in every field.")
    return 0


def _diff(mod: dict, fresh: dict) -> list[str]:
    problems: list[str] = []
    for key in ("provenance", "totals"):
        for field, want in fresh[key].items():
            got = mod.get(key, {}).get(field)
            if got != want:
                problems.append(f"{key}.{field}: module {got!r}, manifest {want!r}")
    for section in ("terms", "domains", "platforms"):
        if mod.get(section) != fresh[section]:
            want = {json.dumps(x, sort_keys=True) for x in fresh[section]}
            got = {json.dumps(x, sort_keys=True) for x in mod.get(section, [])}
            for extra in sorted(got - want):
                problems.append(f"{section}: published an entry the manifest does not have: {extra}")
            for missing in sorted(want - got):
                problems.append(f"{section}: manifest has an entry that is not published: {missing}")
            if not (got ^ want):
                problems.append(f"{section}: same entries, different order")
    return problems


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)

    g = sub.add_parser("generate", help="rewrite the projection and the module")
    g.add_argument("--manifest", default=None, metavar="PATH")
    g.set_defaults(fn=cmd_generate)

    c = sub.add_parser("check", help="built page vs the projection (no network)")
    c.add_argument("build", nargs="?", default="build")
    c.set_defaults(fn=cmd_check)

    u = sub.add_parser("upstream", help="projection vs the manifest (network)")
    u.add_argument("--manifest", default=None, metavar="PATH")
    u.set_defaults(fn=cmd_upstream)

    args = ap.parse_args()
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
