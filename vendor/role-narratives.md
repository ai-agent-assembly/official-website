<!-- PIN:role-register:BEGIN -->
<!--
  GENERATED FILE -- do not hand-edit.
  A pinned projection of docs/src/role-narratives.md (AAASM-5763), matching
  the capability-surface.toml precedent (AAASM-5531/5609): a committed copy
  carrying the exact upstream commit it was taken from, so CI can validate
  against it with zero network access. Regenerate with:
    python3 scripts/sync-role-register.py --docs-checkout <path> --source-commit <sha>
  Proving this pin still matches the LIVE upstream page is a separate,
  still-not-CI check -- see check-role-register-upstream.py.

  source_repository: ai-agent-assembly/docs
  source_path: docs/src/role-narratives.md
  source_commit: ede1a0b9eeb6975e6ca1a015c7df3a281a9d7567
-->
<!-- PIN:role-register:END -->

<!-- BEGIN AA-PAGE-META
schema_version: 1
page_type: reference
audience: [contributor]
user_job: Write a role-facing surface without letting one audience acquire a different product truth
owner: L2:docs
canonical_source: self
describes_capability: false
disclosure_levels: [3, 4]
END AA-PAGE-META -->

# Role narratives — Security, Platform, Engineering and Product/QA

This page supplies the four role-specific narrative briefs the product's evaluator
entry pages are built from: **Security / Risk**, **Platform / SRE**, **Engineering**,
and **Product / QA / Assurance**. Each brief carries the seven fields a role surface
needs — pain, trigger, intervention, outcome, proof, limitations and next step.

It exists because role pages are the classic place where one product acquires four
product truths. Four audiences, four authors, four deadlines, and the security page
ends up describing a stronger product than the engineering page describes, without
either author ever intending it. Nobody notices, because nobody reads two of them.

