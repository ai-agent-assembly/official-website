#!/usr/bin/env python3
"""Fail the build when it publishes a claim ADR 0033 forbids. AAASM-5696.

Run against the BUILT site, never the source:

    pnpm build && python3 scripts/check-forbidden-claims.py build

Exit 0 = clean, 1 = forbidden claim published, 2 = the checker could not prove
itself and reported nothing trustworthy -- which includes a catalogue that has
been trimmed below its floor, because a narrowed gate reports a pass it has not
earned.

Why this exists as committed code rather than a one-off search
--------------------------------------------------------------
The first pass at AAASM-5696 used a throwaway catalogue built from the full
sentence on `/product`. It matched that page, missed the identical framing on
the blog (which continues "...layers: SDK (in-process)"), and a site-wide
clearance was reported from an instance-level measurement. Committing the
catalogue is what turns that into a check a reviewer or CI can re-run.

Three traps this deliberately avoids
------------------------------------
1. The build is minified with UNQUOTED attributes, so a quoted-attribute probe
   (`content="..."`) reports a confident false absence. Parsing is done with
   html.parser, which handles quoted and unquoted alike.
2. No regex is built over a phrase by escaping it and substituting whitespace --
   that corrupts multi-word phrases. Both sides are normalised to single-space
   text and compared as plain substrings. Word boundaries, where needed, come
   from Python re (`\\b`); `grep -E` accepts `\\b` and silently ignores it.
3. An absence is never reported without a positive control first proving the
   matcher fires on every phrase in the catalogue.
"""

from __future__ import annotations

import copy
import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

HERE = Path(__file__).resolve().parent
CATALOGUE = HERE / "forbidden-claims.json"

# --------------------------------------------------------------------------- #
# What the catalogue is NOT allowed to own
# --------------------------------------------------------------------------- #
# ADR 0033 forbidden design 7 -- the 14 banned absolutes, verbatim. NEVER
# waivable, by anyone, for any period (ADR 0034 Decision 10).
#
# These live here rather than in forbidden-claims.json because the cheapest
# route from a red gate to a green one is deleting the offending phrase from a
# data file, and nothing about that edit looks like disabling a check: CI turns
# green, review sees a green check, and the phrase is unwatched from then on.
# Deleting a line below lands in the diff a reviewer reads instead. The
# catalogue is additive -- it may extend the gate, never narrow it.
FD7_ABSOLUTES = (
    "catch everything",
    "catch-all",
    "cannot be bypassed",
    "unbypassable",
    "nowhere to hide",
    "every action",
    "every tool call",
    "no code changes",
    "immutable audit",
    "full fleet",
    "whole fleet",
    "universal",
    "comprehensive",
    "complete",
)

# The classes allowed to report BELOW `error`, i.e. to print a `warn` line the
# build survives. Code-owned for the same reason FD7_ABSOLUTES is: severity is
# what decides whether a hit fails the build, and the one-word data edit
# `"severity": "warn"` is a cheaper route from a red gate to a green one than
# deleting a phrase -- it is idiomatic (this catalogue already ships one warn
# group, with a `why` beside it), it leaves every phrase, count and floor
# untouched, and the gate still prints all 89 hits. Measured before this check
# existed: downgrading the seven error-class groups took a build holding 79
# forbidden claims to `forbidden hits: 0   warnings: 89`, exit 0, with
# integrity PASS and the self-test at 16/16. AAASM-5730.
WARN_ONLY_CLASSES = frozenset({"fd-7-adjacent"})

