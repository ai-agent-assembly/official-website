"""Shared plumbing for the AAASM-5590 audit scripts.

Two things both `audit-page-metadata.py` and `check-route-health.py` need and
were holding their own copy of: the self-test result reporter, and a guard on
the path they are told to write JSON to.

The reporter lives here because a checker whose self-test reporting differs
between scripts is a checker whose self-test can quietly stop counting in one
of them. One implementation, one output format, one place to read.

The module name uses underscores because these two are imported; the sibling
`check-*.py` gate scripts are executed and keep the hyphens the repo uses.
"""

from __future__ import annotations

from pathlib import Path
from urllib.parse import urlsplit

SelfTestResult = tuple[str, bool, str]

ALLOWED_URL_SCHEMES = frozenset({"http", "https"})


class Recorder:
    """Collects self-test outcomes so the caller reads as a list of claims."""

    def __init__(self) -> None:
        self._results: list[SelfTestResult] = []

    def check(self, name: str, ok: bool, detail: str = "") -> None:
        self._results.append((name, bool(ok), detail))

    @property
    def results(self) -> list[SelfTestResult]:
        return list(self._results)

    def report(self) -> int:
        """Print each outcome and return a process exit code."""
        failed = 0
        for name, ok, detail in self._results:
            if ok:
                print(f"ok    {name}")
            else:
                failed += 1
                print(f"FAIL  {name}" + (f"  -- {detail}" if detail else ""))
        print(f"\nself-test: {len(self._results) - failed}/{len(self._results)} checks passed")
        return 1 if failed else 0


def safe_output_path(raw: str, *, root: Path | None = None) -> Path:
    """Resolve an operator-supplied output path, refusing to leave `root`.

    These scripts take `--json <path>` and write it. Resolving first and then
    requiring the result to sit inside the working tree means a path assembled
    from `..` segments fails loudly here rather than writing somewhere the
    operator did not mean. The check is on the RESOLVED path, so it is not
    fooled by a symlink or by separators embedded mid-string.
    """
    base = (root or Path.cwd()).resolve()
    candidate = Path(raw).expanduser()
    resolved = (base / candidate).resolve() if not candidate.is_absolute() else candidate.resolve()
    if resolved != base and base not in resolved.parents:
        raise ValueError(f"refusing to write outside {base}: {raw}")
    return resolved


def validated_request_url(raw: str) -> str:
    """Return `raw` if it is an ordinary http(s) URL, else raise.

    The sweep builds request URLs from an operator-supplied `--origin`. Pinning
    the scheme keeps a mistyped or hostile origin from turning the sweep into a
    reader of `file://` or of some other scheme urllib is willing to open.
    """
    parts = urlsplit(raw)
    if parts.scheme not in ALLOWED_URL_SCHEMES:
        raise ValueError(f"unsupported URL scheme {parts.scheme!r}: {raw}")
    if not parts.netloc:
        raise ValueError(f"URL has no host: {raw}")
    return raw
