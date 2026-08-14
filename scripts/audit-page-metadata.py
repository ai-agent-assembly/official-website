#!/usr/bin/env python3
"""Audit the built site's per-page metadata against the page it describes.

AAASM-5590. Reads `build/` output, never source: source is what we wrote, the
build is what a crawler and a social card actually receive, and the two differ
in exactly the way that matters here (see WHY A PARSER below).

WHAT THIS ANSWERS
-----------------
The story's SEO acceptance criterion is "SEO/metadata do not contain broader
claims than visible page content". That is a containment question, not a
spell-check: for every page, the governance vocabulary a metadata surface
asserts must also be asserted by the body a reader lands on. A description that
promises `Denied before execution` above a page that only demonstrates
`Detected` is the specific defect; it is invisible to any check that reads
metadata alone, because the sentence is perfectly true in isolation.

Alongside that it inventories the two dull failures that were measured on this
site and are worth keeping measured: pages with no description at all, and
descriptions shared by several pages.

WHY A PARSER, NOT A REGEX
-------------------------
The production HTML is minified and **attributes are unquoted** unless the value
contains a space:

    <link data-rh=true rel=canonical href=https://agent-assembly.com/trust />
    <meta data-rh=true name=description content="What Agent Assembly ..." />

An extractor written for `href="..."` matches the second line and not the first,
so it reports zero canonicals and zero hreflang alternates on every page and
certifies the site clean. That shape has already produced a passing gate over
real defects on a sibling site. `html.parser` decides quoting per attribute the
way a browser does, so the class of bug cannot recur here by construction —
and `--self-test` pins that with an unquoted fixture whose expected result is
the values, not "no crash".

The self-test is the point of this file as much as the audit is. Every check
below has a fixture that MUST trip it; a checker that silently matches nothing
looks exactly like a clean site.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent


def _load_terms() -> tuple[tuple[str, str], ...]:
    """Borrow the ADR 0033 §6 vocabulary from the module that already owns it.

    `trust-evidence.py` holds the eleven terms in the ADR's own order and is the
    file the trust page is generated from. Restating them here would create a
    second list to drift, and this repo's whole claim discipline is that a term
    has one home.
    """
    spec = importlib.util.spec_from_file_location(
        "_trust_evidence", SCRIPTS_DIR / "trust-evidence.py"
    )
    if spec is None or spec.loader is None:  # pragma: no cover - defensive
        raise RuntimeError("cannot load scripts/trust-evidence.py")
    module = importlib.util.module_from_spec(spec)
    # Registered before execution, not after. `@dataclass` resolves its own
    # module through `sys.modules[cls.__module__]`, so a module that gains a
    # module-level dataclass would raise AttributeError on a bare exec_module.
    # Costs one line; removes a way for this loader to break on a file it does
    # not own.
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return tuple(module.TERMS)


TERMS = _load_terms()
PROSE_TERMS = tuple(prose for _, prose in TERMS)

# The four enforcement terms in increasing strength, as ADR 0033 §6 orders them.
# Only these four form a ladder. The remaining seven are qualifiers and maturity
# states with no defensible "stronger than" relation between them, so they are
# checked for containment only -- inventing a rank for `Degraded` against
# `Planned` would be this script asserting a design decision no ADR records.
LADDER = ("Observed", "Detected", "Evaluated", "Denied before execution")
LADDER_RANK = {term: i for i, term in enumerate(LADDER)}

# Tags whose text is not read by a visitor and must not count as page content.
_NON_CONTENT = {"script", "style", "noscript", "template"}


@dataclass
class PageMeta:
    """Everything this audit needs from one built HTML file."""

    route: str = ""
    title: str = ""
    description: str = ""
    canonical: str = ""
    og: dict[str, str] = field(default_factory=dict)
    twitter: dict[str, str] = field(default_factory=dict)
    alternates: list[tuple[str, str]] = field(default_factory=list)
    jsonld: list[str] = field(default_factory=list)
    body_text: str = ""

    def metadata_surfaces(self) -> dict[str, str]:
        """The strings a search result or a social card can quote back."""
        surfaces = {"description": self.description, "title": self.title}
        for key, value in self.og.items():
            surfaces[f"og:{key}"] = value
        for key, value in self.twitter.items():
            surfaces[f"twitter:{key}"] = value
        for i, blob in enumerate(self.jsonld):
            surfaces[f"json-ld[{i}]"] = blob
        return {k: v for k, v in surfaces.items() if v}


class _HeadParser(HTMLParser):
    """Quote-tolerant reader for head metadata plus visible body text."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.meta = PageMeta()
        self._skip_depth = 0
        self._in_jsonld = False
        self._text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        a = {k.lower(): (v or "") for k, v in attrs}
        if tag in _NON_CONTENT:
            self._skip_depth += 1
            if tag == "script" and a.get("type", "").lower() == "application/ld+json":
                self._in_jsonld = True
            return
        if tag == "meta":
            name = a.get("name", "").lower()
            prop = a.get("property", "").lower()
            content = a.get("content", "")
            if name == "description":
                self.meta.description = content
            elif prop.startswith("og:"):
                self.meta.og[prop[3:]] = content
            elif name.startswith("twitter:"):
                self.meta.twitter[name[8:]] = content
        elif tag == "link":
            rel = a.get("rel", "").lower()
            if rel == "canonical":
                self.meta.canonical = a.get("href", "")
            elif rel == "alternate" and a.get("hreflang"):
                self.meta.alternates.append((a["hreflang"], a.get("href", "")))
        elif tag == "title":
            self._in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag in _NON_CONTENT:
            self._skip_depth = max(0, self._skip_depth - 1)
            self._in_jsonld = False
        elif tag == "title":
            self._in_title = False

    _in_title = False

    def handle_data(self, data: str) -> None:
        if self._in_jsonld:
            self.meta.jsonld.append(data.strip())
            return
        if self._skip_depth:
            return
        if self._in_title and not self.meta.title:
            self.meta.title = data.strip()
            return
        stripped = data.strip()
        if stripped:
            self._text.append(stripped)

    def finish(self) -> PageMeta:
        self.meta.body_text = " ".join(self._text)
        return self.meta