# The noun slot the stack framings are built on. A catalogue entry may write
# `{unit}` and is expanded over this set at load time, so one authored line
# covers every synonym.
#
# Why a substitution set and not stemming or normalisation
# -------------------------------------------------------
# Stemming was considered and rejected on the evidence. All five phrasings that
# escaped the literal catalogue -- "three independently deployable TIERS",
# "three LEVELS", "the three-TIER interception model", "each STAGE sees what
# the one before it missed", "the governance PLANE" -- are substitutions in
# this one noun slot, not morphological variants of "layer". No stemmer relates
# layer to tier, so a stem pipeline would have caught 0 of the 5: it generalises
# on the wrong axis.
#
# It would also cost the two properties that make this script's absences
# trustworthy. Expansion yields plain strings, so the matcher stays substring
# plus `\b` and never builds a regex out of catalogue content -- trap 2 above,
# which corrupts multi-word phrases. And the positive control keeps proving
# every concrete string that will actually be searched, rather than asserting
# over a transformation of it. Stemming is language-specific besides, and half
# this catalogue is zh-Hant, which has neither stems nor word boundaries.
#
# The cost of the substitution set is that it only generalises where an author
# writes `{unit}`, so it is applied to the framings the ADR forbids and not to
# entries where a synonym is ordinary technical prose -- "at the kernel level"
# is a normal thing to write, so "kernel layer" stays literal. AAASM-5730.
UNIT_SYNONYMS = ("layer", "tier", "level", "stage", "plane")

# Minimum number of AUTHORED entries per `class/locale` group in
# forbidden-claims.json.
#
# This is a FLOOR, not a fixture, and the direction matters: adding a phrase
# raises a count above its floor and never needs a code change, so extending
# the gate stays a one-line edit to the JSON. Only REMOVING below the floor
# fails -- and the fix for a legitimate removal is to lower the number here,
# in a diff a reviewer reads. A gate whose driver the gate does not defend is
# not a gate; a floor that punished growth would just be worked around.
CATALOGUE_FLOOR = {
    "fd-1/en": 9,
    "fd-1/zh-Hant": 6,
    "fd-2/en": 6,
    "fd-3/en": 2,
    "rejected-hero/en": 3,
    "rejected-hero/zh-Hant": 2,
    "approval/en": 2,
    "approval/zh-Hant": 2,
    "fd-7-adjacent/en": 3,
}

# Independent bound on the catalogue as a whole, so deleting an entire group
# that predates its floor entry cannot pass on per-group checks alone.
MIN_CATALOGUE_ENTRIES = 35

_WS = re.compile(r"[\s ​]+")
_TAG = re.compile(r"<[^>]*>")


# --------------------------------------------------------------------------- #
# extraction
# --------------------------------------------------------------------------- #
class _Visible(HTMLParser):
    """Reader-facing text: body copy plus the metadata search results quote.

    <script>/<style> bodies are dropped, so a single common word like
    "complete" cannot be matched against React internals. Metadata counts as
    published -- a retracted line in a meta description outlives a page fix
    because nobody reads it and search results quote it. That is not
    hypothetical: it is where the 20th hit of AAASM-5696 was found.
    """

    META_KEYS = {
        "description",
        "og:description",
        "twitter:description",
        "og:title",
        "twitter:title",
    }

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.chunks: list[str] = []
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self._skip += 1
        elif tag == "meta":
            a = {k.lower(): (v or "") for k, v in attrs}
            if (a.get("name") or a.get("property") or "").lower() in self.META_KEYS:
                self.chunks.append(a.get("content", ""))

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self._skip:
            self._skip -= 1

    def handle_data(self, data):
        if not self._skip:
            self.chunks.append(data)


def html_text(raw: str) -> str:
    p = _Visible()
    p.feed(raw)
    return _WS.sub(" ", " ".join(p.chunks)).strip()


def xml_text(raw: str) -> str:
    """RSS/Atom/sitemap text.

    Feed item bodies are HTML escaped *inside* XML text, so unescaping once
    yields markup and the tags must then come out. The blog's fd-1 sentence
    reaches readers through four feeds, and a sweep that skipped them would
    under-report the denominator.
    """
    s = html.unescape(raw)
    s = _TAG.sub(" ", s)
    s = html.unescape(s)
    return _WS.sub(" ", s).strip()


