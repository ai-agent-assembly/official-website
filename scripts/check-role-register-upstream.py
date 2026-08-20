#!/usr/bin/env python3
"""Prove the vendored, pinned role register still matches the live upstream page.

AAASM-5763, mirroring `docs/scripts/check_capability_surface_upstream.py`
(AAASM-5600)'s own role for `capability-surface.toml`: `sync-role-register.py`
produces a committed snapshot; this script is the second half nobody wired
into CI (deliberately, same reasoning as its capability-manifest sibling --
it needs a network fetch, and CI proving the *pin* matches the *build* is a
different, narrower property than CI proving the pin still matches *upstream*).

Run by hand, after any suspected upstream edit to
`docs/src/role-narratives.md`, or on whatever cadence a human decides:

    python3 scripts/check-role-register-upstream.py

Reuses `check-register-drift.py`'s own `load_register`/`parse_register`, not a
second implementation of either -- this script's only job is comparing two
loads of the same parser against two different sources.
"""

from __future__ import annotations

import importlib.util
import pathlib
import sys

SCRIPTS_DIR = pathlib.Path(__file__).resolve().parent
VENDOR_PATH = SCRIPTS_DIR.parent / "vendor" / "role-narratives.md"


def _load_check_register_drift():
    """Borrow load_register/parse_register from the module that owns them --
    hyphenated filename, so a plain `import` can't reach it (see
    audit-page-metadata.py's identical loader for `trust-evidence.py`)."""
    spec = importlib.util.spec_from_file_location("_check_register_drift", SCRIPTS_DIR / "check-register-drift.py")
    if spec is None or spec.loader is None:  # pragma: no cover - defensive
        raise RuntimeError("cannot load scripts/check-register-drift.py")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def main() -> int:
    crd = _load_check_register_drift()
    live = crd.parse_register(crd.load_register(None))  # None => fetch REGISTER_URL
    pinned = crd.parse_register(crd.load_register(str(VENDOR_PATH)))

    live_ids, pinned_ids = set(live), set(pinned)
    problems = []

    if live_ids - pinned_ids:
        problems.append(f"upstream has entries the pin doesn't: {sorted(live_ids - pinned_ids)}")
    if pinned_ids - live_ids:
        problems.append(f"pin has entries upstream no longer does: {sorted(pinned_ids - live_ids)}")
    for rc in sorted(live_ids & pinned_ids):
        for field in ("term", "claim", "bound"):
            if live[rc][field] != pinned[rc][field]:
                problems.append(f"{rc}.{field} drifted from the live upstream page")

    if problems:
        print("STALE PIN — the vendored role register no longer matches upstream:")
        for p in problems:
            print(f"  - {p}")
        print("\nRegenerate with: python3 scripts/sync-role-register.py --docs-checkout <path> --source-commit <sha>")
        return 1

    print(f"check-role-register-upstream: pin matches live upstream ({len(live_ids)} entries)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