def parse_html(html: str) -> PageMeta:
    parser = _HeadParser()
    parser.feed(html)
    parser.close()
    return parser.finish()


def _terms_in(text: str) -> set[str]:
    """ADR 0033 §6 prose terms present in `text`, matched case-insensitively.

    Word boundaries via `re`, never via `grep -E`, which accepts `\\b` and
    silently ignores it. Longest-first so `Denied before execution` is not also
    reported as a bare match of some shorter overlapping term.
    """
    found: set[str] = set()
    for term in sorted(PROSE_TERMS, key=len, reverse=True):
        if re.search(rf"\b{re.escape(term)}\b", text, flags=re.IGNORECASE):
            found.add(term)
    return found


@dataclass
class Finding:
    check: str
    route: str
    detail: str


def audit_pages(pages: list[PageMeta]) -> list[Finding]:
    findings: list[Finding] = []

    # C1 -- a page with no description lets the engine invent one.
    for page in pages:
        if not page.description.strip():
            findings.append(Finding("missing-description", page.route, "no meta description"))

    # C2 -- one description across many pages collapses them in a result list.
    by_description: dict[str, list[str]] = defaultdict(list)
    for page in pages:
        if page.description.strip():
            by_description[page.description.strip()].append(page.route)
    for description, routes in sorted(by_description.items()):
        if len(routes) > 1:
            findings.append(
                Finding(
                    "duplicate-description",
                    ", ".join(sorted(routes)),
                    f"{len(routes)} pages share one description: {description[:70]}...",
                )
            )

    # C3 -- the acceptance criterion proper. A governance term asserted by a
    # metadata surface must be asserted by the page that surface describes.
    for page in pages:
        body_terms = _terms_in(page.body_text)
        for surface, value in page.metadata_surfaces().items():
            for term in _terms_in(value) - body_terms:
                findings.append(
                    Finding(
                        "term-not-in-body",
                        page.route,
                        f"{surface} asserts '{term}', absent from page body",
                    )
                )

    # C4 -- and where the terms do form a ladder, metadata must not climb it.
    for page in pages:
        body_rank = max(
            (LADDER_RANK[t] for t in _terms_in(page.body_text) if t in LADDER_RANK),
            default=-1,
        )
        for surface, value in page.metadata_surfaces().items():
            for term in _terms_in(value):
                if term in LADDER_RANK and LADDER_RANK[term] > body_rank:
                    findings.append(
                        Finding(
                            "ladder-upgrade",
                            page.route,
                            f"{surface} claims '{term}'; page reaches at most "
                            f"'{LADDER[body_rank] if body_rank >= 0 else 'none'}'",
                        )
                    )

    return findings


