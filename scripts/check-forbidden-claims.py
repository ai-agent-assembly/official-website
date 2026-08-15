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
from datetime import date
from html.parser import HTMLParser
from pathlib import Path

HERE = Path(__file__).resolve().parent
CATALOGUE = HERE / "forbidden-claims.json"
WAIVERS = HERE / "claim-waivers.json"
BASELINE = HERE / "claim-baseline.json"

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

# The zh-Hant unit slot, expanded only into zh-Hant `any_units` templates
# (never into `en` ones, and vice versa -- see `_units_for_locale`). AAASM-5741.
#
# CJK has no `\b`, and 層 is a common morpheme across ordinary compounds
# unrelated to this claim ("表層" surface, "底層" underlying, "階層" hierarchy in
# a non-architecture sense). The English design's answer to that -- restrict
# expansion to `{unit}` templates anchored in interception context, so a bare
# unit noun never becomes a searched phrase -- carries over unchanged and is
# what actually bounds the risk here; it is not solved by anything Chinese-
# specific. Four unit nouns, not a stem set: 層/層級/階層/層面 are the distinct
# words the AAASM-5741 discovery measured as escaping the un-expanded zh-Hant
# group's literal `any` list.
UNIT_SYNONYMS_ZH = ("層", "層級", "階層", "層面")


def _units_for_locale(locale: str) -> tuple[str, ...]:
    return UNIT_SYNONYMS_ZH if locale == "zh-Hant" else UNIT_SYNONYMS

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

_WS = re.compile(r"[\s ​]+")
_TAG = re.compile(r"<[^>]*>")


# --------------------------------------------------------------------------- #
# extraction
# --------------------------------------------------------------------------- #
# The quote-exemption marker (AAASM-5744). A page that quotes a forbidden claim
# in order to forbid, retract, or critique it -- rather than assert it -- wraps
# the quoted span in an element carrying this attribute:
#
#     <span data-claims-gate-quote>a fixed stack of three tiers, each one
#     catching what the tier above it missed</span>
#
# Plain HTML, not `<!-- -->`: MDX does not parse HTML comments (`Unexpected
# character '!'... to create a comment in MDX, use {/* text */}`), and `{/*
# */}` JSX comments compile out of the React tree entirely -- verified by
# building a page with one and finding zero trace of it, marker or content, in
# build/. A `<span>` is real markup: it renders (so the quote stays visible to
# readers, which "prohibition pages must paraphrase, never quote" would not)
# and its attribute survives into build/ output, where this script reads it.
#
# The exemption is deliberately narrow and code-owned, not data-owned:
# EXEMPT_ATTR is a constant in this file, not something the catalogue or a page
# can redefine, so recognising it is not decidable from data alone -- the
# AAASM-5730 lesson this ticket's own acceptance criteria restates. What page
# content controls is only WHERE the one fixed attribute is placed, and that
# placement is a visible, reviewable line in the content diff -- the same
# property that makes a marked region "explicit, greppable, and ... reviewable"
# per the option this implements. It is not scoped further (no required nearby
# "retracted"/"forbidden" signal word): the marker itself is the signal, and
# requiring specific prose near it would make the exemption fragile to
# copy-editing instead of narrower. sentence_control's MUST_CATCH corpus proves
# the same phrase, unmarked, still fails -- the control this ticket's
# acceptance criteria requires.
#
# One regex, applied to raw file bytes before any of the three per-surface
# extractors run, rather than three separate parsers each re-implementing the
# exemption. The span reaches build/ in three different serialisations of the
# same literal markup -- verbatim in .html, verbatim inside a CDATA block in
# .xml (the RSS/Atom feeds embed the rendered post body unescaped), and
# verbatim inside a JS string literal in .js (the raw MDX source, embedded for
# the blog archive/search index) -- so `<span ...data-claims-gate-quote...>
# ... </span>` is a literal substring to strip in all three, proven by the
# self-test asserting all three surfaces on the same fixture. DOTALL, because
# the quoted text can (and in the wild, will) span lines.
EXEMPT_ATTR = "data-claims-gate-quote"
_EXEMPT_SPAN = re.compile(
    rf'<span\b[^>]*\b{re.escape(EXEMPT_ATTR)}\b[^>]*>.*?</span>',
    re.DOTALL,
)


def strip_exempt_quotes(raw: str) -> str:
    return _EXEMPT_SPAN.sub(" ", raw)