So the briefs below are **not four independent documents**. Every capability sentence
in all four is drawn from one numbered
[shared claim register](#the-shared-claim-register), and a brief may cite a register
entry or stay silent — it may not restate one at a different strength. That is the
mechanism, not an instruction to be careful.

It is narrative source material, not a role page. The surfaces that consume it
(AAASM-5587) take the wording from here rather than paraphrasing it: a paraphrase is
a new claim and carries its own evidence burden.

## What governs this page

This page adds no claim to the sources below. Every product fact in it resolves to a
row of the capability manifest, and the register records which row.

| Source | What it supplies |
|---|---|
| **Capability / evidence manifest** (AAASM-5531) | The 80 rows every claim here resolves against — coverage term, decision timing, failure posture, default state, released channels, known bypasses and evidence. [`governance/capability-manifest.yaml`](https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD/governance/capability-manifest.yaml) |
| **ADR 0033 §6** | The eleven claim terms. Nothing here coins a twelfth. [ADR 0033](https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD/docs/src/adr/0033-canonical-governance-and-enforcement-architecture.md) |
| **ADR 0034** | The one-product-truth hierarchy and the rule that an upper layer may simplify a lower-layer fact and may never broaden it. [ADR 0034](https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD/docs/src/adr/0034-one-product-truth-and-cross-repository-documentation-governance.md) |
| **ADR 0030 §4.1** | The protection-state ladder, and which rung may carry a bypass-resistance claim. [ADR 0030](https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD/docs/src/adr/0030-developer-integration-boundaries-and-trust-model.md) |
| **Claim vocabulary** | The approved public wording per surface, the prohibited-term rules, and the waiver policy. [claim-vocabulary.md](https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD/docs/src/development/claim-vocabulary.md) |
| [Product promise](product-promise.md) (AAASM-5582) | The single promise every brief below is a rendering of, its clause map, and the Provisional list. |
| [Risk scenarios](risk-scenarios.md) (AAASM-5583) | The flagship story, the three supporting threats, and the Tier 1 / Tier 2 publication gate on prevented-outcome wording. |
| [Page standards](page-standards.md) (AAASM-5595) | Disclosure levels and the metadata contract this page's own block satisfies. |

Ticket references on this page are plain text, not links: the tracker is not publicly
readable, so a link would only reach a login wall, and a link checker scores that wall
as reachable — which makes the reference look verified when it is not.

**Alignment with the audience model.** AAASM-5591 defines the reader axis and its six
`audience` values. Its crosswalk maps the four roles this page serves onto
`security-engineer`, `operator`, `developer` and `auditor`, and each brief below
records its value. That page had not merged when this one was written, so nothing here
depends on it; the values are recorded so the two do not diverge, and if 5591's
crosswalk changes, this page follows it rather than the reverse.

### What this page does not decide

- **The claim terms.** ADR 0033 §6 owns them.
- **Which claims are true.** The manifest owns that. A register entry below is a
  *rendering* of one or more rows, never a new measurement.
- **The navigation the role pages sit in.** AAASM-5594 owns the sitemap.
- **The homepage, the Product page or the How It Works page.** AAASM-5585 and
  AAASM-5586 own those, and this page does not rewrite them.
- **Visual design, page routes and metadata for the role surfaces.** AAASM-5587 owns
  the implementation.

## The one rule this page exists to hold

> **No brief may state a capability at a strength another brief does not state it at.**

Two corollaries, and the second is the one people get wrong:

1. **A brief may be silent.** An engineer does not need the tenant-isolation posture,
   and omitting it is correct. Silence is not a disagreement.
2. **A brief may not hedge instead of dropping.** If a register entry is too strong for
   a role page, the page says the weaker true thing — the register's own bound — or
   says nothing. It does not restate the stronger thing with a qualifier attached. A
   hedge reads as the strong claim to every reader who skims, and a hedged strong claim
   is the same defect as an unhedged one.

Understating is also a defect. The SSRF guard, pre-dial refusal, the fail-closed
launch refusal and chain verification all ship, and a brief that hedges them away is
wrong in the other direction.

## The shared claim register

Sixteen entries. Every capability sentence in all four briefs is one of these, in the
wording given here. The **Bound** column is not optional context — it is part of the
claim, and dropping it is the broadening ADR 0034 §2.3 forbids.

Read a row as: *this §6 term, about this subject, under this bound, evidenced by these
manifest rows.*

> **The invariant that makes a row checkable: an entry's §6 term must be a term its
> own cited rows carry in their `coverage` field.**
>
> Not "compatible with", not "justified by" — carried. The term is copied off the
> evidence, never chosen for the sentence and then matched to rows afterwards.
>
> **Fourteen entries are subject to the rule and all fourteen hold:** RC1, RC2, RC3,
> RC4, RC5, RC6, RC7, RC8, RC10, RC11, RC13, RC14, RC15, RC16. **Two are exempt, for
> stated reasons rather than by judgement:** RC9 carries an ADR 0030 protection state
> rather than a §6 term, and RC12 is declared *no claim* with zero rows. Fourteen plus
> two is the whole register.
>
> **Citing rows that carry several coverage terms is not an exemption — it is the rule
> holding.** The test is a subset relation, so an entry names the subset it asserts and
> leaves the rest unasserted. Six entries do this: RC3, RC5, RC8, RC11, RC15, RC16.
>
> An earlier draft got both halves of that wrong, and in the worst possible place. It
> said *three* entries were exempt, then enumerated four, and two of the four — RC8 and
> RC15 — are not exempt at all: they hold. An author trusting it would have excused
> from the check the very entries the check covers, inside the statement of the rule
> written to stop exactly this. **Where a total appears beside an enumeration on this
> page, the enumeration is the answer; if they disagree, the total is the defect.**
>
> This is stated as a rule because it is the one that failed in review. RC6 and RC13
> originally read `Observed` and `Evaluated` over rows carrying `unmeasured`, and the
> tell was that the [level-4 mapping](#level-4--claim-to-manifest-mapping) recorded
> `unmeasured` for the same two rows — one page, two tables, two answers. Comparing the
> term column against `coverage` catches that without reading a word of prose.

| # | §6 term | Claim, in the wording a role page uses | Bound that travels with it | Manifest rows |
|---|---|---|---|---|
| **RC1** | Denied before execution | A connection made on a path you routed through Agent Assembly is checked against the destination list you configured and refused before the proxy dials it | The refusal is the proxy's own local egress configuration, not a control-plane decision. The destination lists are **empty by default** — this refusal exists because an operator configured it. Linux release artifact; on macOS `cargo install aa-proxy` is the only route; on Windows there is no local mediation. If the proxy is not in front of the connection, the connection is simply made | `N1` |
| **RC2** | Denied before execution | Requests to loopback, private, link-local and related address space are refused, including where a public hostname resolves into them | On by default, fails closed, and no configuration relaxes it. It ranges over address space, **not** over an arbitrary public destination — it does not deliver RC1 and must not be credited with doing so | `N2` |
| **RC3** | Redacted | On the model-provider hosts Agent Assembly inspects, a recognised credential is removed from the request before it is forwarded | Three built-in hosts, because `llm_only` defaults on. The default action is **redact and forward**, not refuse. Recall is bounded by the pattern set — there is no Stripe detector. Model *responses* on that path are not scanned | `N3`, `C1`, `C4`, `C6`, `G4` |
| **RC4** | Denied before execution | An MCP tool call can be checked against your policy by the control plane and refused before the proxy forwards it | The only gateway-bound pre-dial refusal in the product, and it is **off by default**. It reaches MCP sent as an ordinary HTTP/1.1 POST on an intercepted non-LLM host with a gateway endpoint configured. Tool servers over stdio — the most common setup — SSE and WebSocket have no interception mechanism; Streamable HTTP is recorded as functionally broken rather than merely uncovered | `M1`, `M3`; exclusions `M2`, `M4`–`M9` |
| **RC5** | Denied before execution (Python, Go) · Evaluated (Node) · Unmeasured (Node default mode) | A tool call through a wrapped framework seam is checked before the tool body runs | The SDK is **advisory by design** — a defence-in-depth posture, not the authoritative gate, and an agent that does not call it is not asking. Python raises before the body and fails closed. Go fails closed but requires an explicit `WrapTools`. **Node's default mode routes the check through an allow-all no-op client**, so no refusal is produced there at all; asking for enforcement without a check-capable mode is refused loudly at init rather than silently allowed | `S1`, `S2`, `S5`, `S6`, `S7`, `S8`, `S9`, `S13`, `G5` |
| **RC6** | Unmeasured | Whether a given decision's record durably reaches the audit chain is not established. The verification tool is real — `aasm audit verify-chain` ships in the open-source build — but what it proves is the integrity of the entries that are present, not that any particular decision produced one | The manifest's only row for this subject is the row for what happens when the write **fails**, and it carries `coverage: unmeasured`, `failure_posture: fail_open` and `evidence: gap`. So the honest term is the row's own. Everything else about the chain is a bound, not a capability: it is tamper-**evident**, not immutable and not signed — an unkeyed digest, so anyone able to rewrite the sink can recompute it. The chain head advances before the send and a full channel drops the entry while the call still returns, which makes a dropped entry indistinguishable from a deleted one. An emptied log verifies clean. The proxy writes no local record at all unless its audit path is configured. See [the two gaps](#two-gaps-this-page-found-in-the-manifest) | `G10` |
| **RC7** | Unmeasured | Where nothing inspected an action, the record says nothing was inspected — not that it was allowed | Scoped to the **action or payload**, never to the connection: a host the proxy does not intercept is still adjudicated at CONNECT, so its connection is Observed while its payload is Unmeasured. One live defect runs against this rule today — the CONNECT-level event still records an allow for traffic about to be tunnelled uninspected (AAASM-5637) — so state it as the rule and the open defect together, not as finished behaviour | `N5`, `N10`, `N12`, `S10`, `S11`, `S12`, `L6`, `H1`, `H6`, `H7` |
| **RC8** | Observed · Detected | On Linux, kernel probes report TLS plaintext, process execution and file activity | No eBPF signal participates in any allow or deny decision. The one enforcing program is an opt-in syscall guard that terminates a confined process **after** the offending syscall has already run, which is Detected, not Denied before execution. File-I/O probes are x86_64 only. The privileged loader daemon that owns every kernel operation reaches crates.io only — it is absent from the GitHub Release assets, the Homebrew tap and the install script | `H2`, `H3`, `H4`, `N13`, `I4`, `P1`, `P2` |
| **RC9** | — (ADR 0030 protection state) | The managed launch for Claude Code on macOS is the one path that reaches ADR 0030's `HostEnforced` rung | ADR 0030 §4.1 makes `HostEnforced` **the only state that claims bypass resistance**, and exactly one manifest row carries it. Two things bound it hard. The rung rests on reading back a root-owned managed-settings file, and whether the tool honours those keys at runtime is unmeasured. And the manifest records the rung as **unearned at the published `v0.0.1-rc.6` tag** — the evidence it rests on postdates the tag. macOS host-level interception itself is `integrated`, scoped to tool governance only: claim the file, never the enforcement | `L1`; `P3` for the demotion |
| **RC10** | Degraded | Where a control was planned and is unavailable, the product reports the planned level and the level actually achieved | `Degraded` carries **both** levels or it is not this term. One row reaches it, for eBPF load or attach failure. The reporting half does not close: a degradation is emitted, typed, and rendered nowhere, and an unreadable eBPF policy file fails open **silently**, raising no degradation event at all | `G6`; reporting gap `G11`; silent case `G7` |
| **RC11** | Denied before execution · Evaluated | Where the control plane is configured and becomes unreachable, the decision path refuses rather than allowing | Fail-closed on the paths that have a gateway: the runtime denies on an unreachable gateway, the proxy refuses to start, and the gateway aborts on a policy that fails to load. **The inverse is not symmetric** — a runtime with no gateway configured falls through to a local evaluation whose terminal default is allow. Configured-then-broken fails closed; never-configured fails open | `G1`, `G3`, `G8`; the inverse `G2` |
| **RC12** | Approval required | *No claim.* | **No manifest row reaches this term.** The hold itself is real in the gateway path and fails closed on timeout, but no shipped operator surface can answer it, and inside the MCP tunnel a pending decision is downgraded to a refusal, so a human cannot be reached there either. Do not write "held for human review", "approval workflow", or any wording implying a reviewer acts. AAASM-5657 | *(none)* |
| **RC13** | Unmeasured | Whether a declared spend cap is checked in the decision path is not established by any manifest row | Same shape as RC6, and the same remedy. The manifest's only budget row is the one for a store that is **unreadable or corrupt**, carrying `coverage: unmeasured`, `failure_posture: fail_open_silent` and `evidence: gap` — its gap reason records a positive control showing the budget path never queries the control-plane store. [Risk scenarios](risk-scenarios.md)'s T3 reaches *Evaluated* and states in the same table that it has **no positive row**; this register does not restate T3's term over a row that does not carry it. What is bounded regardless: a cap exists **only where a policy declares one**, an undeclared budget is uncapped, reaching *Denied before execution* needs a caller that waits for the answer, and a corrupt store resets the cap to zero spend **silently**. See [the two gaps](#two-gaps-this-page-found-in-the-manifest) | `G9` |
| **RC14** | Unsupported | Named transports and platforms are not available, and the matrix says which | Windows has no local mediation of any kind. UDP, QUIC and HTTP/3 are outside the transport set; so are HTTP/2, gRPC and WebSocket over an intercepted host, and MCP over WebSocket. `Unsupported` for one element is not `Unsupported` for the product | `P4`, `N8`, `N11`, `M8` |
| **RC15** | Denied before execution (via RC1) | Launching a tool through `aasm run` writes the proxy settings into the tool's environment, which is what puts its outbound connections on the path | Writing a tool's own settings file is **tool governance, not a data-path claim**; any prevention these adapters deliver is the proxy's, borrowed through the launch environment. Of the shipped adapters, Claude Code is the only one above `Integrated` and the only one with a launch evidence test. Copilot's launch always fails by construction. Codex and Windsurf inject the proxy variable with no CA trust, which is the configuration measured as failing the handshake silently. `aasm run --no-proxy` is an announced bypass. An unmanaged launch is a bypass and is not detectable | `L1`, `L2`, `L3`, `L4`, `L5`, `L7`, `L8`, `H8`, `M10` |
| **RC16** | Evaluated | An agent registers with an Ed25519 `did:key` identity and a possession proof, and delegation lineage is derived server-side | The agent plane is reachable **without authentication** by design, as a bootstrap path: an unauthenticated caller that can reach it can register and can submit policy queries. Those queries are evaluated with tenancy neutralised rather than with the caller's own, so the exposure is that the plane accepts the call. Org scoping is applied per call site rather than at the storage layer. Do not describe the agent plane as authenticated | `I1`, `I2`, `I3`, `I5`, `I6`, `I7` |

### Two gaps this page found in the manifest

Writing the register surfaced two capability claims that **no row among the 80
supports**, and the finding is recorded here rather than absorbed into a hedge.

| Subject | What exists in the manifest | What is missing |
|---|---|---|
| **The evidence pipeline** — a decision durably reaching the audit chain | `G10`, *"Audit emission failure"*, `domain: degraded_mode`, `coverage: unmeasured`, `evidence: gap` | A capability row for the pipeline working. The manifest has no `audit` domain, and `G10` measures only the failure case |
| **Budget enforcement** — a declared cap being checked in the decision path | `G9`, *"Budget state unreadable or corrupt"*, `domain: degraded_mode`, `coverage: unmeasured`, `evidence: gap` | A capability row for the cap being applied. There is no `budget` domain either, and [Risk scenarios](risk-scenarios.md)'s T3 independently records *"no positive row"* |

Measured across all nine domains — `sdk`, `network`, `degraded_mode`, `mcp`,
`host_action`, `devtool_launch`, `identity`, `credentials`, `platform`. Every `G*` row
is `degraded_mode`; none of the five rows carrying `coverage: observed` has the
evidence pipeline as its subject.

**Why this is a finding and not a rewording.** The claim vocabulary's §4 says an
omitted evidence row is *"a finding, and the remedy is to add the manifest row, not to
reword the sentence"*. Adding rows is AAASM-5531's, not this page's, so what this page
can do is take the term its evidence actually carries and route the gap. Both entries
therefore read `Unmeasured` today and will move when the rows land.

**What this does not license.** `Unmeasured` here is a statement about the evidence, not
a claim that nothing is recorded — the emission code, the hash chain and
`aasm audit verify-chain` all exist and ship. Reading RC6 as *"there is no audit log"*
would be the understatement failure, which ADR 0034 treats as a defect in its own
right. The register says what is established; it does not say the opposite.

**On the missing terms.** Two of ADR 0033 §6's eleven do not appear above.
`Experimental` is carried by one row, `P1`, and is folded into RC8's bound rather than
given an entry of its own. `Planned` appears in no register entry deliberately: a
`Planned` item carries a ticket reference and **no capability claim**, so it is not a
thing a role page's intervention section can be built on. Where a role brief needs to
point at future work it names the ticket in prose, which is what §6 requires.

## How to read a brief

Each brief carries the same seven fields, in the same order, because a role page is
judged on whether a reader can complete the sequence.

| Field | What it answers | Why the field exists |
|---|---|---|
| **Pain** | What is going wrong for this role today | The reader recognises themselves or leaves |
| **Trigger** | The event that makes it this role's problem this quarter | Distinguishes a concern from a priority |
| **Intervention** | What Agent Assembly does about it — register entries only | The one field where a new claim could enter, and the register is why it cannot |
| **Outcome** | What is different afterwards, stated as a decision, not an averted consequence | Prevented-outcome wording is gated behind AAASM-5532 / AAASM-5529 |
| **Proof** | What the reader can check, and where | A role page that asserts without a route to evidence is a brochure |
| **Limitations** | What this role will discover later if the page does not say it now | The field that decides whether the page survives contact with an evaluator |
| **Next** | One next page and one next action | Two options is a decision; five is a menu |

**Every brief's Limitations field is long.** That is not four different products having
four different amounts of honesty — it is the same bounds, selected for what each role
will actually hit. A limitations section thinner than its siblings is a signal that
something was dropped, not that the role has fewer limits.

---

## Brief 1 — Security / Risk

`audience: security-engineer` · **Job:** decide whether this changes the risk position
for agents already running, and what it does not cover.

**Pain.** An AI agent in your estate can already reach the network, the filesystem and
a shell. The controls you own were built for humans and for services: identity, review,
change management, and logs you read afterwards. None of them sits between the agent's
decision and the agent's action. Your detection story is entirely retrospective, and
your compensating control is that nobody has given the agents anything important yet —
which stops being true the week a team ships an agent with a production credential.

**Trigger.** A team asks to run a coding agent against a repository that has deploy
keys in it. You are asked to sign off, and the honest answer is that you have no
mechanism to say what it may reach — only a mechanism to find out later.

**Intervention.** Agent Assembly is a decision point placed in front of an agent's
actions, on the paths you route through it, plus the record of what it decided.
Concretely, for a security review: **RC1** (routed egress refused before the dial),
**RC2** (address-space guard, on by default and not relaxable), **RC4** (MCP tool calls
checked by the control plane), **RC3** (credentials removed from inspected requests),
**RC11** (configured-then-unreachable fails closed), and **RC6** (what the decision
record does and does not establish).

**Outcome.** For an agent you routed, a request to a destination outside the list you
configured is refused before a connection is opened. The security position that changes
is *ordering* — the decision precedes the effect — not *coverage*, and not the
completeness of the record: whether a given refusal's entry durably reaches the audit
chain is **RC6**, which is `Unmeasured`. Buy the ordering; do not buy a ledger.

**Proof.**

- The bypasses are enumerated and published rather than argued away:
  [`docs/src/devtools/limitations.md`](https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD/docs/src/devtools/limitations.md)
  and the `known_bypasses` field of every row in the
  [capability manifest](https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD/governance/capability-manifest.yaml).
- The threat model, the trust boundaries and the audit properties:
  [Security model](security-model.md).
- Per-scenario decision, decider and boundary: [Risk scenarios](risk-scenarios.md).
- What is on by default: the Level 3 table in [Product promise](product-promise.md).
- The claim discipline itself, including the wording this product refuses to publish:
  [claim-vocabulary.md](https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD/docs/src/development/claim-vocabulary.md).

**Limitations.** In the order a reviewer will find them:

- **Bypass resistance has exactly one rung and one row.** ADR 0030 §4.1 reserves that
  claim for `HostEnforced`. **RC9** is the whole of it: one path, macOS only, resting
  on a file read-back whose runtime honouring is unmeasured, and recorded as unearned
  at the published tag. Treat every other state — including `GatewayProtected` — as
  saying nothing about bypass resistance.
- **The destination lists are empty by default** (**RC1**). Out of the box this control
  refuses nothing. The always-on one is **RC2**, and it ranges over address space.
- **Routing is per agent and per launch** (**RC15**). An agent started outside the
  managed launch is outside the boundary, and that is not detectable.
- **The largest gap is host actions.** A shell command or subprocess spawned by a
  native agent process has no interception mechanism at all in a released build
  (`H1`); browser automation (`H6`) and database queries (`H7`) likewise. The policy
  language can express these rules; nothing released can act on them.
- **Uninspected is not clean** (**RC7**), and one path still records an allow where it
  should record nothing (AAASM-5637).
- **The evidence is tamper-evident, not immutable, and it can be lost** (**RC6**). A
  dropped entry is indistinguishable from a deleted one, and no manifest row establishes
  that a decision's record durably arrives at all — the term is `Unmeasured`. Do not
  present the audit chain as the control that satisfies a retention or non-repudiation
  requirement.
- **The agent plane accepts unauthenticated callers** (**RC16**). This is a deliberate
  bootstrap path with a bounded exposure, and it is still not an authenticated plane.
- **`Approval required` is not a capability you can buy today** (**RC12**).
- **Windows has no local mediation** (**RC14**).

**Next.** Read [Security model](security-model.md), then check your own platform and
channel position in [Compatibility](compatibility.md) before scoping a trial.

---

## Brief 2 — Platform / SRE

`audience: operator` · **Job:** decide what this puts on my on-call rotation, and what
it does when it breaks.

**Pain.** Agent workloads arrive without an operational contract. They are started by
developers on laptops and by CI on runners, they talk to third-party endpoints you did
not approve, and when something goes wrong the first question — *what did it actually
do* — has no owner and no answer. You are asked to make them safe without being given
a place to stand.

**Trigger.** An incident review asks which agent made a call, and the answer takes two
days of log correlation across three systems and is still a guess.

**Intervention.** A small number of processes you run and own: a control plane that
answers policy questions and holds the record, a sidecar proxy on the wire, and a
managed launch that puts a tool's traffic in front of the proxy. What matters
operationally is **RC11** (configured-then-unreachable fails closed), **RC10**
(degradation is reported as a planned-versus-achieved pair), **RC6** (what the decision
record establishes, and what it does not), and **RC15** (routing is a launch-time act
you perform).

**Outcome.** Agent egress becomes a thing with a configuration, a failure posture and
an owner, rather than ambient process behaviour. When the control plane is configured
and goes away, the paths that depend on it refuse rather than quietly widening.

**Proof.**

- Deployment shapes and the container story: [Docker and containers](docker-containers.md).
- What the running system exposes: [Self-host observability](self-host-observability.md).
- Version and platform position per component: [Compatibility](compatibility.md) and
  [Source of truth and status](source-of-truth.md).
- Per-row failure posture and default state:
  [capability manifest](https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD/governance/capability-manifest.yaml)
  — the `failure_posture` and `default_state` fields.
- First-response material: [Troubleshooting](troubleshooting.md).

**Limitations.** Read these before you plan the rollout, not after:

- **Fail-closed is not symmetric** (**RC11**). Configured-then-unreachable refuses; a
  runtime with **no** gateway configured falls through to a local evaluation whose
  terminal default is allow. The difference is a configuration mistake away.
- **Three failure modes are silent.** An unreadable eBPF policy file falls back to an
  empty rule set and raises no degradation event (`G7`); a corrupt budget store resets
  the cap to zero spend (`G9`); a full audit channel drops the entry and the call still
  reports success (`G10`). None of the three pages you.
- **Degradation is emitted and rendered nowhere** (**RC10**). The event type exists, the
  producers exist, and there is no consumer — the health endpoint's degraded-layers
  field is a boot-time snapshot that never updates, and its status is a hardcoded
  literal. AAASM-5535. Plan to consume the event stream yourself, or plan not to know.
- **The distribution position is not uniform, and it decides what you can install.**
  The proxy is a Linux release artifact; on macOS the only route is
  `cargo install aa-proxy`. The eBPF loader daemon reaches crates.io only and is absent
  from the GitHub Release assets, the Homebrew tap and the install script — so an
  operator who installed through any of those has no host-level component and, on
  macOS, no proxy for the managed launch to start (**RC8**, **RC9**, AAASM-5653).
- **Kernel probes report; they do not decide** (**RC8**), and the file probes are
  x86_64 only.
- **The managed launch hands the child the entire parent environment** (`C5`), so a
  shell or file tool inside the agent can read any credential you exported.
- **The proxy refuses a non-loopback listener** even with the remote-clients flag,
  because it has no listener TLS and no client authentication. Do not work around it.
- **`llm_only` defaults on.** Broader inspection is a configuration you make, and it
  carries a latency and compatibility cost (**RC3**).
- **Windows has no local mediation** (**RC14**).

**Next.** Read [Self-host observability](self-host-observability.md), then confirm your
platform and channel in [Compatibility](compatibility.md).

---

## Brief 3 — Engineering

`audience: developer` · **Job:** decide what adopting this costs me in my codebase, and
which of my actions it actually reaches.

**Pain.** You are shipping an agent, and the governance conversation arrives as a
blocker rather than as a library. What you want to know is small and specific: what do
I add, what does it wrap, what does it do when the policy says no, and what does it
miss. What you usually get is an architecture diagram.

**Trigger.** Security asks for evidence of what your agent may do before it will be
approved for a production credential, and there is nothing in the codebase to point at.

**Intervention.** Two integration shapes, and they are not equivalent. The SDK wraps
your framework's tool seam and checks a call before the tool body runs (**RC5**). The
managed launch (**RC15**) puts the process's outbound traffic in front of the proxy,
which is where **RC1**, **RC3** and **RC4** apply. The first is in your code and is
advisory. The second is out of your process and is where refusal actually holds.

**Outcome.** A wrapped tool call is checked before its body runs and, on the paths that
fail closed, raises rather than executing. The decision is recorded against your
agent's identity, so the evidence question has an answer that is not a log grep.

**Proof.**

- Per-framework adapter status, per language, is the `framework_or_tool` and `coverage`
  fields of the `S` rows in the
  [capability manifest](https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD/governance/capability-manifest.yaml).
- Policy syntax and what it can express: [Policy reference](policy-reference.md).
- SDK-level detail per language: the Python, Node and Go SDK docs, reached from
  [Documentation](documentation.md).
- Where the SDK sits in the trust model, and why it is advisory: ADR 0033 §2 and §4,
  in [ADR 0033](https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD/docs/src/adr/0033-canonical-governance-and-enforcement-architecture.md).

**Limitations.** These are the ones that change an integration plan:

- **The SDK is advisory by design** (**RC5**). It is a defence-in-depth posture, not the
  authoritative gate. Refusal that holds against an uncooperative process is the
  proxy's, out of your process.
- **Node's default mode produces no refusal.** The check is routed through an allow-all
  no-op client unless a check-capable mode is selected (`S7`). Asking for enforcement
  without one is refused at init rather than silently allowed, and an auto-detected
  framework warns rather than throwing — deliberately, to preserve zero-config. This is
  the single most important sentence on any Node integration page. AAASM-4991.
- **Wrapping is not uniform across frameworks, and the difference is the deny signal.**
  Some Python adapters raise before the body; others return a sentinel string, so a
  caller that catches only the policy exception treats a refused call as a success whose
  result is a string. The LangGraph and Mastra node hooks and the LangChain callback
  handler **cannot** refuse by construction — they observe. The explicit LangChain
  wrapper can, and it is off by default.
- **Go requires an explicit call.** The default build without the FFI tag and CGO
  denies every wrapped call rather than allowing them, which is fail-closed but is also
  not the advertised behaviour.
- **A framework with no adapter is not covered** (`S11`), and a direct call that does not
  pass a patched seam is not covered (`S10`).
- **Anything the SDK does not wrap is outside it** — raw HTTP, subprocess, filesystem,
  a database driver, browser automation from inside your process (`S12`). That class is
  the reason the proxy exists, and on host actions there is no released mechanism at all
  (`H1`, `H6`, `H7`).
- **MCP over stdio is not on the mediated path** (**RC4**) — and it is the most common
  way tool servers are run.
- **Routing has prerequisites in the environment**, not in your source: the tool must be
  launched so the proxy variable is set and the CA is trusted. Codex and Windsurf inject
  the first without the second (**RC15**).
- **`Approval required` is not something you can integrate against** (**RC12**).

**Next.** Read [Policy reference](policy-reference.md), then pick your language's SDK
documentation from [Documentation](documentation.md).

---

## Brief 4 — Product / QA / Assurance

`audience: auditor` · **Job:** decide what can be tested, what can be signed off, and
what has to be written down as a known limit.

**Pain.** You are asked to give release confidence on a system whose behaviour is
non-deterministic, whose failure mode is a side effect rather than a wrong answer, and
whose test oracle — *did the bad thing not happen* — is an absence. Conventional
assertions confirm that an error was raised, which is not the same fact.

**Trigger.** An agent-backed feature enters your release, and the acceptance criteria
say "must not be able to" for the first time.

**Intervention.** The product turns "must not be able to" into a decision, on the paths
you route. Four scenarios carry approved wording for reuse — the flagship egress
refusal, secret exfiltration, a destructive production action and runaway cost — each
with its decider, its default state and its boundary named. Behind them: **RC1**,
**RC3**, **RC4**, and **RC13**. **RC6** is here too, but as a bound rather than as a
tool: it is what stops the audit log from being the thing you assert against.

**Outcome.** A refusal becomes an observable decision, so a test can assert on the
decision. **Assert against the decision and against an independent observer, not
against the audit log** — RC6 is `Unmeasured`, so a missing entry does not distinguish
"the decision was not made" from "the record was dropped", and a test that reads the
log inherits that ambiguity as a flaky pass. [Risk scenarios](risk-scenarios.md)'s
negative control is built on an independent listener for exactly this reason.
Assertions about the *averted consequence* are a separate and stricter thing again —
see Limitations.

**Proof.**

- The four scenarios, each with a determination and its manifest rows:
  [Risk scenarios](risk-scenarios.md) — and specifically its **negative control**
  section, which specifies the absence check, the paired positive control that proves
  the check can see the effect, and the assertion ordering.
- The publication gate on prevented-outcome wording: the **Tier 1 / Tier 2** split in
  the same page. Tier 2 is settled in wording and **not publishable** until AAASM-5532
  and AAASM-5529 close.
- Per-row evidence: the `evidence` and `evidence_runs_on_main` fields, present on all
  80 rows, in the
  [capability manifest](https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD/governance/capability-manifest.yaml).
- What is deliberately not asserted yet: the **Provisional** table in
  [Product promise](product-promise.md).
- Release and version position: [Compatibility](compatibility.md).

**Limitations.** This is the field this role reads first:

- **Approval is the gap, not a feature** (**RC12**). No manifest row reaches
  `Approval required`. The hold exists in the gateway path and fails closed on timeout,
  but no shipped operator surface can answer it, so in practice it holds and then
  refuses; inside the MCP tunnel a pending decision is downgraded to a refusal outright.
  An acceptance criterion written against a human approval step cannot pass today.
  AAASM-5657.
- **A prevented-outcome claim is gated.** Designing a negative control is not the same
  as having run one. Until AAASM-5532 and AAASM-5529 close, describe the decision, not
  the averted consequence.
- **An error is not an absence.** An agent can receive a refusal and still have reached
  the endpoint by another route. A test that asserts on the error and not on the
  independent observer is measuring the wrong thing.
- **Evidence quality is not uniform.** Some rows are pinned by standing integration
  tests; some by unit tests only; some carry no evidence at all and are recorded as
  gaps. Two rows are explicitly marked `unit_only`. Read the row before quoting it.
- **An empty audit log is evidence about the observer, not about the agent** (**RC6**),
  and a passing chain verification does not mean the log is whole.
- **Two of the sixteen register entries rest on no capability row at all.** RC6 and
  RC13 are `Unmeasured` because the manifest's only rows for the evidence pipeline and
  for budget are the rows for those subsystems *failing* — see
  [the two gaps](#two-gaps-this-page-found-in-the-manifest). An acceptance criterion
  written against "the decision is in the audit log" or "the cap was applied" is
  currently asserting something the evidence base does not carry. AAASM-5531.
- **A budget cap exists only where a policy declares one** (**RC13**), and a corrupt
  budget store resets it silently.
- **Coverage figures are not available.** No percentage, count of governed actions or
  fleet-level number may be derived — including from the four scenarios. Self-reported
  layer availability is not evidence of coverage.
- **Three signals look like coverage and are not**: an environment variable that
  replaces the probe result outright, a proxy probe satisfied by a binary existing on
  `$PATH`, and an SDK layer flag asserted unconditionally. Do not build a check on any
  of them.
- **Platform and channel change the answer**, so a demo recorded on macOS is not
  evidence about a released Linux artifact (**RC8**, **RC9**, **RC14**).

**Next.** Read [Risk scenarios](risk-scenarios.md) and its negative-control section,
then check the Provisional table in [Product promise](product-promise.md) before
writing an acceptance criterion.

---

## Cross-brief consistency

The check the acceptance criteria turn on. Because every brief cites register entries
rather than writing its own sentences, two briefs cannot state one capability at two
strengths — a cell is either a citation of the register row or it is empty.

`●` cited · `·` not cited (silence, which is permitted) · `✗` explicitly stated as
absent.

| # | §6 term (single, from the register) | Security | Platform | Engineering | Product/QA |
|---|---|:--:|:--:|:--:|:--:|
| RC1 | Denied before execution | ● | · | ● | ● |
| RC2 | Denied before execution | ● | · | · | · |
| RC3 | Redacted | ● | ● | ● | ● |
| RC4 | Denied before execution | ● | · | ● | ● |
| RC5 | Denied before execution (Python, Go) · Evaluated (Node) · Unmeasured (Node default mode) | · | · | ● | · |
| RC6 | Unmeasured | ● | ● | · | ● |
| RC7 | Unmeasured | ● | · | · | · |
| RC8 | Observed · Detected | · | ● | · | ● |
| RC9 | — (ADR 0030 protection state) | ● | ● | · | ● |
| RC10 | Degraded | · | ● | · | · |
| RC11 | Denied before execution · Evaluated | ● | ● | · | · |
| RC12 | Approval required | ✗ | · | ✗ | ✗ |
| RC13 | Unmeasured | · | · | · | ● |
| RC14 | Unsupported | ● | ● | · | ● |
| RC15 | Denied before execution (via RC1) | ● | ● | ● | · |
| RC16 | Evaluated | ● | · | · | · |

Three properties of this table are the acceptance criteria, and each is checkable
without reading the prose:

1. **Every row has exactly one term.** A term is a property of the claim, not of the
   audience. Where a row carries several — RC5, RC11 — they are per *path*, and the
   register names which path takes which; they are not per audience.
2. **No brief carries a term for a row another brief contradicts.** RC12 is the only
   row stated as absent, and all three briefs that mention it state it the same way;
   the fourth is silent.
3. **Every `·` is silence, never a softer version.** A brief that needed a weaker form
   of a register entry would have to add a register row, which is a change to all four
   briefs at once — which is the point.

## What no role brief may say

<!-- claim-gate:ignore-start
     AAASM-5584: the block below necessarily names the phrases a banned-absolutes gate
     looks for, because a rejected-wording list cannot name its rejections otherwise.
     This follows the convention product-promise.md and risk-scenarios.md propose for
     AAASM-5536; as those pages record, no gate consumes this marker today. Every
     phrase below is code-spanned rather than quoted, which is the exemption the claim
     vocabulary's section 6.3 prefers. -->

- Not `catches everything`, `nowhere to hide`, `cannot be bypassed` or `unbypassable`.
  The bypasses are enumerated in the manifest and published. These are ADR 0033
  forbidden design 7 and are **unwaivable** — no time limit, named owner, approver or
  expiry makes an unsupported claim true (ADR 0034 Decision 10, as amended by
  AAASM-5671).
- Not `every action`, `every tool call`, `full fleet` or `whole fleet`. Coverage is a
  per-agent, per-launch, per-platform fact.
- Not `universal`, `comprehensive` or `complete` attached to coverage, protection,
  mediation, enforcement, visibility or audit.
- Not `no code changes`. The tool must be launched so its traffic reaches the proxy and
  the CA is trusted. State what is required.
- Not `immutable audit`. The chain is an unkeyed digest; retention pruning deletes rows.
- Not `protects`, `enforces`, `catches`, `prevents` or `guarantees` used without a
  timing and a posture. If a sentence works with one of these, it is not specific enough
  to publish — pick a §6 term.
- Not the fixed `SDK -> proxy -> eBPF` pipeline as the architecture, in prose or as a
  three-box diagram, and not eBPF as a cross-platform final layer. Both are superseded
  by ADR 0033, forbidden designs 1 and 2.
- Not `kernel-level enforcement`. The kernel mechanism reports; the proxy refuses.
- Not "the SDK denies the action before it runs" as a general statement. See **RC5**.
- Not "held for human review" on any scenario. See **RC12**.
- Not a coverage percentage, a count of governed actions, or a fleet-level number.
- Not a role-page headline carrying a claim without its bound on the same screen. A
  `<title>`, an `og:title` or a search snippet has no room for a boundary clause beside
  it, so those surfaces take
  [Product promise](product-promise.md)'s headline, which is written to survive them.

<!-- claim-gate:ignore-end -->

## Level 4 — claim-to-manifest mapping

Every register entry, resolved to the rows that evidence it, with the fields that
decide how strongly it may be stated. `default_state` and `failure_posture` are here
rather than in the register because they are the two fields a summariser drops first
and the two an evaluator checks first.

| # | Rows | Coverage term(s) in those rows | Decision timing | Default state | Failure posture | Reachability note |
|---|---|---|---|---|---|---|
| RC1 | `N1` | `denied_before_execution` | `pre` | `open` (lists empty) | `fail_open` | `shipped_with_platform_exception`; macOS crates.io only |
| RC2 | `N2` | `denied_before_execution` | `pre` | `on` | `fail_closed` | as `N1` |
| RC3 | `N3`, `C1`, `C4`, `C6`, `G4` | `denied_before_execution` (`N3`), `redacted` (`C1`, `G4`), `detected` (`C6`), `unmeasured` (`C4`) | `in_line` (all) | `on` (`N3`, `C6`) / `open` (`C1`, `G4`) / `not_applicable` (`C4`) | `fail_closed` (`N3`, `C4`) / `fail_open` (`C1`, `C6`, `G4`) | as `N1`; `C6` ships everywhere |
| RC4 | `M1`, `M3` | `denied_before_execution` | `pre` | `off` (`M1`) / `on` (`M3`) | `fail_closed` | as `N1`; `M3` evidence is `unit_only` |
| RC5 | `S1`, `S2`, `S5`, `S6`, `S7`, `S8`, `S9`, `S13`, `G5` | `denied_before_execution` (`S1`, `S2`, `S5`, `S8`), `evaluated` (`S6`, `S9`, `S13`, `G5`), `unmeasured` (`S7`) | `pre` (all) | `on` (`S1`, `S2`, `S6`) / `off` (`S5`, `S8`) / `open` (`S7`) / `closed` (`S9`) / `mixed` (`G5`) / `not_applicable` (`S13`) | `fail_closed` (`S1`, `S2`, `S6`, `S8`, `S9`, `S13`, `G5`) / `fail_open_silent` (`S5`, `S7`) | `shipped`; `S13` has no non-test caller in-repo |
| RC6 | `G10` | `unmeasured` | `post` | `open` | `fail_open` | `shipped`; AAASM-5626 |
| RC7 | `N5`, `N10`, `N12`, `S10`, `S11`, `S12`, `L6`, `H1`, `H6`, `H7` | `unmeasured` | `none` | `not_applicable` / `on` (`N5`) | `not_applicable` | `H1`, `H6`, `H7` are `absent_mechanism` |
| RC8 | `H2`, `H3`, `H4`, `N13`, `I4`, `P1`, `P2` | `detected` (`H2`), `observed` (`H4`, `P2`), `experimental` (`P1`), `unmeasured` (`H3`, `N13`, `I4`) | `post` | `off` (`H2`, `P1`) / `on` (rest) | `fail_open` | `shipped_crates_io_only` — the loader daemon is unreleased |
| RC9 | `L1`; `P3` | `denied_before_execution` (`L1`), `unsupported` (`P3`) | `pre` (`L1`) / `in_line` (`P3`) | `on` (both) | `fail_closed` (both) | `L1` `protection_state: host_enforced`, macOS only, unearned at `v0.0.1-rc.6`; `P3` demoted to `integrated`, `tool_governance_only` |
| RC10 | `G6`; `G11`; `G7` | `degraded` (`G6`), `unmeasured` (`G7`, `G11`) | `none` (`G6`, `G7`) / `post` (`G11`) | `open` (`G6`, `G7`) / `not_applicable` (`G11`) | `fail_open` (`G6`) / `fail_open_silent` (`G7`, `G11`) | `G6` is the only `degraded` row |
| RC11 | `G1`, `G3`, `G8`; `G2` | `denied_before_execution` (`G1`, `G3`), `evaluated` (`G8`), `unmeasured` (`G2`) | `pre` | `closed` (`G1`, `G3`, `G8`) / `open` (`G2`) | `fail_closed`; `G2` is `fail_open` | `shipped` |
| RC12 | *(none)* | — | — | — | — | No row reaches `approval_required` |
| RC13 | `G9` | `unmeasured` | `pre` | `open` | `fail_open_silent` | `shipped` |
| RC14 | `P4`, `N8`, `N11`, `M8` | `unsupported` | `none` | `not_applicable` | `not_applicable` | `P4`, `M8` are `absent_mechanism` |
| RC15 | `L1`, `L2`, `L3`, `L4`, `L5`, `L7`, `L8`, `H8`, `M10` | `denied_before_execution` (`L1`), `observed` (`L5`), `unsupported` (`L4`), `unmeasured` (`L2`, `L3`, `L7`, `L8`, `H8`, `M10`) | `pre` (`L1`, `L2`, `L3`, `L7`, `H8`, `M10`) / `post` (`L5`) / `none` (`L4`, `L8`) | `on` (`L1`, `L2`, `L3`) / `off` (`L5`, `L7`, `L8`, `H8`, `M10`) / `not_applicable` (`L4`) | `fail_closed` (`L1`) / `fail_open_silent` (`L2`, `L3`, `L7`, `H8`, `M10`) / `not_applicable` (`L4`, `L5`, `L8`) | `shipped`; `L4` cannot launch by construction |
| RC16 | `I1`, `I2`, `I3`, `I5`, `I6`, `I7` | `evaluated` (`I1`, `I2`, `I3`, `I5`, `I7`), `unmeasured` (`I6`) | `pre` (`I1`–`I3`, `I5`, `I7`) / `none` (`I6`) | `on` (`I1`–`I3`) / `off` (`I5`) / `open` (`I7`) / `not_applicable` (`I6`) | `fail_closed` (`I1`–`I3`) / `fail_open` (`I5`, `I7`) / `not_applicable` (`I6`) | `shipped` |

**How to use this table when a brief changes.** Re-resolve the row, not the sentence.
If a manifest row's `coverage`, `default_state` or `failure_posture` moves, the register
entry moves, and every brief citing it moves with it — which is the property that keeps
four role pages describing one product.

## What this page hands off

| Question | Owner |
|---|---|
| Implementing the four role surfaces, their routes, navigation and metadata | AAASM-5587 |
| The sitemap the role surfaces sit in | AAASM-5594 |
| The homepage, the Product page and the How It Works page | AAASM-5585, AAASM-5586 |
| The audience enum and the role crosswalk this page aligns to | AAASM-5591 |
| Adding capability rows for the evidence pipeline and for budget enforcement, so RC6 and RC13 can move off `Unmeasured` | AAASM-5531 |
| Reconciling [Risk scenarios](risk-scenarios.md)'s T3, which publishes budget at *Evaluated* over a row set the same table records as having **no positive row**, against RC13's `Unmeasured`. The two pages disagree today; this one is the narrower and says so, but a disagreement between two Docs Hub pages is a defect to close, not a difference to keep | AAASM-5531 |
| Lifting the Tier 2 gate on prevented-outcome wording | AAASM-5532, AAASM-5529 |
| Making `Approval required` claimable — a shipped operator surface for a held action | AAASM-5657 |
| Rendering a degradation event anywhere a user can see it | AAASM-5535 |
| Comprehension, accessibility and truthful-wording validation of the built pages | AAASM-5590 |

---

*Last reviewed: 2026-08-07 — AI Agent Assembly Team*