def js_text(raw: str) -> str:
    s = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), raw)
    return _WS.sub(" ", s.replace('\\"', '"')).strip()


SURFACES = {
    ".html": ("html", html_text),
    ".xml": ("xml", xml_text),
    ".js": ("js", js_text),
}


# --------------------------------------------------------------------------- #
# matching
# --------------------------------------------------------------------------- #
def norm(p: str) -> str:
    return _WS.sub(" ", html.unescape(p)).strip()


def matches(needle: str, hay: str, *, boundary: bool) -> bool:
    n = norm(needle)
    if not boundary:
        return n in hay
    # Word-boundary match, so "complete" does not fire on "incomplete".
    return re.search(rf"\b{re.escape(n)}\b", hay) is not None


def _entry(cls: str, locale: str, phrase: str, prose_only: bool, severity: str) -> dict:
    return {
        "class": cls,
        "locale": locale,
        "phrase": phrase,
        "prose_only": prose_only,
        # Boundary only for single-word prose entries; multi-word phrases are
        # distinctive enough and CJK has no \b.
        "boundary": prose_only and " " not in phrase,
        "severity": severity,
    }


def read_catalogue() -> dict:
    return json.loads(CATALOGUE.read_text(encoding="utf-8"))


def entry_counts(data: dict) -> dict[str, int]:
    """Authored entries per `class/locale` -- what a person edits, not what the
    expansion produces, so the floor is stated in the units of the edit."""
    counts: dict[str, int] = {}
    for group in data.get("phrases", []):
        key = f"{group['class']}/{group.get('locale', 'en')}"
        counts[key] = counts.get(key, 0) + len(group.get("any", [])) + len(group.get("any_units", []))
    return counts


def integrity(data: dict) -> list[str]:
    """Prove the catalogue has not been trimmed into a gate that passes green.

    Without this the cheapest route from a red gate to a green one is deleting
    the offending phrase: an emptied catalogue scored `forbidden hits: 0,
    EXIT=0` against a build holding 79 real violations, and dropping one group
    took it 49 -> 35 with no complaint. AAASM-5730.
    """
    errs: list[str] = []

    if len(set(FD7_ABSOLUTES)) != 14:
        errs.append(
            f"FD7_ABSOLUTES holds {len(set(FD7_ABSOLUTES))} distinct phrases, expected the "
            "14 of ADR 0033 forbidden design 7 -- never waivable (ADR 0034 Decision 10)"
        )

    counts = entry_counts(data)
    for group in data.get("phrases", []):
        if group["class"] == "fd-7":
            errs.append(
                "fd-7 is owned by FD7_ABSOLUTES in check-forbidden-claims.py and ignored "
                "here -- remove the fd-7 group from forbidden-claims.json"
            )
        severity = group.get("severity", "error")
        if severity != "error" and group["class"] not in WARN_ONLY_CLASSES:
            errs.append(
                f"{group['class']}/{group.get('locale', 'en')}: severity {severity!r} -- only "
                f"{', '.join(sorted(WARN_ONLY_CLASSES))} may report below error, and that list "
                "is WARN_ONLY_CLASSES in check-forbidden-claims.py. Downgrading a group in the "
                "catalogue silences it without changing a phrase, a count or a floor"
            )
        # A template with no slot expands to five copies of itself, which would
        # inflate the phrase count while widening nothing.
        for template in group.get("any_units", []):
            if "{unit}" not in template:
                errs.append(
                    f"{group['class']}/{group.get('locale', 'en')}: any_units entry "
                    f"{template!r} has no {{unit}} slot -- move it to \"any\""
                )

    for key, count in sorted(counts.items()):
        if key not in CATALOGUE_FLOOR:
            errs.append(
                f"{key}: no floor entry -- add \"{key}\": {count} to CATALOGUE_FLOOR in "
                "check-forbidden-claims.py so the group cannot later be deleted silently"
            )
    for key, floor in sorted(CATALOGUE_FLOOR.items()):
        have = counts.get(key, 0)
        if have < floor:
            errs.append(
                f"{key}: {have} entries, floor is {floor} -- restore the removed phrase(s), "
                "or lower the floor in CATALOGUE_FLOOR if the removal is intended"
            )

    total = sum(counts.values())
    if total < MIN_CATALOGUE_ENTRIES:
        errs.append(
            f"catalogue holds {total} entries, minimum is {MIN_CATALOGUE_ENTRIES} "
            "(MIN_CATALOGUE_ENTRIES in check-forbidden-claims.py)"
        )
    return errs