# Position scope for the `rejected-hero` class (AAASM-5761). Its phrases match
# the ONE former framing of the product homepage's above-the-fold hero (an L1
# position) -- not any occurrence of the same wording anywhere a page scans.
# Unscoped, the class also fired on `content-ownership.md`'s worked-compliant
# example, the Horonomy company blurb, which uses the same "governance layer
# for" framing but is an L0 company-level portfolio summary: a different
# position, permitted by ADR 0034's layering rule (upper layers may simplify,
# never broaden). The fix is not an exception list for every page an L0
# summary may legitimately appear on -- that grows unbounded and is exactly
# what a "cross-site linter can import the class without a hand-maintained
# exception list" rules out. Instead the class only matches inside the one
# position it actually targets: an element the real hero component marks with
# this attribute (`src/components/home/index.tsx`'s `Hero()`). A page that
# never marks anything as the hero position can say the same words anywhere
# else on it without tripping the class -- proven by self_test()'s hero-marked
# vs unmarked pair, using the actual blurb sentence.
POSITION_ATTR = "data-claims-position"
HERO_POSITION = "hero"
_POSITION_SPAN = re.compile(
    # Minified HTML output drops attribute quotes entirely (verified on the
    # real build -- `data-claims-position=hero`, no quotes at all), so the
    # value has to be matched quoted OR bare, never assumed quoted like a
    # hand-authored fixture.
    r'<([a-zA-Z0-9]+)\b[^>]*\bdata-claims-position=(?:"([^"]*)"|\'([^\']*)\'|([^\s"\'>]+))[^>]*>(.*?)</\1>',
    re.DOTALL,
)


def position_scoped_markup(raw: str, position: str) -> str:
    """Raw markup found only inside elements marked `data-claims-position="<position>"`.

    Same non-nested-tag assumption as `_EXEMPT_SPAN` above: the real hero
    element is a single, unnested `<header>`, so a backreference to its own
    tag name is enough without a full HTML parse.
    """
    return " ".join(
        m.group(5)
        for m in _POSITION_SPAN.finditer(raw)
        if (m.group(2) or m.group(3) or m.group(4)) == position
    )


def hero_text(raw: str) -> str:
    """Visible text restricted to the marked hero position. See POSITION_ATTR."""
    scoped = position_scoped_markup(strip_exempt_quotes(raw), HERO_POSITION)
    p = _Visible()
    p.feed(scoped)
    return _WS.sub(" ", " ".join(p.chunks)).strip()


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
    raw = strip_exempt_quotes(raw)
    p = _Visible()
    p.feed(raw)
    return _WS.sub(" ", " ".join(p.chunks)).strip()


def xml_text(raw: str) -> str:
    """RSS/Atom/sitemap text.

    Feed item bodies are HTML escaped *inside* XML text, so unescaping once
    yields markup and the tags must then come out. The blog's fd-1 sentence
    reaches readers through four feeds, and a sweep that skipped them would
    under-report the denominator.

    The exempt span is stripped before either unescape: RSS/Atom wrap item
    bodies in CDATA, where the markup (this span included) is already literal,
    unescaped HTML -- verified on the built feed rather than assumed.
    """
    raw = strip_exempt_quotes(raw)
    s = html.unescape(raw)
    s = _TAG.sub(" ", s)
    s = html.unescape(s)
    return _WS.sub(" ", s).strip()


def js_text(raw: str) -> str:
    raw = strip_exempt_quotes(raw)
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


def _entry(
    cls: str, locale: str, phrase: str, prose_only: bool, severity: str, position: str | None = None
) -> dict:
    return {
        "class": cls,
        "locale": locale,
        "phrase": phrase,
        "prose_only": prose_only,
        # Boundary only for single-word prose entries; multi-word phrases are
        # distinctive enough and CJK has no \b.
        "boundary": prose_only and " " not in phrase,
        "severity": severity,
        # AAASM-5761: None for every class except rejected-hero, which is
        # restricted to the marked hero position. See POSITION_ATTR.
        "position": position,
    }


def read_catalogue() -> dict:
    return json.loads(CATALOGUE.read_text(encoding="utf-8"))


def read_waivers() -> dict:
    if not WAIVERS.exists():
        return {"waivers": []}
    return json.loads(WAIVERS.read_text(encoding="utf-8"))


def read_baseline() -> dict:
    if not BASELINE.exists():
        return {"baseline": []}
    return json.loads(BASELINE.read_text(encoding="utf-8"))


