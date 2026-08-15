"""Shared plumbing for the AAASM-5590 audit scripts.

Three things both `audit-page-metadata.py` and `check-route-health.py` need:
the self-test result reporter, guards on the paths they are told to read and
write, and a check on the URLs the sweep is pointed at. The reporter was
previously a copy in each file.

The reporter lives here because a checker whose self-test reporting differs
between scripts is a checker whose self-test can quietly stop counting in one
of them. One implementation, one output format, one place to read.

The module name uses underscores because these two are imported; the sibling
`check-*.py` gate scripts are executed and keep the hyphens the repo uses.
"""

from __future__ import annotations

from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

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


def _resolved_within(raw: str, root: Path | None, verb: str) -> Path:
    """Build a path under `root` from segments of `raw` that are each checked.

    The path handed back is assembled from a trusted base plus segments that
    have individually been proven not to be traversal — it is not the caller's
    string with a check performed alongside it. That distinction is the whole
    point: a validate-then-use-the-original shape leaves the original in play,
    and a reader (or a scanner) cannot tell by looking that the value reaching
    the filesystem is the value that was approved.

    An absolute path is accepted only if it already sits inside `root`, and is
    then re-derived the same way.
    """
    base = (root or Path.cwd()).resolve()
    candidate = Path(raw).expanduser()

    if candidate.is_absolute():
        try:
            parts = candidate.resolve().relative_to(base).parts
        except ValueError as exc:
            raise ValueError(f"refusing to {verb} outside {base}: {raw}") from exc
    else:
        parts = candidate.parts

    safe: list[str] = []
    for part in parts:
        if part in {"", ".", ".."} or part != Path(part).name:
            raise ValueError(f"refusing to {verb} outside {base}: {raw}")
        safe.append(part)
    if not safe:
        raise ValueError(f"empty path, refusing to {verb}: {raw}")

    return base.joinpath(*safe)


def safe_output_path(raw: str, *, root: Path | None = None) -> Path:
    """Resolve the `--json <path>` these scripts write, refusing to leave `root`."""
    return _resolved_within(raw, root, "write")


def safe_input_dir(raw: str, *, root: Path | None = None) -> Path:
    """Resolve the `--build <dir>` the sweep walks, refusing to leave `root`."""
    return _resolved_within(raw, root, "read")


def validated_request_url(raw: str) -> str:
    """Rebuild `raw` from parts that have each been checked, else raise.

    The sweep builds request URLs from an operator-supplied `--origin`. Pinning
    the scheme keeps a mistyped or hostile origin from turning the sweep into a
    reader of `file://` or of some other scheme urllib is willing to open.

    The return value is reassembled with `urlunsplit` from the checked
    components rather than handed back as the original string: what the caller
    requests is then the thing this function validated, with no room for a
    fragment or an embedded credential to ride along unexamined.
    """
    parts = urlsplit(raw)
    if parts.scheme not in ALLOWED_URL_SCHEMES:
        raise ValueError(f"unsupported URL scheme {parts.scheme!r}: {raw}")
    if not parts.hostname:
        raise ValueError(f"URL has no host: {raw}")
    if parts.username or parts.password:
        raise ValueError(f"URL carries credentials, refusing: {raw}")
    netloc = parts.hostname if parts.port is None else f"{parts.hostname}:{parts.port}"
    return urlunsplit((parts.scheme, netloc, parts.path, parts.query, ""))