def load_phrases(data: dict | None = None):
    """Expand the catalogue into the concrete phrases that will be searched.

    The fd-7 absolutes are appended from FD7_ABSOLUTES, never read from `data`,
    so an emptied or trimmed catalogue still scans for all 14.
    """
    if data is None:
        data = read_catalogue()
    out = []
    for group in data.get("phrases", []):
        cls = group["class"]
        if cls == "fd-7":
            # Owned by FD7_ABSOLUTES. Ignored here so a stale data copy cannot
            # drift from, or appear to authorise, the code-owned list.
            continue
        prose_only = bool(group.get("prose_only"))
        severity = group.get("severity", "error")
        locale = group.get("locale", "en")
        for phrase in group.get("any", []):
            out.append(_entry(cls, locale, phrase, prose_only, severity))
        for template in group.get("any_units", []):
            for unit in UNIT_SYNONYMS:
                out.append(_entry(cls, locale, template.replace("{unit}", unit), prose_only, severity))
    for phrase in FD7_ABSOLUTES:
        out.append(_entry("fd-7", "en", phrase, True, "error"))
    seen, deduped = set(), []
    for e in out:
        k = _key(e)
        if k not in seen:
            seen.add(k)
            deduped.append(e)
    return deduped


def _key(p) -> tuple[str, str, str]:
    """Identity of a catalogue entry, used to count DISTINCT failing phrases.

    Failure lines are formatted for humans and contain colons, so deriving the
    identity by splitting the message counts class-plus-fixture instead of
    phrase: three failures of one phrase on three fixtures used to read as
    three phrases, and three failures of three phrases in one fixture as one.
    """
    return (p["class"], p["locale"], p["phrase"])


def positive_control(phrases) -> list[tuple[tuple[str, str, str], str]]:
    """Prove the matcher fires on EVERY phrase, on every surface it will scan.

    Fixtures mimic the real build: minified, unquoted attributes, an
    entity-encoded ampersand, and a tag boundary beside the phrase.
    """
    fails = []
    for p in phrases:
        enc = p["phrase"].replace("&", "&amp;")
        b = p["boundary"]
        fixtures = {
            "html-body": (
                "<html><head><style>a{color:red}</style></head><body>"
                f"<div class=x id=probe data-k=v><span>lead </span>{enc}<em> trail</em></div>"
                "<script>window.x={}</script></body></html>",
                html_text,
            ),
            "html-meta": (
                f'<html><head><meta name=description content="{enc}">'
                "</head><body>x</body></html>",
                html_text,
            ),
            "xml-feed": (
                "<?xml version='1.0'?><feed><entry><content type='html'>"
                f"&lt;p&gt;lead {enc.replace('&', '&amp;amp;')}&lt;/p&gt;"
                "</content></entry></feed>",
                xml_text,
            ),
        }
        if not p["prose_only"]:
            fixtures["js-bundle"] = (f'e.jsx("p",{{children:"lead {enc} trail"}})', js_text)
        for name, (fx, fn) in fixtures.items():
            if not matches(p["phrase"], fn(fx), boundary=b):
                fails.append((_key(p), f"[{p['class']}/{p['locale']}] {name}: {p['phrase']!r}"))
    return fails


