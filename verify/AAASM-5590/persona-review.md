# AAASM-5590 — persona comprehension review

Four personas, four time budgets. For each cell: the question asked, the exact
text on the page that answers it, and whether it answers it. Quotes are copied
from the built HTML at `origin/main` + this branch, not paraphrased. A cell with
no quote is recorded as not answered rather than argued for.

The three questions are the story's: **what the product is**, **the governed
boundary**, and **the next action**.

Reading path assumed: `/` for the 5s and 15s budgets (it is where each persona
lands), the persona's own `/roles/<x>` page for 60s, and that page plus one link
it names for 3min.

---

## 5 seconds — the fold at 1280x900 and at 375x812

Evidence: `home-desktop-1280.png`, `home-mobile-375.png`. The text quoted below
sits above the fold at both widths.

| | Quote | Answers? |
|---|---|---|
| What it is | H1: "Decide what an AI agent may do — before it does it." | Yes |
| Governed boundary | Eyebrow: "DECISIONS BEFORE THE ACTION, NOT ALERTS AFTER IT"; diagram labels "GOVERNED PATH" / "NOT ROUTED" / "OUTSIDE"; strip: "ROUTED → DECIDED · NOT ROUTED → NOT INSPECTED" | Yes |
| Next action | Three buttons: "Start self-hosting →", "Request Cloud Early Access", "Star the core repo" | Yes |

The four personas get the same fold, and it is the same answer for each. The
boundary is stated in the fold rather than deferred — "NOT ROUTED → NOT
INSPECTED" is the limit, in the first screen, without needing the body.

At 375 the headline, sub-paragraph and the three CTAs remain above the fold; the
navbar collapses to a hamburger plus "Docs" and "Get started".

## 15 seconds — fold plus the sub-paragraph

| | Quote | Answers? |
|---|---|---|
| What it is | "Agent Assembly evaluates the actions you route through it against your policy, refuses them, or blocks them pending a decision, and records what it decided." | Yes |
| Governed boundary | Same sentence, continued: "An action you have not routed through it is not inspected — and the record says so." | Yes |
| Next action | The three CTAs, plus the terminal panel showing `aasm run claude --policy team.yaml` | Yes |

The sub-paragraph is self-bounding: the scope clause ("you route through it")
and the exclusion ("not inspected") are in the same sentence as the capability,
so a reader who stops here has not been over-promised. The terminal panel shows
one refused, one redacted and one observed connection, which is the enforcement
ladder demonstrated rather than asserted.

## 60 seconds — the persona's own role page

Each page opens with its audience and the decision it ends in, ahead of
capability text. Quotes are the pages' own.

| Persona | Route | "Written for" | "The decision it ends in" | Answers? |
|---|---|---|---|---|
| Security | `/roles/security` | `security-engineer` | "Decide whether this changes the risk position for agents already running, and what it does not cover." | Yes |
| Platform | `/roles/platform` | `operator` | "Decide what this puts on my on-call rotation, and what it does when it breaks." | Yes |
| Engineering | `/roles/engineering` | `developer` | "Decide what adopting this costs me in my codebase, and which of my actions it actually reaches." | Yes |
| PM/QA | `/roles/product-qa` | `auditor` | "Decide what can be tested, what can be signed off, and what has to be written down as a known limit." | Yes |

Each of the four decisions names a limit as part of the decision itself ("what
it does not cover", "what it does when it breaks", "which of my actions it
actually reaches", "what has to be written down as a known limit"). That is the
governed boundary arriving with the value proposition rather than after it.

Governed boundary at 60s, from the section headed "What Agent Assembly does
about it — and how far each answer reaches":

- Security: "Agent Assembly is a decision point placed in front of an agent's actions, **on the paths you route through it**, plus the record of what it decided. For a security review, six entries carry the weight."
- Platform: "A small number of processes you run and own: a control plane that answers policy questions and holds the record, a sidecar proxy on the wire, and a managed launch that puts a tool's traffic in front of the proxy."
- Engineering: "Two integration shapes, and they are not equivalent. The SDK wraps your framework's tool seam and checks a call before the tool body runs. The managed launch puts the process's outbound traffic in front of the proxy."
- PM/QA: "The product turns 'must not be able to' into a decision, **on the paths you route**."

## 3 minutes — role page plus one link it names

The four role pages each end in a section headed "One page to read, one thing to do",
which is a single next action and a single document, not a menu.

| Persona | Next action, quoted | Answers? |
|---|---|---|
| Security | "Read the security model — the threat model, the trust boundaries, and what the audit chain does and does not establish. The security model →" then "check your own platform and channel position before scoping a trial" | Yes |
| Platform | "Read self-host observability — what the running system exposes is the input to every alert and dashboard you would build on it. Self-host observability →" then "confirm your platform and channel before you plan a rollout" | Yes |
| Engineering | "Read the policy reference — what a rule can express is the boundary of what you can ask for, and it is shorter than most people expect. The policy reference →" then "pick your language's SDK documentation and check your framework's adapter row" | Yes |
| PM/QA | "Read the risk scenarios and their negative-control section — it specifies the absence check, the paired positive control, and the order the assertions have to run in. Risk scenarios →" then "check the Provisional table before writing an acceptance criterion" | Yes |

At the 3-minute budget the Security and PM/QA personas can also reach
`/denied-action-proof` (AAASM-5589), which is the strongest artefact for both:

- What it is: "This page publishes a run instead: a real agent tool call, refused by the released SDK's own enforcement point, with the effect the tool exists to produce read back afterwards by a program that took no part in the decision."
- Governed boundary, stated as a callout ahead of the result: "**This is one run, not a general statement.** One tool call, on one code path, recorded on 2026-08-14 against Python SDK 0.0.1rc6, smolagents 1.26.0, Python 3.12.13, on Darwin 25.4.0 arm64. What it shows holds for that run. It is not a statement about other tools, other frameworks, other paths or other machines, and nothing on this page should be read as one."
- And a further limit inside the scenario: "The decision itself came from `in-process interceptor, enforce posture`, not from a running gateway. That is a real limit on what this run shows and it is stated here rather than left to be inferred."

## Verdict

The four personas can each state the product, the governed boundary and their next
action at each budget from 5s upward, with the boundary available from the
first screen rather than only on a deeper page.

The failure mode this review was looking for — a page that reads as a broader
promise than the product delivers — did not appear at the budgets measured. The site
states its scope clause in the same sentence as its capability at each level
measured, and the one page that publishes a result states what that result does
not generalise to before showing it.

Not tested: real users. This is a structured read against the questions in the
story, performed by the same person who changed the pages, and it cannot
substitute for putting the site in front of four actual evaluators. Recorded as
a limit of this review rather than left implied.