def route_of(path: Path, build_dir: Path) -> str:
    rel = path.relative_to(build_dir)
    parts = rel.parts
    if parts[-1] == "index.html":
        parts = parts[:-1]
    else:
        parts = parts[:-1] + (rel.stem,)
    return "/" + "/".join(parts) + ("/" if parts else "")


def collect(build_dir: Path) -> list[PageMeta]:
    pages: list[PageMeta] = []
    for html_path in sorted(build_dir.rglob("*.html")):
        page = parse_html(html_path.read_text(encoding="utf-8", errors="replace"))
        page.route = route_of(html_path, build_dir)
        pages.append(page)
    return pages


# --------------------------------------------------------------------------- #
# self-test -- every check gets a fixture that must trip it
# --------------------------------------------------------------------------- #

# The control this whole file exists for. Unquoted attributes, exactly as the
# minifier emits them. The assertion is on the extracted VALUES: a parser that
# returned empty strings here would still "not crash", and that is the failure
# this fixture is aimed at.
UNQUOTED_FIXTURE = (
    "<html><head>"
    "<title>Trust</title>"
    "<link data-rh=true rel=canonical href=https://agent-assembly.com/trust />"
    "<link data-rh=true rel=alternate href=https://agent-assembly.com/trust hreflang=en />"
    "<link data-rh=true rel=alternate href=https://agent-assembly.com/zh-Hant/trust hreflang=zh-Hant />"
    "<meta data-rh=true name=description content=Observed />"
    "<meta data-rh=true property=og:url content=https://agent-assembly.com/trust />"
    "</head><body><p>Observed</p></body></html>"
)


def _page(route: str, description: str, body: str, **kw: object) -> PageMeta:
    page = parse_html(
        f"<html><head><meta name=description content=\"{description}\"></head>"
        f"<body><p>{body}</p></body></html>"
    )
    page.route = route
    for key, value in kw.items():
        setattr(page, key, value)
    return page