# --------------------------------------------------------------------------- #
# waivers and baseline (AAASM-5796)
# --------------------------------------------------------------------------- #
# Two different things, kept structurally distinct so neither can be used to
# silence the other's category of problem:
#
# A WAIVER is a reviewed acceptance of one catalogue phrase, with an owner,
# a reason, an approver and an expiry -- it says "this is fine, on purpose,
# until this date." class "fd-7" can never be waived (ADR 0034 Decision 10):
# validate_waivers() rejects that entry outright, the same way integrity()
# rejects an fd-7 group appearing in the catalogue.
#
# A BASELINE entry is not a review -- it has no owner, reason, approver or
# expiry. It records that one (class, locale, phrase, file) combination is
# currently unremediated, so it does not fail CI *today*, without granting
# anyone permission to leave it there. It suppresses nothing else: the same
# phrase in a file not listed keeps failing, and a newly-introduced file is
# never covered by an existing entry -- baselining cannot silently widen.
WAIVER_REQUIRED_FIELDS = ("class", "locale", "phrase", "owner", "reason", "approver", "expiry")
BASELINE_REQUIRED_FIELDS = ("class", "locale", "phrase", "file")


def validate_waivers(data: dict, *, today: date | None = None) -> list[str]:
    today = today or date.today()
    errs: list[str] = []
    seen: set[tuple[str, str, str]] = set()
    for i, w in enumerate(data.get("waivers", [])):
        where = f"waivers[{i}]"
        missing = [k for k in WAIVER_REQUIRED_FIELDS if not w.get(k)]
        if missing:
            errs.append(f"{where}: missing required field(s) {', '.join(missing)}")
            continue
        if w["class"] == "fd-7":
            errs.append(
                f"{where}: class 'fd-7' is never waivable, by anyone, for any period "
                "(ADR 0034 Decision 10) -- remove this entry"
            )
            continue
        try:
            expiry = date.fromisoformat(w["expiry"])
        except ValueError:
            errs.append(f"{where}: expiry {w['expiry']!r} is not an ISO date (YYYY-MM-DD)")
            continue
        if expiry < today:
            errs.append(
                f"{where}: waiver for {w['phrase']!r} expired {w['expiry']} (owner {w['owner']}) "
                "-- renew with a new expiry or remove it"
            )
            continue
        key = (w["class"], w["locale"], w["phrase"])
        if key in seen:
            errs.append(f"{where}: duplicate waiver for {key}")
        seen.add(key)
    return errs


def validate_baseline(data: dict) -> list[str]:
    errs: list[str] = []
    seen: set[tuple[str, str, str, str]] = set()
    for i, b in enumerate(data.get("baseline", [])):
        where = f"baseline[{i}]"
        missing = [k for k in BASELINE_REQUIRED_FIELDS if not b.get(k)]
        if missing:
            errs.append(f"{where}: missing required field(s) {', '.join(missing)}")
            continue
        key = (b["class"], b["locale"], b["phrase"], b["file"])
        if key in seen:
            errs.append(f"{where}: duplicate baseline entry for {key}")
        seen.add(key)
    return errs


def annotate_suppressions(hits: list[dict], waivers: list[dict], baseline: list[dict]) -> list[dict]:
    """Mark each hit `waived` or `baselined` where a matching entry exists.

    A pure function over plain hit/waiver/baseline dicts -- not folded into
    scan() -- so self_test() can prove the suppression logic against synthetic
    hits without a real build directory.
    """
    waiver_keys = {(w["class"], w["locale"], w["phrase"]) for w in waivers}
    baseline_keys = {(b["class"], b["locale"], b["phrase"], b["file"]) for b in baseline}
    out = []
    for h in hits:
        h = dict(h)
        if (h["class"], h["locale"], h["phrase"]) in waiver_keys:
            h["waived"] = True
        elif (h["class"], h["locale"], h["phrase"], h["file"]) in baseline_keys:
            h["baselined"] = True
        out.append(h)
    return out


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
        position = group.get("position")
        for phrase in group.get("any", []):
            out.append(_entry(cls, locale, phrase, prose_only, severity, position))
        for template in group.get("any_units", []):
            for unit in _units_for_locale(locale):
                out.append(
                    _entry(cls, locale, template.replace("{unit}", unit), prose_only, severity, position)
                )
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
        if p["position"]:
            # Position-scoped phrases (rejected-hero, AAASM-5761) are only
            # ever checked against the marked hero position, so the only
            # fixture that means anything is one that marks it.
            fixtures = {
                "html-hero": (
                    f'<html><body><header data-claims-position="{p["position"]}">'
                    f"<span>lead </span>{enc}<em> trail</em></header></body></html>",
                    hero_text,
                ),
            }
        else:
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


