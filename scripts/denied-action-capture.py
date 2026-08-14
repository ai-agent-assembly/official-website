#!/usr/bin/env python3
"""Record the denied-action proof rendered by `/denied-action-proof`. AAASM-5589.

    python3 scripts/denied-action-capture.py                    # write the recording
    python3 scripts/denied-action-capture.py --sever-enforcement  # falsification run

Why this script is separate from `scripts/denied-action-proof.py`
-----------------------------------------------------------------
The other script is stdlib-only and runs in CI. This one imports the released
Python SDK and a real agent framework from PyPI, so it cannot. Folding the two
together would cost the stdlib-only property that lets the CI gate run on the
runner's system `python3` with no install step -- and that property is what
makes the gate cheap enough to keep.

The split also matches what each artifact is. This script produces evidence by
running something. The other one only reads that evidence back and compares it
to what shipped; it must never be able to produce the numbers it checks.

What is being proved
--------------------
A `DENIED` badge on a page is a label the page draws for itself. It is evidence
of nothing. So the scenario is built around a side effect that exists outside
every component involved in the decision: one smolagents tool,
`write_incident_report`, whose `forward` body writes a file. Whether that file
exists afterwards is read back by a **separate operating-system process** that
imports no product code, cannot reach the policy engine or the adapter, and
never sees the tool's return value. Its answer is therefore not derived from the
component that reported the denial.

Three arms, each moving exactly one variable
--------------------------------------------
  denied              enforcement installed, policy denies      expect: no file
  allowed             enforcement installed, policy allows      expect: file
  enforcement_removed enforcement absent,    policy denies      expect: file

`allowed` moves the policy and holds the shim; `enforcement_removed` moves the
shim and holds the policy. Neither alone would settle it: without `allowed` the
file's absence could be a harness that never writes anything, and without
`enforcement_removed` it could be a policy that no component ever consulted.
Together they show the absence in `denied` tracks the enforcement path.

`--sever-enforcement` runs the `denied` arm with the shim uninstalled. Its
post-condition then fails and this script exits 1 -- the run that shows the
check is capable of going red, which is the only thing that makes a green one
worth reading. Its output goes to stdout, never to the committed recording.

Method provenance
-----------------
The ordering rule -- assert the absence of the effect *before* asserting the
error, so a harness that stops early still fails -- is AAASM-5529's, from the
negative-control suites on `main` in the three SDK repos.

What this adds is not a different method but a different subject. Those suites
stand a test double in for the component that decides (`install_fake_core` /
`FakeRuntimeClient`), which is the right call for a unit test and means what
they establish is not reproducible from an installed package. This runs the
same method against the **released** SDK on a real framework adapter, so a
reader reproduces it from PyPI, and reads the post-condition from outside the
process rather than from a fixture inside it.

An earlier draft of this paragraph said the upstream suites were on an unmerged
branch. That was false -- read out of a stale local checkout rather than from
`origin/main` -- and it is recorded here because the correction changes which
justification this file rests on, not merely its wording.

Safety
------
No network, no credentials, no gateway, no shell execution, no destructive call.
The only side effect is a text file inside a `tempfile.TemporaryDirectory` that
is removed when the arm ends. The observer subprocess is given a minimal
environment, so no ambient variable can be carried into a committed artifact.

Reproducing
-----------
    uv venv --python 3.12 .proofenv
    VIRTUAL_ENV=.proofenv uv pip install 'agent-assembly==0.0.1rc6' \
        'smolagents>=1.26.0,<2.0.0'
    git show HEAD:metadata/denied-action-proof.json > /tmp/baseline.json
    .proofenv/bin/python scripts/denied-action-capture.py
    pnpm exec prettier --write metadata/denied-action-proof.json
    python3 scripts/denied-action-proof.py compare /tmp/baseline.json
    pnpm proof:generate

The `prettier` step is cosmetic and required: `format:check` is a CI gate and
this script writes `json.dumps` output, which keeps short arrays expanded where
`prettier` collapses them. Nothing downstream cares -- the checker reads the
file with `json.loads` -- so the formatting run is the last step rather than a
constraint on this script's output.

What a re-record should and should not change
---------------------------------------------
Every measured field is reproduced exactly. `provenance.capturedOn` is not, and
must not be: it advances to the day the re-record ran, because the measurement
was genuinely re-taken. `compare` is the check for exactly that shape -- it
requires equality everywhere else and reports the two dates -- so "the
transcript is deterministic" stays a claim someone can test rather than a claim
that quietly excuses any difference.
"""

from __future__ import annotations

import argparse
import json
import platform
import subprocess
import sys
import tempfile
from datetime import date
from importlib import metadata as importlib_metadata
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parent.parent
RECORDING = REPO / "metadata" / "denied-action-proof.json"

TICKET = "AAASM-5589"
EPIC = "AAASM-5579"
METHOD_TICKET = "AAASM-5529"

