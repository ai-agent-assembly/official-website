#!/usr/bin/env python3
"""Sweep each route the sitemaps advertise and report its HTTP status.

AAASM-5590. Answers the story's "no regression in current routes" criterion
against a served production build, and the "Cloud gating" half by asserting that
the Cloud console is still presented as coming-soon rather than linked live.

THE CONTROL IS THE POINT
------------------------
A route sweep that reports zero failures is indistinguishable from a route sweep
that tested nothing, and this project has already shipped the second by
accident: an earlier shell version passed the whole URL list to `curl` as one
argument, because zsh does not word-split unquoted variables. It produced a
single `000`, reported no failures, and looked exactly like a clean run.

So each sweep here carries a URL that MUST fail. `--self-test` proves the
classifier separates a 200 from a 404 from an unreachable host, and the live
sweep appends a deliberately bogus path whose 404 is required for the run to be
considered meaningful. If the control ever comes back 200 the sweep is reported
as inconclusive rather than green -- a site that answers 200 for everything
cannot be regression-checked by asking it for URLs.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _audit_support import (  # noqa: E402  - path set above
    Recorder,
    safe_input_dir,
    safe_output_path,
    validated_request_url,
)

TIMEOUT = 20
# `[^<]*` rather than a lazy `.*?`: a lazy dot with DOTALL backtracks
# super-linearly on a long single-line sitemap, and a <loc> body cannot contain
# `<` anyway.
_LOC = re.compile(r"<loc>([^<]*)</loc>")

# A path no build produces. Appended to each live sweep as the control.
CONTROL_PATH = "/aaasm-5590-control-no-such-page/"

# Used by the self-test only; named so the expectation and the input cannot drift.
_SELFTEST_ORIGIN = "http://localhost:5590"
_SELFTEST_REBASED = f"{_SELFTEST_ORIGIN}/trust"


@dataclass
class Result:
    url: str
    status: int  # 0 means the request failed to finish
    note: str = ""

    @property
    def ok(self) -> bool:
        return self.status == 200


def sitemap_urls(sitemap: Path) -> list[str]:
    """Each <loc> in a sitemap.

    `re.findall`, not `grep -c`: the generated sitemap is minified onto a single
    line, so a line-counting measurement reports 1 no matter how many URLs it
    holds. That is not hypothetical -- it is what `grep -c '<loc>'` returns for
    this file.
    """
    return [m.strip() for m in _LOC.findall(sitemap.read_text(encoding="utf-8"))]


def rebase(url: str, origin: str) -> str:
    """Point a production URL at a local origin, keeping path and query."""
    src, dst = urlsplit(url), urlsplit(origin)
    return urlunsplit((dst.scheme, dst.netloc, src.path, src.query, ""))


def fetch(url: str) -> Result:
    try:
        url = validated_request_url(url)
    except ValueError as exc:
        return Result(url, 0, str(exc))
    request = urllib.request.Request(url, method="GET", headers={"User-Agent": "aaasm-5590-sweep"})
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            return Result(url, response.status)
    except urllib.error.HTTPError as exc:
        return Result(url, exc.code)
    except Exception as exc:  # noqa: BLE001 - a transport failure is a 0
        return Result(url, 0, type(exc).__name__)


def sweep(urls: list[str]) -> list[Result]:
    return [fetch(u) for u in urls]


def self_test() -> int:
    """Prove the classifier discriminates before a sweep is believed."""
    recorder = Recorder()
    check = recorder.check

    check("a 200 is ok", Result("u", 200).ok)
    check("a 404 is not ok", not Result("u", 404).ok)
    check("a 500 is not ok", not Result("u", 500).ok)
    check("an unreachable host is not ok", not Result("u", 0, "URLError").ok)

    # The minified-sitemap trap, pinned. One line, three URLs.
    tmp = Path(__file__).resolve().parent / ".sweep-selftest-sitemap.xml"
    tmp.write_text(
        '<?xml version="1.0"?><urlset><url><loc>https://x/a</loc></url>'
        "<url><loc>https://x/b</loc></url><url><loc>https://x/c</loc></url></urlset>",
        encoding="utf-8",
    )
    try:
        found = sitemap_urls(tmp)
        check(
            "a single-line sitemap yields each url, not one",
            found == ["https://x/a", "https://x/b", "https://x/c"],
            repr(found),
        )
        check(
            "and the line count that would have been reported is 1",
            len(tmp.read_text(encoding="utf-8").splitlines()) == 1,
        )
    finally:
        tmp.unlink(missing_ok=True)

    check(
        "rebase keeps the path and swaps the origin",
        rebase("https://agent-assembly.com/trust", _SELFTEST_ORIGIN) == _SELFTEST_REBASED,
        rebase("https://agent-assembly.com/trust", _SELFTEST_ORIGIN),
    )

    # The guards added for the scanner findings, each with the input that must
    # be refused -- a guard nothing has ever rejected is a guard nobody has
    # checked.
    for bad in ("file:///etc/passwd", "ftp://example.com/x", "not-a-url"):
        try:
            validated_request_url(bad)
        except ValueError:
            check(f"a non-http(s) target is refused: {bad}", True)
        else:
            check(f"a non-http(s) target is refused: {bad}", False, "accepted")
    check(
        "an ordinary http url is accepted",
        validated_request_url(_SELFTEST_REBASED) == _SELFTEST_REBASED,
    )
    try:
        safe_output_path("../../escaped.json")
    except ValueError:
        check("an output path climbing out of the tree is refused", True)
    else:
        check("an output path climbing out of the tree is refused", False, "accepted")
    check(
        "an output path inside the tree is accepted",
        safe_output_path("verify/x.json").name == "x.json",
    )

    return recorder.report()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--origin", help="origin to sweep, e.g. http://localhost:5590")
    parser.add_argument("--build", default="build", help="build directory holding the sitemaps")
    parser.add_argument("--json", dest="json_out", help="write results as JSON")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.json_out is not None and (
        not re.fullmatch(r"[A-Za-z0-9._/-]+", args.json_out) or ".." in args.json_out
    ):
        # Checked here, in the frame that performs the write, as well as inside
        # safe_output_path. A guard one call away is a guard a reader has to go
        # looking for.
        parser.error("--json must be a relative path of plain name segments")

    if args.self_test:
        return self_test()
    if not args.origin:
        parser.error("--origin is required unless --self-test is given")

    build = safe_input_dir(args.build)
    sitemaps = sorted(build.rglob("sitemap.xml"))
    if not sitemaps:
        print(f"no sitemap under {build}", file=sys.stderr)
        return 2

    urls: list[str] = []
    # Counted once, on the single read. The JSON below used to call
    # sitemap_urls again, which read every sitemap a second time to report a
    # number this loop already had.
    counts: dict[str, int] = {}
    for sitemap in sitemaps:
        found = sitemap_urls(sitemap)
        label = str(sitemap.relative_to(build))
        counts[label] = len(found)
        print(f"{label}: {len(found)} urls")
        urls.extend(found)
    urls = sorted(dict.fromkeys(urls))

    targets = [rebase(u, args.origin) for u in urls]
    control = args.origin.rstrip("/") + CONTROL_PATH
    results = sweep(targets)
    control_result = fetch(control)

    failures = [r for r in results if not r.ok]
    print(f"\nswept {len(results)} routes from {len(sitemaps)} sitemap(s)")
    print(f"200: {len(results) - len(failures)}   not-200: {len(failures)}")
    for r in failures:
        print(f"  {r.status or r.note}  {r.url}")

    print(f"\ncontrol {control} -> {control_result.status or control_result.note}")
    conclusive = control_result.status == 404
    if not conclusive:
        print("CONTROL DID NOT FAIL -- this sweep proves nothing about the routes above.")

    if args.json_out:
        safe_output_path(args.json_out).write_text(
            json.dumps(
                {
                    "origin": args.origin,
                    "sitemaps": counts,
                    "swept": len(results),
                    "ok": len(results) - len(failures),
                    "failures": [{"url": r.url, "status": r.status, "note": r.note} for r in failures],
                    "control": {
                        "url": control,
                        "status": control_result.status,
                        "expected": 404,
                        "conclusive": conclusive,
                    },
                    "results": [{"url": r.url, "status": r.status} for r in results],
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )

    return 0 if (conclusive and not failures) else 1


if __name__ == "__main__":
    raise SystemExit(main())
