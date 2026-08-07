# Role narrative briefs — implementation pointer (AAASM-5584)

This file is a **pointer, not a brief**. It exists so that someone implementing the
evaluator entry pages in this repository finds the content contract instead of
writing four role pages from scratch.

**The briefs are not in this repository.** They are one page in the Docs Hub:

> <https://github.com/ai-agent-assembly/docs/blob/HEAD/docs/src/role-narratives.md>
>
> Published at <https://docs.agent-assembly.com/role-narratives.html>

**Both links above resolve once AAASM-5584's `docs` pull request merges, and not
before.** The two pull requests are one ticket and land together; this one is
deliberately not blocked on that one, because the alternative is an untracked file
sitting on a branch. Verified at the time of writing: the sibling hub pages under the
same URL pattern — `product-promise.html`, `risk-scenarios.html`,
`page-standards.html` — all return 200, so the route shape is right and only the page
is outstanding. If these still 404 after the `docs` pull request has merged and its
deploy has run, that is a real defect, not this note.

They live there rather than here on purpose. ADR 0034 puts the Docs Hub above the
product website in the one-product-truth hierarchy, so the website derives its copy
from the hub and never the reverse. Copying the briefs into this repo would create a
second copy at the same depth, which
[`content-ownership.md`](https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD/docs/src/development/content-ownership.md)
prohibits and which would drift within one release. Read the source; do not fork it.

**This file deliberately carries no capability sentence.** Every claim about what the
product does belongs to the shared claim register on the page above, and a claim
restated here is a claim that can drift from it. If you need a sentence, take it from
the register verbatim.

## Which brief becomes which surface

AAASM-5587 owns the implementation, including routes, navigation and page metadata.
The mapping below is the brief-to-surface correspondence only; the routes are 5587's
to choose, and none of these pages exists yet.

| Brief on the hub page | Audience value | Surface AAASM-5587 builds |
| --- | --- | --- |
| Brief 1 — Security / Risk | `security-engineer` | Security / Risk evaluator entry page |
| Brief 2 — Platform / SRE | `operator` | Platform / SRE evaluator entry page |
| Brief 3 — Engineering | `developer` | Engineering evaluator entry page |
| Brief 4 — Product / QA / Assurance | `auditor` | Product / QA / Assurance evaluator entry page |

Each surface carries the same seven sections in the same order — pain, trigger,
intervention, outcome, proof, limitations, next — because the brief is judged on
whether a reader can complete that sequence.

## What an implementer must not drop

These are the four things a layout pass removes first, and each one turns a bounded
statement back into an unbounded one. They come from the hub page and its sources; the
reasoning is there, not here.

1. **A claim's bound travels with it, on the same screen, above the fold.** Not a
   footnote, not a tooltip, not a "learn more". The register's Bound column is part of
   the claim, not context for it.
2. **Metadata surfaces do not take a scenario sentence.** A `<title>`, an `og:title`,
   a social card or a search snippet has no room for a bound beside it. Those take the
   headline from
   [Product promise](https://github.com/ai-agent-assembly/docs/blob/HEAD/docs/src/product-promise.md),
   which is written to survive being quoted alone.
3. **Quote the register, do not paraphrase it.** A paraphrase is a new claim and
   carries its own evidence burden. If a layout needs something shorter than the
   register gives, that is a layout problem.
4. **A brief may be silent about a register entry; it may not hedge one.** If an entry
   is too strong for a surface, the surface says the weaker true thing — the entry's
   own bound — or says nothing. A hedged strong claim reads as the strong claim to
   every reader who skims.

The hub page's *What no role brief may say* section is the rejected-wording list. It
is enforceable rather than advisory: ADR 0033 forbidden design 7's absolutes are
**unwaivable** under ADR 0034 Decision 10 as amended by AAASM-5671, so there is no
approval that lets one onto a page.

## Boundaries with the other Website V2 tickets

| Surface | Owner | Not this ticket's, and not AAASM-5587's |
| --- | --- | --- |
| Homepage (`src/pages/index.tsx`) | AAASM-5585 | Adding a link to a role page is fine; rewriting the page is not |
| Product page (`src/pages/product.tsx`) and How It Works | AAASM-5586 | As above |
| Sitemap and navigation shape | AAASM-5594 | 5587 adds cross-links without building a mega menu |
| Comprehension, accessibility, SEO and regression validation | AAASM-5590 | Runs after the pages exist |

## The versioned design record

`design/v1/` is the AAASM-4143 homepage design record and is **not** superseded by
this file. Note one thing before reusing its language: its
*Security-model background rationale* section describes the hero background as
expressing "the three-layer interception model (SDK → proxy → eBPF, all gated by the
gateway)". ADR 0033 supersedes that framing — it is forbidden design 1 — so the
sentence is a historical record of a v1 decision and must not be carried into a new
page. Correcting `design/v1/` is not this ticket's to do; it is recorded here so the
next author does not copy it forward.

---

_AAASM-5584 · last reviewed 2026-08-07_
