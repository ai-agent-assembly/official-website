#!/usr/bin/env python3
"""Fail the build when it publishes a claim ADR 0033 forbids. AAASM-5696.

Run against the BUILT site, never the source:

    pnpm build && python3 scripts/check-forbidden-claims.py build

Exit 0 = clean, 1 = forbidden claim published, 2 = the checker could not prove
itself and reported nothing trustworthy.

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

import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

HERE = Path(__file__).resolve().parent
CATALOGUE = HERE / "forbidden-claims.json"

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


def load_phrases():
    data = json.loads(CATALOGUE.read_text(encoding="utf-8"))
    out = []
    for group in data["phrases"]:
        prose_only = bool(group.get("prose_only"))
        for phrase in group["any"]:
            out.append(
                {
                    "class": group["class"],
                    "locale": group.get("locale", "en"),
                    "phrase": phrase,
                    "prose_only": prose_only,
                    # Boundary only for single-word prose entries; multi-word
                    # phrases are distinctive enough and CJK has no \b.
                    "boundary": prose_only and " " not in phrase,
                    "severity": group.get("severity", "error"),
                }
            )
    return out


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


def main() -> int:
    build = Path(sys.argv[1] if len(sys.argv) > 1 else "build")
    if not build.is_dir():
        print(f"FATAL: no build directory at {build} -- run `pnpm build` first")
        return 2

    phrases = load_phrases()
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