#: The file the governed tool body writes. Its presence or absence *is* the
#: measurement: every sentence the page publishes reduces to whether this name
#: appears in a directory listing taken by a process that knows nothing about
#: governance.
SIDE_EFFECT_FILE = "incident-report.txt"

#: The tool the policy refuses. Named for a plausible agent action rather than a
#: toy, though its body is one benign file write.
TOOL = "write_incident_report"

#: The rule id echoed into the decision record the shim acts on.
POLICY_RULE = "deny_filesystem_writes"

#: Stand-in for the temporary directory in the recorded transcript. The real
#: path differs on every run and every machine; leaving it in would make the
#: recording non-deterministic and the drift check unusable.
WORKDIR = "<workdir>"

#: The independent observer: the smallest program that can answer "what is in
#: this directory". It imports `os`, `sys` and `json` and nothing else, so it
#: cannot consult the policy engine, the adapter, or the tool's return value.
OBSERVER = "import os,sys,json;print(json.dumps(sorted(os.listdir(sys.argv[1]))))"

#: Minimal environment for the observer. Passing the ambient environment would
#: put a developer's exported credentials one code change away from a committed
#: artifact, and this file is committed.
OBSERVER_ENV = {"PATH": "/usr/bin:/bin"}


def _observe(directory: Path) -> list[str]:
    """List `directory` from a separate process and return its entries."""
    completed = subprocess.run(
        [sys.executable, "-c", OBSERVER, str(directory)],
        capture_output=True,
        text=True,
        check=True,
        env=OBSERVER_ENV,
    )
    return json.loads(completed.stdout)


def _tool_class() -> type:
    """Build a real `smolagents.Tool`. The adapter governs it unmodified."""
    from smolagents import Tool

    class WriteIncidentReportTool(Tool):  # type: ignore[misc]
        name = TOOL
        description = "Write an incident report file into the working directory."
        inputs = {
            "directory": {"type": "string", "description": "target directory"},
            "body": {"type": "string", "description": "report text"},
        }
        output_type = "string"

        def forward(self, directory: str, body: str) -> str:
            (Path(directory) / SIDE_EFFECT_FILE).write_text(body, encoding="utf-8")
            return f"wrote {Path(directory) / SIDE_EFFECT_FILE}"

    return WriteIncidentReportTool


class RecordingInterceptor:
    """An in-process interceptor in the SDK's fail-closed `enforce` posture.

    `_enforce = True` is the flag the SDK's own `RuntimeQueryInterceptor` carries
    under `enforcement_mode = "enforce"`; the shim reads it to decide whether an
    unrecognised verdict denies or allows. This object stands in for a gateway's
    decision, which is why the page publishes the decision source as an
    exclusion instead of implying a gateway was running.

    `record_result` exists because the shim looks for it. On the SDK's own
    shipped interceptor neither audit hook resolves at all, so nothing durable
    is written for an allowed or a denied call -- ADR 0033 section 6 makes
    SDK-side recording `Planned`, and the page says so rather than showing this
    list as an audit trail.
    """

    _enforce = True

    def __init__(self, denied: frozenset[str]) -> None:
        self._denied = denied
        self.decisions: list[dict[str, Any]] = []

    def check_tool_start(self, **kwargs: Any) -> dict[str, str]:
        tool_name = str(kwargs.get("tool_name", ""))
        args = dict(kwargs.get("args") or {})
        if tool_name in self._denied:
            decision = {
                "status": "deny",
                "reason": f"Tool '{tool_name}' is blocked by policy rule '{POLICY_RULE}'.",
            }
        else:
            decision = {"status": "allow", "reason": ""}
        self.decisions.append(
            {
                "tool_name": tool_name,
                "args": {
                    key: (WORKDIR if key == "directory" else value)
                    for key, value in args.items()
                },
                "status": decision["status"],
                "reason": decision["reason"],
            }
        )
        return decision

    def record_result(self, **kwargs: Any) -> None:
        del kwargs


def _arm(
    arm_id: str,
    *,
    install: bool,
    denied: frozenset[str],
    expect_effect: bool,
) -> dict[str, Any]:
    from agent_assembly.adapters.smolagents import SmolagentsAdapter

    tool_cls = _tool_class()
    interceptor = RecordingInterceptor(denied)
    adapter = SmolagentsAdapter()

    with tempfile.TemporaryDirectory(prefix="aa-denied-action-") as tmp:
        workdir = Path(tmp)
        before = _observe(workdir)
        if install:
            adapter.register_hooks(interceptor)
        try:
            returned = tool_cls()(
                directory=str(workdir),
                body="INCIDENT: disk utilisation 94%",
            )
        finally:
            if install:
                adapter.unregister_hooks()
        after = _observe(workdir)
        returned_text = str(returned).replace(str(workdir), WORKDIR)

    observed = SIDE_EFFECT_FILE in after
    return {
        "id": arm_id,
        "enforcementInstalled": install,
        "policyDeniesTool": TOOL in denied,
        "returnedToCaller": returned_text,
        "decisionRecords": interceptor.decisions,
        "observerArgv": ["python3", "-c", OBSERVER, WORKDIR],
        "listingBefore": before,
        "listingAfter": after,
        "observedSideEffect": observed,
        "expectedSideEffect": expect_effect,
        "postConditionHolds": observed == expect_effect,
    }


