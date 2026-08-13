#!/usr/bin/env python3
"""Diff the rendered claim register against the register that owns it.

AAASM-5587.

WHY THIS EXISTS
---------------
`src/components/roles/briefs/register.tsx` is a copy. The register it copies
lives on the Docs Hub, in `docs/src/role-narratives.md`, and ADR 0034 puts that
page above this site in the one-product-truth hierarchy: this site may simplify
what the register says and may never broaden it.

AAASM-5584's pointer predicted what a copy does — "a second copy at the same
depth ... would drift within one release" — and the prediction was correct
inside the branch that created the copy. Review found four separate drifts
before merge: two bounds that had dropped `evidence: gap`, seven bounds
paraphrased on a page that told the reader they were quoted, and RC14 rendered
at two different strengths on two pages.

Every one of those was mechanically detectable. None was mechanically detected,
because nothing compared the two artifacts.

WHAT IT CHECKS
--------------
The BUILT output, not the source. `<Translate>` elements resolve at build time,
so the source cannot tell you what a reader gets, and the failure this guards
against is a reader getting a weaker claim than the register states.

For every register entry rendered anywhere under `build/roles/`:

  - the ADR 0033 section 6 term matches the register's term,
  - the claim sentence matches the register's claim,
  - the bound matches the register's bound,
  - and an entry rendered on more than one page is identical on all of them.

WHAT IT DOES NOT CHECK
----------------------
It does not check the register against the capability manifest — that is the
register's own invariant and the hub owns it. It does not read the zh-Hant
build: a translation is not a copy of the English string, so a text diff would
fail on every row. The locale risk is a different check and a different ticket.

USAGE
-----
    python3 scripts/check-register-drift.py build --register <path|url>

`--register` accepts a local path to `role-narratives.md` (a `docs` checkout) or
an https URL to the raw file. It defaults to the raw file on the docs repo's
default branch.

NOT WIRED INTO CI YET. Wiring it means deciding whether this repository's CI may
depend on another repository's content over the network, and whether a merge in
`docs` may turn `official-website` red. Those are cross-repo policy calls, not
this ticket's. Run it by hand after editing `register.tsx`.
"""

from __future__ import annotations

import argparse
import html
import pathlib
import re
import sys
import urllib.request

DEFAULT_REGISTER = (
    "https://raw.githubusercontent.com/ai-agent-assembly/docs/main/"
    "docs/src/role-narratives.md"
)

# RC12's bound ends by instructing the page AUTHOR not to write three specific
# phrasings. It is not rendered, deliberately: it addresses an author rather
# than a reader, and it is the one sentence in the register whose verbatim
# rendering would publish on a role page the exact wordings the product refuses
# to publish. The register may hold them because its rejected-wording section
# sits inside a `claim-gate:ignore` block; a role page has no such exemption.
#
# Declared as a named exception so it appears in the output as a decision, not
# as a silent normalisation. Anything else that goes missing still fails.
AUTHOR_INSTRUCTION = re.compile(r' do not write .*?reviewer acts\.', re.I)


def _local_file(src: str, suffix: str) -> pathlib.Path:
    """Resolve a CLI-supplied path and refuse anything that is not what we want.

    `src` comes from argv, so it is resolved before use and then checked: it
    must exist, be a regular file, and carry the expected suffix. Resolving
    first is what makes the checks meaningful — `../` segments and symlinks are
    collapsed before anything is asserted about the result, rather than after.
    """
    path = pathlib.Path(src).expanduser().resolve(strict=False)
    if path.suffix != suffix:
        raise ValueError(f"expected a {suffix} file, got {path.name}")
    if not path.is_file():
        raise FileNotFoundError(f"no such file: {path}")
    return path


def load_register(src: str) -> str:
    """Read the register from an https URL or a local markdown file.

    Only https is accepted. The register is the artifact every claim on four
    public pages is checked against, so fetching it over a channel that can be
    rewritten in transit would make a PASS meaningless — an attacker who can
    edit the response can make any drift look clean.
    """
    if src.startswith("https://"):
        with urllib.request.urlopen(src, timeout=30) as fh:  # noqa: S310
            return fh.read().decode("utf-8")
    if src.startswith("http://"):
        raise ValueError(
            "refusing to fetch the register over http — an in-transit rewrite "
            "would make a clean result meaningless; use https"
        )
    return _local_file(src, ".md").read_text(encoding="utf-8")


def parse_register(md: str) -> dict[str, dict[str, str]]:
    rows: dict[str, dict[str, str]] = {}
    for line in md.splitlines():
        m = re.match(r"\|\s*\*\*(RC\d+)\*\*\s*\|(.*)", line)
        if m:
            cells = [c.strip() for c in m.group(2).split("|")]
            if len(cells) >= 3:
                rows[m.group(1)] = {
                    "term": cells[0],
                    "claim": cells[1],
                    "bound": cells[2],
                }
    return rows


def norm(s: str) -> str:
    """Reduce to comparable wording.

    Typography, markdown emphasis, code ticks and link syntax are formatting.
    Wording is not. Everything stripped here is something that cannot change
    what a claim asserts; nothing else is stripped.
    """
    s = html.unescape(s)
    s = s.replace("’", "'").replace("“", '"').replace("”", '"')
    s = re.sub(r"<[^>]+>", "", s)
    s = s.replace("`", "").replace("**", "").replace("*", "")
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    return re.sub(r"\s+", " ", s).strip().rstrip(".").lower()