def self_test() -> int:
    results: list[tuple[str, bool, str]] = []

    def check(name: str, ok: bool, detail: str = "") -> None:
        results.append((name, ok, detail))

    # --- the unquoted-attribute control -------------------------------------
    p = parse_html(UNQUOTED_FIXTURE)
    check(
        "unquoted: canonical extracted",
        p.canonical == "https://agent-assembly.com/trust",
        repr(p.canonical),
    )
    check(
        "unquoted: both hreflang alternates extracted",
        sorted(h for h, _ in p.alternates) == ["en", "zh-Hant"],
        repr(p.alternates),
    )
    check("unquoted: description extracted", p.description == "Observed", repr(p.description))
    check(
        "unquoted: og:url extracted",
        p.og.get("url") == "https://agent-assembly.com/trust",
        repr(p.og),
    )
    # The negative control for the control: prove a quote-only extractor really
    # does fail on this fixture, so the parser choice above is load-bearing and
    # not merely decorative.
    check(
        "unquoted: a quote-only regex finds nothing (why the parser is required)",
        re.search(r'href="[^"]*"', UNQUOTED_FIXTURE) is None,
        "a quoted href appeared in the fixture; the control no longer controls",
    )

    # --- C1 missing description ---------------------------------------------
    bare = parse_html("<html><head><title>x</title></head><body><p>hi</p></body></html>")
    bare.route = "/bare/"
    f = audit_pages([bare])
    check("C1 trips on a page with no description", any(x.check == "missing-description" for x in f))
    check(
        "C1 stays silent on a page that has one",
        not any(
            x.check == "missing-description"
            for x in audit_pages([_page("/a/", "A distinct sentence.", "body")])
        ),
    )

    # --- C2 duplicate description -------------------------------------------
    dupes = [_page("/a/", "Same sentence.", "body"), _page("/b/", "Same sentence.", "body")]
    check(
        "C2 trips when two pages share a description",
        any(x.check == "duplicate-description" for x in audit_pages(dupes)),
    )
    distinct = [_page("/a/", "One sentence.", "body"), _page("/b/", "Another sentence.", "body")]
    check(
        "C2 stays silent when descriptions differ",
        not any(x.check == "duplicate-description" for x in audit_pages(distinct)),
    )

    # --- C3 term containment -------------------------------------------------
    broader = _page("/x/", "Denied before execution on every path.", "This page only Observed things.")
    check(
        "C3 trips when metadata asserts a term the body does not",
        any(x.check == "term-not-in-body" for x in audit_pages([broader])),
    )
    contained = _page("/y/", "Observed activity.", "Observed activity is recorded here.")
    check(
        "C3 stays silent when the body carries the same term",
        not any(x.check == "term-not-in-body" for x in audit_pages([contained])),
    )
    # A term inside a social card must be caught too, not only `description`.
    og_only = _page("/z/", "Neutral sentence.", "Observed only.", og={"description": "Evaluated calls."})
    check(
        "C3 reads og:description, not just meta description",
        any(x.check == "term-not-in-body" and "og:description" in x.detail for x in audit_pages([og_only])),
    )

    # --- C4 ladder upgrade ---------------------------------------------------
    upgrade = _page("/u/", "Evaluated before it runs.", "We report Detected calls.")
    check(
        "C4 trips when metadata climbs the enforcement ladder",
        any(x.check == "ladder-upgrade" for x in audit_pages([upgrade])),
    )
    level = _page("/v/", "Detected calls.", "We report Detected calls.")
    check(
        "C4 stays silent at the same rung",
        not any(x.check == "ladder-upgrade" for x in audit_pages([level])),
    )
    downgrade = _page("/w/", "Detected calls.", "Evaluated and Detected calls.")
    check(
        "C4 stays silent when metadata is weaker than the page",
        not any(x.check == "ladder-upgrade" for x in audit_pages([downgrade])),
    )

    # --- word-boundary matching ---------------------------------------------
    check(
        "terms match on word boundaries, not substrings",
        _terms_in("undetected") == set() and _terms_in("Detected") == {"Detected"},
        repr(_terms_in("undetected")),
    )
    # Body text must exclude script bodies, or a JS bundle mentioning a term
    # would satisfy containment for a page that never shows it to a reader.
    scripted = parse_html(
        "<html><head><meta name=description content='Denied before execution'></head>"
        "<body><script>var x = 'Denied before execution';</script><p>Observed</p></body></html>"
    )
    scripted.route = "/s/"
    check(
        "script bodies do not count as visible page content",
        any(x.check == "term-not-in-body" for x in audit_pages([scripted])),
    )

    check(
        "the eleven ADR 0033 §6 terms are loaded from trust-evidence.py",
        len(PROSE_TERMS) == 11,
        f"{len(PROSE_TERMS)} terms",
    )

    failed = 0
    for name, ok, detail in results:
        if not ok:
            failed += 1
            print(f"FAIL  {name}" + (f"  -- {detail}" if detail else ""))
        else:
            print(f"ok    {name}")
    print(f"\nself-test: {len(results) - failed}/{len(results)} checks passed")
    return 1 if failed else 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("build", nargs="?", help="path to the build/ directory")
    parser.add_argument("--self-test", action="store_true", help="run the fixtures and exit")
    parser.add_argument("--json", dest="json_out", help="write findings and inventory as JSON")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="exit non-zero when any finding is reported",
    )
    args = parser.parse_args()

    if args.self_test:
        return self_test()
    if not args.build:
        parser.error("a build directory is required unless --self-test is given")

    build_dir = Path(args.build)
    if not build_dir.is_dir():
        print(f"not a directory: {build_dir}", file=sys.stderr)
        return 2

    pages = collect(build_dir)
    findings = audit_pages(pages)

    print(f"pages scanned: {len(pages)}")
    print(f"with description: {sum(1 for p in pages if p.description.strip())}")
    print(f"with canonical: {sum(1 for p in pages if p.canonical)}")
    print(f"with hreflang alternates: {sum(1 for p in pages if p.alternates)}")
    print()
    by_check: dict[str, list[Finding]] = defaultdict(list)
    for finding in findings:
        by_check[finding.check].append(finding)
    for check_name in sorted(by_check):
        print(f"[{check_name}] {len(by_check[check_name])}")
        for finding in by_check[check_name]:
            print(f"  {finding.route}\n    {finding.detail}")
        print()
    if not findings:
        print("no findings")

    if args.json_out:
        Path(args.json_out).write_text(
            json.dumps(
                {
                    "pages": [
                        {
                            "route": p.route,
                            "title": p.title,
                            "description": p.description,
                            "canonical": p.canonical,
                            "alternates": p.alternates,
                            "og": p.og,
                            "twitter": p.twitter,
                        }
                        for p in pages
                    ],
                    "findings": [
                        {"check": f.check, "route": f.route, "detail": f.detail} for f in findings
                    ],
                },
                indent=2,
                ensure_ascii=False,
            )
            + "\n",
            encoding="utf-8",
        )

    return 1 if (args.strict and findings) else 0


if __name__ == "__main__":
    raise SystemExit(main())