def scan(build: Path, phrases, *, waivers: list[dict] | None = None, baseline: list[dict] | None = None):
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
        raw = f.read_text(encoding="utf-8", errors="replace")
        text = extract(raw)
        # Position-scoped phrases only ever exist inside the html surface's
        # marked region (AAASM-5761) -- computed once per file, not per phrase.
        hero = hero_text(raw) if kind == "html" else ""
        locale = "zh-Hant" if rel.startswith("zh-Hant/") else "en"
        for p in phrases:
            if p["prose_only"] and kind == "js":
                continue
            # A zh-Hant page still ships untranslated English blog bodies, so
            # English phrases are checked on every page regardless of locale.
            if p["locale"] == "zh-Hant" and locale != "zh-Hant":
                continue
            if p["position"]:
                if kind != "html":
                    continue
                haystack = hero
            else:
                haystack = text
            if matches(p["phrase"], haystack, boundary=p["boundary"]):
                hits.append({**p, "file": rel, "surface": kind})
    hits = annotate_suppressions(hits, waivers or [], baseline or [])
    return files, hits


# --------------------------------------------------------------------------- #
# self-test
# --------------------------------------------------------------------------- #
# One sentence per `class/locale` group that MUST still be caught, keyed by the
# group that has to catch it. Five of them are the rewordings measured in
# AAASM-5730, which escaped the catalogue before the {unit} expansion; the rest
# exist so that every group is asserted on.
#
# Why the key, and why one per group
# ----------------------------------
# CATALOGUE_FLOOR counts entries; it cannot see what they say. Replacing every
# phrase with junk of the same length left the floor satisfied, integrity at
# PASS and the gate at `forbidden hits: 0`, exit 0, against a build holding 79
# real violations -- and re-narrowing entries into sentence shapes, the
# regression this catalogue's own $rules calls "the single most important rule
# in this file", did the same. The self-test did not catch either in full,
# because it asserted only on fd-1/en, fd-2/en and rejected-hero/en: junking the
# other six groups, English and zh-Hant alike, kept it at 16/16 while silencing
# 22 of the 79. Asserting one caught sentence per group makes the floor a
# statement about COVERAGE rather than cardinality, which is what its docstring
# already claimed. AAASM-5730.
MUST_CATCH = (
    ("fd-1/en", "Agent Assembly ships three independently deployable tiers."),
    ("fd-1/en", "Governance arrives at three levels: in-process, sidecar, and kernel."),
    ("fd-1/en", "This is the three-tier interception model in practice."),
    ("fd-1/zh-Hant", "Agent Assembly 由三個攔截層組成，逐層收斂。"),
    # A reworded escape: the old zh-Hant group had no {unit} expansion, so only
    # the literal 層 forms above were caught. This substitutes 階層 -- one of
    # UNIT_SYNONYMS_ZH -- into the same anchored slot; it must fire only through
    # the new any_units template, never through a pre-existing literal string.
    # AAASM-5741.
    ("fd-1/zh-Hant", "這是三個可獨立部署的階層架構。"),
    ("fd-2/en", "SDK then proxy then eBPF: each stage sees what the one before it missed."),
    ("fd-3/en", "The sidecars feed a central gateway that makes the decision."),
    ("fd-7/en", "The kernel hooks give comprehensive coverage of every host."),
    ("fd-7-adjacent/en", "Enforcement arrives without touching agent code."),
    # The possessive-qualifier evasion this class was missing before AAASM-5741
    # -- measured live on the docs repo (README.md), not this repo's build.
    ("fd-7-adjacent/en", "Get started -- no agent code changes are required."),
    ("rejected-hero/en", "Agent Assembly is the governance plane for autonomous software."),
    ("rejected-hero/zh-Hant", "這是為 AI 代理而生的治理層。"),
    ("approval/en", "Sensitive tool calls wait behind human-in-the-loop approval."),
    ("approval/zh-Hant", "敏感操作必須通過核准關卡才會執行。"),
)
MUST_CLEAR = (
    "The rollout is incomplete and the form has autocomplete enabled.",
    "The proxy runs at the kernel level on Linux hosts.",
    "The policy engine evaluates rules in stages during startup.",
    # Ordinary English the first cut of the unit expansion fired on as a
    # build-failing FORBIDDEN fd-1. Zero of them appear on the site today, so
    # the templates were narrowed prospectively -- but this is a marketing site
    # with an early-access page and no pricing page yet, and the first author to
    # meet a red build over a pricing table is the author who turns the gate off.
    "Pricing comes in three tiers: Free, Team, and Enterprise.",
    "Logging supports three levels: debug, info, and error.",
    "The migration runs in three stages over the next quarter.",
    # The zh-Hant equivalents of the over-reach negative controls above,
    # exercising UNIT_SYNONYMS_ZH the same way: 層 (and 層級/階層/層面) are
    # common morphemes with no word boundary to lean on, so what actually
    # bounds these is that no anchor prefix ("可獨立部署的"/"強制執行"/
    # "三個攔截") precedes the unit noun. AAASM-5741.
    "價格分為三個階層：免費、團隊與企業。",
    "報告需要經過多個層級審核。",
    "系統運行於作業系統底層。",
    # The real collision AAASM-5761 records: agent-assembly's
    # content-ownership.md quotes this Horonomy company blurb as the worked
    # COMPLIANT L0 example, but unscoped it matched rejected-hero's "governance
    # {unit} for" template. Ordinary (non-hero-marked) prose, it must clear --
    # self_test() proves the same sentence still fires when marked as the hero
    # position, so this is narrowing by position, not by widening MUST_CLEAR
    # past what the class should catch.
    "A governance layer for AI agents — permissions, approval checkpoints, and evidence.",
)