# HTML5 minification drops closing </p>, so a paragraph runs to the next tag.
# The term capture is `[^<]*` and not `.*?` on purpose: a lazy wildcard there
# will happily span the whole document to find a later match, which silently
# reads one entry's term off another entry's badge.
_HEAD = (
    r'<span class="?termBadge[^">]*"?[^>]*>([^<]*)</span>'
    r"<span class=rcBadge[^>]*>(RC\d+)</span></div>"
)
PATTERNS = {
    "card": _HEAD + r"<p class=cardText[^>]*>(.*?)<p class=cardBound[^>]*>(.*?)</div>",
    "limitation": _HEAD
    + r"<p class=limitText[^>]*>(.*?)<p class=cardBound[^>]*>(.*?)</div>",
}


def extract(build_dir: str) -> dict[str, dict]:
    """Read the rendered role pages out of a build directory.

    `build_dir` comes from argv and is resolved before it is used, then the
    globbed results are confined to it — the loop only ever opens paths the
    glob produced under the resolved root, never a path composed from input.
    """
    root = pathlib.Path(build_dir).expanduser().resolve(strict=False)
    if not root.is_dir():
        raise NotADirectoryError(f"no such build directory: {root}")
    found: dict[str, dict] = {}
    pages = sorted((root / "roles").glob("*/index.html"))
    for path in pages:
        page = path.parent.name
        doc = path.read_text(encoding="utf-8")
        for kind, pat in PATTERNS.items():
            for term, rc, text, bound in re.findall(pat, doc):
                bound = re.sub(r"^\s*<span class=boundLabel[^>]*>.*?</span>", "", bound)
                rec = found.setdefault(
                    rc, {"kind": kind, "pages": {}, "term": term}
                )
                rec["pages"][page] = (norm(term), norm(text), norm(bound))
    return found


def compare(rows, found) -> list[str]:
    problems: list[str] = []
    for rc in sorted(found, key=lambda x: int(x[2:])):
        rec = found[rc]
        if rc not in rows:
            problems.append(f"{rc}: rendered on {sorted(rec['pages'])} but not in the register")
            continue
        reg = rows[rc]
        want = (norm(reg["term"]), norm(reg["claim"]), norm(reg["bound"]))

        # An entry on several pages must be one entry, not several strings.
        distinct = set(rec["pages"].values())
        if len(distinct) > 1:
            problems.append(
                f"{rc}: rendered differently on {sorted(rec['pages'])} — an entry "
                f"cited by N pages must be one object cited N times"
            )
            continue

        got = next(iter(distinct))
        for field, w, g in zip(("term", "claim", "bound"), want, got):
            if w == g:
                continue
            if rc == "RC12" and field == "bound" and g == norm(AUTHOR_INSTRUCTION.sub("", w)):
                continue  # declared exception, see AUTHOR_INSTRUCTION
            problems.append(
                f"{rc}.{field} drifted from the register\n"
                f"      register: {w}\n"
                f"      rendered: {g}"
            )
    missing = sorted(set(rows) - set(found), key=lambda x: int(x[2:]))
    if missing:
        print(f"note: register entries not rendered on any role page: {missing}")
    return problems


def positive_control(rows, found) -> str | None:
    """Prove the comparison can fail before trusting it when it passes.

    Corrupts one bound in a copy of the register and asserts the comparison
    reports it. Without this, a change that broke extraction would report a
    clean run over zero entries and read exactly like success.
    """
    if not found:
        return "extracted 0 register entries from the build — nothing was compared"
    rc = next(iter(sorted(found, key=lambda x: int(x[2:]))))
    poisoned = {k: dict(v) for k, v in rows.items()}
    poisoned[rc]["bound"] = poisoned[rc]["bound"] + " and it catches everything."
    if not compare(poisoned, found):
        return f"positive control did not fire on a corrupted {rc} bound"
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("build", nargs="?", default="build")
    ap.add_argument("--register", default=DEFAULT_REGISTER)
    args = ap.parse_args()

    try:
        rows = parse_register(load_register(args.register))
    except Exception as exc:  # noqa: BLE001
        print(f"FAIL: could not read the register from {args.register}: {exc}")
        return 2
    if len(rows) < 16:
        print(f"FAIL: parsed {len(rows)} register entries, expected at least 16 — "
              f"the register's table shape changed and this parser did not")
        return 2

    found = extract(args.build)
    print(f"register entries in source : {len(rows)}")
    print(f"register entries rendered  : {len(found)}")

    control = positive_control(rows, found)
    if control:
        print(f"positive control : FAIL ({control})")
        return 2
    print("positive control : PASS (a corrupted bound is detected)")

    problems = compare(rows, found)
    for rc in sorted(found, key=lambda x: int(x[2:])):
        pages = ",".join(sorted(found[rc]["pages"]))
        print(f"  {rc:<5} {found[rc]['kind']:<11} {pages}")
    print()
    if problems:
        print(f"FAIL: {len(problems)} drift(s) from the register\n")
        for p in problems:
            print("  - " + p)
        return 1
    print(f"PASS: {len(found)} rendered entries match the register exactly.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