def negative_control(phrases) -> list[tuple[tuple[str, str, str], str]]:
    """Prove boundary-matched words do NOT fire on a word that contains them.

    Without this, `complete` silently matches `incomplete` -- the opposite
    assertion -- and every future run is wrong in the safe-looking direction.
    """
    fails = []
    for p in phrases:
        if not p["boundary"]:
            continue
        decoy = f"in{p['phrase']}ness auto{p['phrase']}"
        if matches(p["phrase"], html_text(f"<p>{decoy}</p>"), boundary=True):
            fails.append((_key(p), f"[{p['class']}] {p['phrase']!r} fired on {decoy!r}"))
    return fails


def scan(build: Path, phrases):
    files, hits = [], []
    for f in sorted(build.rglob("*")):
        if not f.is_file():
            continue
        surf = SURFACES.get(f.suffix.lower())
        if not surf:
            continue
        kind, extract = surf
        rel = str(f.relative_to(build))
        files.append((rel, kind))
        text = extract(f.read_text(encoding="utf-8", errors="replace"))
        locale = "zh-Hant" if rel.startswith("zh-Hant/") else "en"
        for p in phrases:
            if p["prose_only"] and kind == "js":
                continue
            # A zh-Hant page still ships untranslated English blog bodies, so
            # English phrases are checked on every page regardless of locale.
            if p["locale"] == "zh-Hant" and locale != "zh-Hant":
                continue
            if matches(p["phrase"], text, boundary=p["boundary"]):
                hits.append({**p, "file": rel, "surface": kind})
    return files, hits


# --------------------------------------------------------------------------- #
# self-test
# --------------------------------------------------------------------------- #
# The rewordings measured in AAASM-5730. The first five escaped the catalogue
# before the {unit} expansion; the last three are the shapes a synonym set can
# plausibly over-reach onto, and must stay clear. They run on every CI build
# because a guard nobody has watched fire is not evidence that it fires.
REWORDINGS_MUST_CATCH = (
    "Agent Assembly ships three independently deployable tiers.",
    "Governance arrives at three levels: in-process, sidecar, and kernel.",
    "This is the three-tier interception model in practice.",
    "SDK then proxy then eBPF: each stage sees what the one before it missed.",
    "Agent Assembly is the governance plane for autonomous software.",
)
REWORDINGS_MUST_CLEAR = (
    "The rollout is incomplete and the form has autocomplete enabled.",
    "The proxy runs at the kernel level on Linux hosts.",
    "The policy engine evaluates rules in stages during startup.",
)


def _prose_hits(sentence: str, phrases):
    text = html_text(f"<html><body><div class=x id=p><p>{sentence}</p></div></body></html>")
    return [
        p for p in phrases
        if p["locale"] == "en" and matches(p["phrase"], text, boundary=p["boundary"])
    ]