# Floors on the control corpora themselves. Emptying the must-catch list used to
# print `self-test: 11/11 checks passed`, exit 0 -- the assertion count shrank by
# five and the only thing that would have said so was the number it shrank.
#
# Neither floor is implied by the coverage check, which is why both are here and
# MIN_CATALOGUE_ENTRIES is not: coverage needs one sentence per group, so two of
# the three fd-1/en sentences can be dropped with every group still covered, and
# nothing else bounds MUST_CLEAR at all.
MIN_MUST_CATCH = 12
MIN_MUST_CLEAR = 6


def _prose_hits(sentence: str, phrases, *, hero: bool = False):
    """Every catalogue phrase that fires on one sentence of reader-facing prose.

    No locale filter: the zh-Hant groups have to be assertable too, and the
    scan()-time rule that confines them to zh-Hant pages is a property of the
    page tree, not of the matcher.

    `hero=True` marks the sentence as the hero position first (AAASM-5761),
    for asserting a position-scoped group's coverage. Plain (the default) is
    what MUST_CLEAR needs: proof the sentence does not fire in ordinary,
    unmarked prose -- including the L0-blurb entry that is this class's own
    once-real false positive.

    A position-scoped phrase is matched ONLY against the hero-extracted text
    (empty when `hero` is False, same as scan() would see on an unmarked
    page) -- never against the plain text, which would still contain the
    sentence verbatim and defeat the whole point of scoping.
    """
    if hero:
        raw = (
            f'<html><body><header data-claims-position="{HERO_POSITION}">'
            f"<p>{sentence}</p></header></body></html>"
        )
    else:
        raw = f"<html><body><div class=x id=p><p>{sentence}</p></div></body></html>"
    plain = html_text(raw)
    scoped = hero_text(raw)
    return [
        p for p in phrases
        if matches(p["phrase"], scoped if p["position"] else plain, boundary=p["boundary"])
    ]


def _group_is_positioned(key: str, phrases) -> bool:
    return any(_group_key(p) == key and p["position"] for p in phrases)


def _group_key(p) -> str:
    return f"{p['class']}/{p['locale']}"