def capture(*, severed: bool) -> dict[str, Any]:
    arms = [
        _arm(
            "denied",
            install=not severed,
            denied=frozenset({TOOL}),
            expect_effect=False,
        ),
        _arm("allowed", install=True, denied=frozenset(), expect_effect=True),
        _arm(
            "enforcement_removed",
            install=False,
            denied=frozenset({TOOL}),
            expect_effect=True,
        ),
    ]
    return {
        "$comment": (
            "Generated by scripts/denied-action-capture.py from a real run. Do not "
            "hand-edit: scripts/denied-action-proof.py check compares the built page "
            "against this file, and generate rebuilds the module the page imports."
        ),
        "provenance": {
            "ticket": TICKET,
            "epic": EPIC,
            "methodTicket": METHOD_TICKET,
            # Taken here rather than passed in. There is deliberately no way to
            # tell this script what day it is: a re-record stamps the day it
            # actually ran, so the field cannot disagree with the run it labels.
            "capturedOn": date.today().isoformat(),
            "sdk": importlib_metadata.version("agent-assembly"),
            "framework": importlib_metadata.version("smolagents"),
            "python": ".".join(str(part) for part in sys.version_info[:3]),
            "platform": f"{platform.system()} {platform.release()} {platform.machine()}",
        },
        "scenario": {
            "tool": TOOL,
            "policyRule": POLICY_RULE,
            "sideEffectFile": SIDE_EFFECT_FILE,
            "framework": "smolagents",
            "launchPath": "smolagents.tools.Tool.__call__",
            "enforcementPoint": "agent_assembly.adapters.smolagents.SmolagentsPatch",
            "decisionSource": "in-process interceptor, enforce posture",
            "claimTerm": "denied_before_execution",
        },
        "severed": severed,
        "arms": arms,
        "totals": {
            "arms": len(arms),
            "postConditionsHeld": sum(1 for a in arms if a["postConditionHolds"]),
        },
    }


# This script used to take `--out` and `--date`. Both were removed rather than
# validated, and one argument remains.
#
# `--out` was never useful: `scripts/denied-action-proof.py` reads exactly one
# path, so a recording written anywhere else is a file nothing reads.
#
# `--date` is the more interesting deletion, because it was removed for a
# reason that stands on its own. It let a re-record carry a date other than the
# day it ran -- someone could re-measure today and stamp last week. On a page
# whose entire argument is that a stated fact was checked rather than asserted,
# a hand-settable timestamp is a small untruth pointed directly at the subject
# matter. `capturedOn` is now taken inside the run and cannot disagree with it.
#
# Both were also this script's only taint sources -- argv values reaching
# `write_text` -- and validating them did not clear SonarCloud
# `pythonsecurity:S8707`: a sanitiser behind an `argparse` `type=` callable is
# not recognised as one by dataflow analysis, and an inline `date.fromisoformat`
# round-trip did not clear it either. Removing a source beats guarding it, and
# in both cases the deletion improved the artifact independently of the
# scanner. What is left, `--sever-enforcement`, is a `store_true` whose branch
# writes to stdout and never reaches the recording.


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument(
        "--sever-enforcement",
        action="store_true",
        help="run the denied arm with the shim uninstalled; it must then fail",
    )
    args = ap.parse_args()

    recording = capture(severed=args.sever_enforcement)
    text = json.dumps(recording, indent=2, ensure_ascii=False) + "\n"

    if args.sever_enforcement:
        # Never overwrite the committed recording from a severed run.
        sys.stdout.write(text)
    else:
        # The destination is `RECORDING`, a module constant built from
        # `__file__`, and `text` is built entirely inside this process. No
        # command-line value reaches either operand: the only argument left is
        # `--sever-enforcement`, whose branch writes to stdout and never gets
        # here. That is why this script needs no path validation, and it is
        # worth stating because it is easy to break -- the moment a destination
        # or a payload is computed from an input, this line needs the check it
        # does not need today.
        RECORDING.parent.mkdir(parents=True, exist_ok=True)
        RECORDING.write_text(text, encoding="utf-8")
        print(f"wrote {RECORDING.relative_to(REPO)}")

    held = recording["totals"]["postConditionsHeld"]
    total = recording["totals"]["arms"]
    print(f"post-conditions  : {held}/{total} held", file=sys.stderr)
    for arm in recording["arms"]:
        if not arm["postConditionHolds"]:
            print(
                f"  FAIL [{arm['id']}] expected the report file "
                f"{'present' if arm['expectedSideEffect'] else 'absent'}, "
                f"observed {'present' if arm['observedSideEffect'] else 'absent'}",
                file=sys.stderr,
            )
    return 0 if held == total else 1


if __name__ == "__main__":
    sys.exit(main())
