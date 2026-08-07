# Homepage narrative — the versioned record (AAASM-5585)

This is the design record for `/`, rewritten around problem, governed decision,
outcome and proof. It exists so that the next person editing the homepage can
tell which sentences are theirs to change and which are quotations they would be
breaking by editing.

**This file carries no capability sentence of its own.** Every claim on the
homepage belongs to a source above this repository in ADR 0034's hierarchy, and
a claim restated here is a claim that can drift from it. What is recorded below
is *where each string came from* and *which rules bind it* — never the string's
truth conditions, which are the source's to state.

## The one rule this page exists to hold

The product website sits near the bottom of ADR 0034's truth hierarchy — below
code and tests, the capability manifest, the approved claims registry, the
technical documentation and the Docs Hub. That position licenses exactly one
operation: **simplify**. It never licenses **broaden**.

The practical form of that rule, for this page: *quote, do not paraphrase*. A
paraphrase is a new claim, and a new claim carries its own evidence burden that
a marketing page cannot discharge. When a layout needs something shorter than
the approved wording, that is a layout problem.

## Where each string comes from

| Section | Source | What is quoted |
| --- | --- | --- |
| Hero headline + subheadline | `product-promise.md` | Both, verbatim. Declared **non-severable** at the source |
| `<title>`, meta description | `product-promise.md` | The headline, and the promise |
| Problem — the flagship story | `risk-scenarios.md`, Tier 1 | The long form, verbatim |
| Problem — the bound under it | `risk-scenarios.md`, Tier 1 | The flagship boundary clause, verbatim |
| Problem — three threat cards | `risk-scenarios.md`, Tier 1 | T1, T2 and T3, verbatim |
| Three steps | `product-promise.md` Level 2 | Route it · Decide it · Show it |
| Outcome cards | `role-narratives.md` | RC1, RC2, RC3, RC4, RC5, RC12 — claim and bound |
| Default-posture table | `product-promise.md` Level 3 | The default-posture table, narrowed |
| Platform sentence | `role-narratives.md` | RC8, RC14 |
| Proof — what is checkable | `product-promise.md` Level 3, `role-narratives.md` RC6 | |
| Proof — what is not claimed | `product-promise.md` Provisional; `risk-scenarios.md` Tier 2 gate | |
| Role router | `audiences.md`, `sitemaps.md` | The five L1 audiences and the job each ends in |

Published at `https://docs.agent-assembly.com/` — `product-promise.html`,
`risk-scenarios.html`, `role-narratives.html`, `audiences.html`, `sitemaps.html`.

## Five rules a future edit must not break

1. **The headline and the subheadline are one unit.** The headline published
   alone reads as a claim over all agent behaviour; the subheadline is the
   boundary that makes it a product claim rather than a category description.
   The source declares them non-severable and requires the boundary above the
   fold — not a footnote, not a tooltip, not a "learn more".
2. **A bound travels with its claim, on the same screen.** This is why
   `.boundNote` and `.cardBound` are ordinary readable text rather than a
   disclosure widget. A bound a reader has to open is a bound that was not
   published.
3. **Tier 2 wording is gated.** The homepage may say what was *decided*. It may
   not say what was *averted* — no "the endpoint never received a byte", no "we
   stopped X" — until AAASM-5532 and AAASM-5529 land and the proof harness has
   actually run. Designing a negative control is not the same as having run one.
4. **Metadata surfaces take the headline, never a scenario sentence.** A
   `<title>`, an `og:title`, a search snippet or a chat unfurl has no room for a
   bound beside it, and shortening one to fit is forbidden. The headline's
   indefinite article — *an* AI agent, never *your* AI agents — was written to
   survive exactly those places.
5. **Every verb takes an ADR 0033 §6 term.** If a sentence still works with
   "protects", "enforces" or "catches", it is not specific enough to publish:
   each of those can mean observed, detected, evaluated or refused, and the
   reader cannot tell which.

## The audience row this ticket had to make true

AAASM-5594's sitemap records five L1 audience entries, and marks one of them
**contingent**: `evaluator`'s L1 entry is `/`, while `audiences.md` says of the
site as it stood that it *"publishes four pages and a blog and routes by none of
them"*. Until `/` routed by audience, L1 had four entries and the fifth row was
an assertion the site did not support.

`StartByRole` is the routing, and the page as a whole is the evaluator's own
entry. Two properties of it are load-bearing rather than stylistic:

- **Five cards, not six.** `contributor` has no L1 entry by design —
  `audiences.md` puts positioning copy and conversion paths under *belongs
  elsewhere* for that reader, so a sixth card would route them to the layer
  their own section calls wrong for their job.