def sentence_control(phrases, must_catch=None, must_clear=None) -> list[str]:
    """Prove every group still catches something, and none has widened.

    Runs in the gate itself, not only in --self-test, because a catalogue whose
    phrases have been junked reports an absence it has not earned and the run
    that reports it is `claims:check`. The corpora are arguments only so the
    self-test can shrink them and watch this fail; they default to the committed
    ones, read at call time so a defaulted run can never lag the constant.
    """
    must_catch = MUST_CATCH if must_catch is None else must_catch
    must_clear = MUST_CLEAR if must_clear is None else must_clear
    errs: list[str] = []
    if len(must_catch) < MIN_MUST_CATCH:
        errs.append(
            f"MUST_CATCH holds {len(must_catch)} sentences, floor is {MIN_MUST_CATCH} "
            "(MIN_MUST_CATCH in check-forbidden-claims.py)"
        )
    if len(must_clear) < MIN_MUST_CLEAR:
        errs.append(
            f"MUST_CLEAR holds {len(must_clear)} sentences, floor is {MIN_MUST_CLEAR} "
            "(MIN_MUST_CLEAR in check-forbidden-claims.py)"
        )
    covered = set()
    for key, sentence in must_catch:
        # Position-scoped groups (rejected-hero, AAASM-5761) only fire at the
        # hero position, so their coverage sentence has to be checked there --
        # a plain-prose check would report their own real false positive as
        # if it were still missing coverage.
        hits = _prose_hits(sentence, phrases, hero=_group_is_positioned(key, phrases))
        if any(_group_key(h) == key for h in hits):
            covered.add(key)
        else:
            fired = sorted({_group_key(h) for h in hits})
            errs.append(
                f"{key}: nothing in that group fired on {sentence!r} -- "
                + (f"fired instead: {', '.join(fired)}" if fired else "NOTHING FIRED")
            )
    for key in sorted({_group_key(p) for p in phrases} - covered):
        errs.append(
            f"{key}: no MUST_CATCH sentence proves this group catches anything -- add one to "
            "MUST_CATCH in check-forbidden-claims.py, so the floor states coverage and not "
            "just a count of entries"
        )
    for sentence in must_clear:
        hits = _prose_hits(sentence, phrases)
        if hits:
            errs.append(
                f"MUST_CLEAR fired on {sentence!r}: "
                + ", ".join(f"{_group_key(h)} {h['phrase']!r}" for h in hits)
            )
    return errs


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

    junked = copy.deepcopy(data)
    for g in junked["phrases"]:
        if g["class"] == "approval" and g.get("locale") == "zh-Hant":
            # Same count, same floor, same integrity verdict -- different words.
            g["any"] = ["蘸蘸壹貳" for _ in g["any"]]
            break
    check(
        not integrity(junked) and sentence_control(load_phrases(junked)),
        "group's phrases junked at the same count -> integrity passes, sentence control fails",
    )

    # Quote exemption (AAASM-5744). QUOTE_FIXTURE is a real MUST_CATCH phrase --
    # its own coverage is separately asserted a few lines down, so this proves
    # the exemption against a phrase already proven to fire, not a phrase
    # chosen because it happens to fire.
    quote_fixture = "Agent Assembly ships three independently deployable tiers."
    exempt_hits = _prose_hits(
        f"<span data-claims-gate-quote>{quote_fixture}</span>", phrases
    )
    check(
        not exempt_hits,
        f"quote-exempt span clears a real catalogue phrase: {quote_fixture!r}",
        ", ".join(f"{_group_key(h)} {h['phrase']!r}" for h in exempt_hits),
    )
    unexempt_hits = _prose_hits(quote_fixture, phrases)
    check(
        unexempt_hits,
        f"the same phrase, unmarked, still fails -- narrowness control: {quote_fixture!r}",
        "NOTHING FIRED" if not unexempt_hits else "",
    )
    # A phrase not wrapped in the marker, but wrapped in an UNRELATED tag with
    # an unrelated attribute, must still fire -- proves the exemption is keyed
    # to the specific EXEMPT_ATTR value, not "any wrapping tag."
    other_attr_hits = _prose_hits(
        f'<span data-something-else>{quote_fixture}</span>', phrases
    )
    check(
        other_attr_hits,
        f"an unrelated attribute does not exempt anything: {quote_fixture!r}",
        "NOTHING FIRED" if not other_attr_hits else "",
    )

    # Position scope (AAASM-5761). The real collision: the same sentence fires
    # when it IS the product homepage hero, and clears when it is the
    # Horonomy L0 company blurb content-ownership.md holds up as compliant.
    blurb = "A governance layer for AI agents — permissions, approval checkpoints, and evidence."
    hero_breach_hits = _prose_hits(blurb, phrases, hero=True)
    check(
        hero_breach_hits,
        f"rejected-hero fires on the blurb WHEN marked as the hero position: {blurb!r}",
        "NOTHING FIRED" if not hero_breach_hits else "",
    )
    l0_blurb_hits = _prose_hits(blurb, phrases)
    check(
        not l0_blurb_hits,
        f"rejected-hero clears the SAME blurb text when it is not the hero position (AAASM-5761): {blurb!r}",
        ", ".join(f"{_group_key(h)} {h['phrase']!r}" for h in l0_blurb_hits),
    )
    # An unrelated element carrying an unrelated data-claims-position value
    # must not count as the hero position -- proves the scope is keyed to
    # HERO_POSITION's value, not "any marked element."
    wrong_position_html = (
        f'<html><body><header data-claims-position="footer"><p>{blurb}</p></header></body></html>'
    )
    wrong_position_hits = [
        p for p in phrases if p["position"] and matches(p["phrase"], hero_text(wrong_position_html), boundary=p["boundary"])
    ]
    check(
        not wrong_position_hits,
        f"a differently-valued data-claims-position does not count as the hero position: {blurb!r}",
        ", ".join(f"{_group_key(h)} {h['phrase']!r}" for h in wrong_position_hits),
    )

    for key, s in MUST_CATCH:
        hits = [
            h
            for h in _prose_hits(s, phrases, hero=_group_is_positioned(key, phrases))
            if _group_key(h) == key
        ]
        check(hits, f"caught by {key}: {s}", hits[0]["phrase"] if hits else "NOTHING FIRED")
    for s in MUST_CLEAR:
        hits = _prose_hits(s, phrases)
        check(not hits, f"clear : {s}", hits[0]["phrase"] if hits else "")
    check(
        not sentence_control(phrases),
        f"every group is asserted on ({len({_group_key(p) for p in phrases})} groups, "
        f"{len(MUST_CATCH)} must-catch, {len(MUST_CLEAR)} must-clear)",
    )
    check(
        sentence_control(phrases, must_catch=MUST_CATCH[:1], must_clear=MUST_CLEAR[:1]),
        "control corpora shrunk -> sentence control fails",
    )

    check(not positive_control(phrases), f"positive control passes ({len(phrases)} phrases)")
    check(not negative_control(phrases), "negative control passes")

    # Waivers and baseline (AAASM-5796).
    check(not validate_waivers({"waivers": []}), "empty waiver file passes")
    check(not validate_baseline({"baseline": []}), "empty baseline file passes")

    malformed_waiver = {"waivers": [{"class": "fd-1", "locale": "en", "phrase": "x"}]}
    check(
        validate_waivers(malformed_waiver),
        "waiver missing owner/reason/approver/expiry fails validation",
    )

    fd7_waiver = {
        "waivers": [
            {
                "class": "fd-7",
                "locale": "en",
                "phrase": "catch everything",
                "owner": "someone",
                "reason": "x",
                "approver": "someone-else",
                "expiry": "2099-01-01",
            }
        ]
    }
    check(
        validate_waivers(fd7_waiver),
        "fd-7 (unwaivable, ADR 0034 Decision 10) cannot be waived even if otherwise well-formed",
    )

    well_formed = {
        "class": "fd-1",
        "locale": "en",
        "phrase": "test waiver phrase",
        "owner": "someone",
        "reason": "x",
        "approver": "someone-else",
        "expiry": "2027-01-01",
    }
    expired = {**well_formed, "expiry": "2020-01-01"}
    check(
        not validate_waivers({"waivers": [well_formed]}, today=date(2026, 1, 1)),
        "well-formed, non-expired waiver passes validation",
    )
    check(
        validate_waivers({"waivers": [expired]}, today=date(2026, 1, 1)),
        "expired waiver fails validation on its own -- independent of whether a matching hit exists",
    )

    synthetic_hit = {
        "class": "fd-1",
        "locale": "en",
        "phrase": "test waiver phrase",
        "severity": "error",
        "file": "index.html",
        "surface": "html",
    }
    waived = annotate_suppressions([synthetic_hit], [well_formed], [])
    check(
        waived[0].get("waived") is True,
        "a hit matching a valid waiver is marked waived",
    )
    unwaived_other_phrase = annotate_suppressions(
        [{**synthetic_hit, "phrase": "a different phrase"}], [well_formed], []
    )
    check(
        not unwaived_other_phrase[0].get("waived"),
        "a waiver for one phrase does not suppress a different phrase -- narrowness control",
    )

    malformed_baseline = {"baseline": [{"class": "fd-1", "locale": "en", "phrase": "x"}]}
    check(validate_baseline(malformed_baseline), "baseline entry missing 'file' fails validation")

    baseline_entry = {"class": "fd-1", "locale": "en", "phrase": "test baseline phrase", "file": "old.html"}
    check(not validate_baseline({"baseline": [baseline_entry]}), "well-formed baseline entry passes validation")

    baselined_same_file = annotate_suppressions(
        [{**synthetic_hit, "phrase": "test baseline phrase", "file": "old.html"}], [], [baseline_entry]
    )
    check(
        baselined_same_file[0].get("baselined") is True,
        "a hit matching a baseline entry's (class, locale, phrase, file) is marked baselined",
    )
    baselined_different_file = annotate_suppressions(
        [{**synthetic_hit, "phrase": "test baseline phrase", "file": "new.html"}], [], [baseline_entry]
    )
    check(
        not baselined_different_file[0].get("baselined"),
        "the SAME phrase in a file NOT in the baseline still fires -- baselining cannot silently widen "
        "to a new file (AAASM-5599 AC: does not silently disable future checks)",
    )

    committed_waivers = read_waivers()
    committed_baseline = read_baseline()
    check(
        not validate_waivers(committed_waivers),
        f"committed claim-waivers.json passes validation ({len(committed_waivers.get('waivers', []))} entries)",
    )
    check(
        not validate_baseline(committed_baseline),
        f"committed claim-baseline.json passes validation ({len(committed_baseline.get('baseline', []))} entries)",
    )

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
          f"({sum(counts.values())} authored entries in {len(counts)} groups, floors sum to "
          f"{sum(CATALOGUE_FLOOR.values())}; {len(FD7_ABSOLUTES)} fd-7 absolutes code-owned)")
    for e in ierr:
        print("  INTEGRITY FAILED:", e)
    if ierr:
        print("\nThe catalogue has been narrowed -- a pass below would not be a measurement.")
        return 2

    waivers_data = read_waivers()
    baseline_data = read_baseline()
    werr = validate_waivers(waivers_data)
    berr = validate_baseline(baseline_data)
    print(f"waivers        : {'PASS' if not werr else 'FAIL'} ({len(waivers_data.get('waivers', []))} entries)")
    for e in werr:
        print("  WAIVER INVALID:", e)
    print(f"baseline       : {'PASS' if not berr else 'FAIL'} ({len(baseline_data.get('baseline', []))} entries)")
    for e in berr:
        print("  BASELINE INVALID:", e)
    if werr or berr:
        print("\nAn expired or malformed waiver/baseline entry fails the build on its own -- "
              "fix or remove it in claim-waivers.json / claim-baseline.json.")
        return 2

    phrases = load_phrases(data)
    pf, nf = positive_control(phrases), negative_control(phrases)
    sf = sentence_control(phrases)
    print(f"catalogue      : {len(phrases)} phrases")
    proven = len(phrases) - len({k for k, _ in pf})
    print(f"positive ctrl  : {'PASS' if not pf else 'FAIL'} "
          f"({proven}/{len(phrases)} phrases matched on all surfaces)")
    print(f"negative ctrl  : {'PASS' if not nf else 'FAIL'} "
          f"(boundary words must not fire on words containing them)")
    print(f"sentence ctrl  : {'PASS' if not sf else 'FAIL'} "
          f"({len(MUST_CATCH)} sentences caught across "
          f"{len({_group_key(p) for p in phrases})} groups, {len(MUST_CLEAR)} left clear)")
    for _, msg in pf + nf:
        print("  CONTROL FAILED:", msg)
    for msg in sf:
        print("  CONTROL FAILED:", msg)
    if pf or nf or sf:
        print("\nControls failed -- any absence below would not be a measurement.")
        return 2

    files, hits = scan(build, phrases, waivers=waivers_data.get("waivers", []), baseline=baseline_data.get("baseline", []))
    by_kind: dict[str, int] = {}
    for _, k in files:
        by_kind[k] = by_kind.get(k, 0) + 1
    print(f"scanned        : {len(files)} files "
          f"({', '.join(f'{v} {k}' for k, v in sorted(by_kind.items()))})")

    suppressed = [h for h in hits if h.get("waived") or h.get("baselined")]
    live = [h for h in hits if not h.get("waived") and not h.get("baselined")]
    errors = [h for h in live if h["severity"] == "error"]
    warns = [h for h in live if h["severity"] != "error"]
    print(f"forbidden hits : {len(errors)}   warnings: {len(warns)}   "
          f"suppressed: {len(suppressed)} (waived/baselined)\n")

    for h in sorted(hits, key=lambda x: (x["class"], x["file"])):
        if h.get("waived"):
            tag = "waived   "
        elif h.get("baselined"):
            tag = "baselined"
        elif h["severity"] == "error":
            tag = "FORBIDDEN"
        else:
            tag = "warn     "
        print(f"  {tag} {h['class']:16s} {h['surface']:5s} {h['file']:58s} {h['phrase']!r}")

    if errors:
        print(f"\nFAIL: {len(errors)} forbidden claim(s) published. "
              f"Canonical authority: ADR 0033, Explicitly forbidden designs.")
        return 1
    print("\nPASS: no forbidden claim in the built output.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