def self_test() -> int:
    """Prove the gate's own guards fire, without needing a build directory."""
    data = read_catalogue()
    phrases = load_phrases(data)
    results: list[tuple[bool, str, str]] = []

    def check(ok: bool, name: str, detail: str = "") -> None:
        results.append((bool(ok), name, detail))

    check(not integrity(data), "committed catalogue passes integrity")

    one_less = copy.deepcopy(data)
    for g in one_less["phrases"]:
        if g["class"] == "fd-1" and g.get("locale") == "en" and g.get("any"):
            g["any"].pop()
            break
    check(integrity(one_less), "one phrase removed -> integrity fails")

    no_group = copy.deepcopy(data)
    no_group["phrases"] = [
        g for g in no_group["phrases"] if not (g["class"] == "fd-1" and g.get("locale") == "en")
    ]
    check(integrity(no_group), "one group removed -> integrity fails")
    check(integrity({"phrases": []}), "emptied catalogue -> integrity fails")

    downgraded = copy.deepcopy(data)
    for g in downgraded["phrases"]:
        if g.get("severity", "error") == "error":
            g["severity"] = "warn"
            break
    check(integrity(downgraded), "group downgraded to warn -> integrity fails")

    grown = copy.deepcopy(data)
    grown["phrases"][0].setdefault("any", []).append("a newly banned framing")
    check(not integrity(grown), "phrase added -> integrity still passes (extension stays free)")

    survivors = {p["phrase"] for p in load_phrases({"phrases": []}) if p["class"] == "fd-7"}
    check(
        survivors == set(FD7_ABSOLUTES),
        f"emptied catalogue still scans all {len(FD7_ABSOLUTES)} fd-7 absolutes",
        f"{len(survivors)} present",
    )

    for s in REWORDINGS_MUST_CATCH:
        hits = _prose_hits(s, phrases)
        check(hits, f"caught: {s}", hits[0]["phrase"] if hits else "NOTHING FIRED")
    for s in REWORDINGS_MUST_CLEAR:
        hits = _prose_hits(s, phrases)
        check(not hits, f"clear : {s}", hits[0]["phrase"] if hits else "")

    check(not positive_control(phrases), f"positive control passes ({len(phrases)} phrases)")
    check(not negative_control(phrases), "negative control passes")

    failed = 0
    for ok, name, detail in results:
        failed += not ok
        print(f"  {'ok  ' if ok else 'FAIL'} {name}" + (f"   [{detail}]" if detail else ""))
    print(f"\nself-test: {len(results) - failed}/{len(results)} checks passed")
    return 0 if not failed else 2


def main() -> int:
    if "--self-test" in sys.argv[1:]:
        return self_test()
    build = Path(sys.argv[1] if len(sys.argv) > 1 else "build")
    if not build.is_dir():
        print(f"FATAL: no build directory at {build} -- run `pnpm build` first")
        return 2

    data = read_catalogue()
    ierr = integrity(data)
    counts = entry_counts(data)
    print(f"integrity      : {'PASS' if not ierr else 'FAIL'} "
          f"({sum(counts.values())} authored entries in {len(counts)} groups, "
          f"minimum {MIN_CATALOGUE_ENTRIES}; {len(FD7_ABSOLUTES)} fd-7 absolutes code-owned)")
    for e in ierr:
        print("  INTEGRITY FAILED:", e)
    if ierr:
        print("\nThe catalogue has been narrowed -- a pass below would not be a measurement.")
        return 2

    phrases = load_phrases(data)
    pf, nf = positive_control(phrases), negative_control(phrases)
    print(f"catalogue      : {len(phrases)} phrases")
    proven = len(phrases) - len({k for k, _ in pf})
    print(f"positive ctrl  : {'PASS' if not pf else 'FAIL'} "
          f"({proven}/{len(phrases)} phrases matched on all surfaces)")
    print(f"negative ctrl  : {'PASS' if not nf else 'FAIL'} "
          f"(boundary words must not fire on words containing them)")
    for _, msg in pf + nf:
        print("  CONTROL FAILED:", msg)
    if pf or nf:
        print("\nControls failed -- any absence below would not be a measurement.")
        return 2

    files, hits = scan(build, phrases)
    by_kind: dict[str, int] = {}
    for _, k in files:
        by_kind[k] = by_kind.get(k, 0) + 1
    print(f"scanned        : {len(files)} files "
          f"({', '.join(f'{v} {k}' for k, v in sorted(by_kind.items()))})")

    errors = [h for h in hits if h["severity"] == "error"]
    warns = [h for h in hits if h["severity"] != "error"]
    print(f"forbidden hits : {len(errors)}   warnings: {len(warns)}\n")

    for h in sorted(hits, key=lambda x: (x["class"], x["file"])):
        tag = "FORBIDDEN" if h["severity"] == "error" else "warn     "
        print(f"  {tag} {h['class']:16s} {h['surface']:5s} {h['file']:58s} {h['phrase']!r}")

    if errors:
        print(f"\nFAIL: {len(errors)} forbidden claim(s) published. "
              f"Canonical authority: ADR 0033, Explicitly forbidden designs.")
        return 1
    print("\nPASS: no forbidden claim in the built output.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