- **Each card links to the audience's *next* destination, not its entry page.**
  For three of the five the entry page is itself a recorded gap (`GAP-1`,
  `GAP-2`, `GAP-7`), and the four dedicated role routes are AAASM-5587's and do
  not exist yet. Linking a planned URL would trade one false row for another.

When AAASM-5587 ships the role routes, the four non-evaluator cards should point
at them instead. That is the only edit this block anticipates.

## What was removed, and why it may not come back

Recorded because each looked reasonable in place, and each will look reasonable
again to someone editing one card at a time.

| Removed | Why |
| --- | --- |
| Hero: *"A governance layer for AI agents."* | Accurate, and rejected for a hero at the source: it names the category rather than what changes for the reader. Correct at company altitude, too abstract for the product's own first screen |
| Section: *"Three independently-deployable interception layers"* (SDK · Proxy · eBPF · Gateway) | ADR 0033 forbidden design 1. An ordered pipeline whose members cover for each other has no way to express an absent member — and that inference is what the architecture exists to stop |
| Hero canvas: three concentric rings labelled SDK, PROXY, eBPF, with requests "denied at SDK" and "denied at eBPF" | The same forbidden design, drawn instead of written, plus forbidden design 2. Neither ring refuses anything: the SDK is advisory, and no eBPF signal takes part in an allow/deny decision |
| Canvas caption: `LAYERS: SDK · PROXY · eBPF · SECRETS: CONTAINED` | The second half asserts an outcome bounded by a pattern set |
| Card: *"human-in-the-loop gates"* | `role-narratives.md` RC12 records *no claim* for this term. The hold is real and fails closed; no shipped operator surface can answer it |
| Hero terminal: *"identity verified"* | Agent identity is asserted, not verified — the agent plane accepts callers without authentication by design, as a bootstrap path |
| Hero terminal: *"within budget $4.10 / $50.00"* | Whether a declared cap is checked in the decision path is Unmeasured |
| Hero terminal: a payment endpoint | No payment capability exists. `GovernanceAction` has six variants and none is a payment |
| Layer copy: *"with no agent code changes"* | True of the agent's source, false as a prerequisite statement — the tool must be launched so its traffic reaches the proxy, and the CA must be trusted |
| Meta description naming the SDK / proxy / kernel pipeline | Forbidden design 1 in the one sentence a search result quotes |

## The hero drawing, after

One boundary with an **open corridor**, not a closed ring. Routed actions meet
the boundary and are refused before the dial, have a recognised credential
removed, or pass. Actions in the corridor leave labelled `NOT INSPECTED`.

The gap is the whole point of the drawing and may not be closed for visual
tidiness: a closed ring asserts coverage the product does not have, and
*not inspected* is a different result from *allowed*.

Two placement facts, recorded because they were found by looking at the rendered
page rather than by reading the code. The canvas sits below `.heroInner`, so any
label drawn on a steep ray lands behind the centred headline and is silently
painted over. And the boundary radius on the left flank lands under the CTA row.
Both labels are therefore on near-horizontal rays and pushed clear of the arc.

## Section order

Hero · TrustStrip · Problem · ThreeSteps · Outcomes · Proof · CurrentPosition ·
StartByRole · InstallBlock · NextSteps · Blog · FinalCTA.

It is a reading order, not a menu. The Epic grades comprehension at five, fifteen
and sixty seconds, and those are graded against the *prefixes* of this order — so
moving a section forward moves what a five-second reader takes away.

`#security` and `#architecture` stay on this route. A URL fragment is never sent
to the server, so no redirect and no `_headers` rule can catch one that moves;
the link breaks silently instead of 404ing. `Outcomes` keeps `#security` and its
`security_model_view` event; `ThreeSteps` keeps `#architecture` and
`architecture_view`.

## Both locales

The zh-Hant catalogue was rewritten alongside the English, not left to catch up.
Nine keys had kept their id while the English underneath changed, so zh-Hant was
still asserting copy that had been withdrawn — including the rejected hero line
and the superseded pipeline description. A stale translation of a withdrawn claim
is the same defect as publishing the claim, and it is invisible to anyone reading
only the English page.

Bounds are translated in full rather than trimmed. Shortening a bound in
translation publishes a broader claim in one locale than in the other.

## Scope

This record covers `/` only. `/product` and the new `/how-it-works` route are
AAASM-5586's; the four role routes are AAASM-5587's; the navbar, footer and
canonical-URL rules are AAASM-5596's.

`design/v1/` remains the AAASM-4143 design record. Its hero-background sections
describe a drawing this ticket replaced and are marked superseded there rather
than rewritten — a design record is a history, and correcting it in place would
lose the decision it recorded.

---

_AAASM-5585 · last reviewed 2026-08-08_
