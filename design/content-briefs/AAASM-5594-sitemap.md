# Product website sitemap — implementation pointer (AAASM-5594)

This file is a **pointer, not a sitemap**. It exists so that someone adding a route to
this repository finds the tree that was designed for it instead of inventing one, and
so that the tree does not exist in two places at once.

**The sitemap is not in this repository.** It is one page in the Docs Hub, and it draws
both trees — this site's and the hub's — because they have to be designed against each
other:

> <https://github.com/ai-agent-assembly/docs/blob/HEAD/docs/src/sitemaps.md>
>
> Published at <https://docs.agent-assembly.com/sitemaps.html>

**Both links resolve once AAASM-5594's `docs` pull request merges, and not before.** The
two pull requests are one ticket and land together; this one is deliberately not blocked
on that one, because the alternative is an untracked file sitting on a branch. Verified
at the time of writing: the sibling hub pages under the same URL pattern —
`audiences.html`, `role-narratives.html`, `page-standards.html` — all return 200, so the
route shape is right and only the page is outstanding. If it still 404s after the `docs`
pull request has merged and its deploy has run, that is a real defect, not this note.

It lives there rather than here on purpose. ADR 0034 puts the Docs Hub above the product
website in the one-product-truth hierarchy, so this site derives from the hub and never
the reverse. Copying the route table into this repo would create a second copy at the
same depth, which
[`content-ownership.md`](https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD/docs/src/development/content-ownership.md)
prohibits and which would drift inside one release. **Read the source; do not fork it.**
Nothing below restates a route, a section or an audience mapping — for any of those, open
the hub page.

**This file deliberately carries no capability sentence.** Every claim about what the
product does belongs to the shared claim register in
[`role-narratives.md`](https://github.com/ai-agent-assembly/docs/blob/HEAD/docs/src/role-narratives.md).
A claim restated here is a claim that can drift from it.

## Why a sitemap ticket produced almost no file in this repository

Because this layer is not Markdown. AAASM-5593's inventory records it as finding D6:
this repository publishes **two** Markdown files, both blog posts, and sets
`docs: false` in `docusaurus.config.ts` — there is no docs tree. Everything a visitor
reads is JSX inside `.tsx` components, 563 lines of it in
`src/components/home/index.tsx` alone.

Three consequences an implementer should carry:

1. **A page here is a React route**, not a file to move. There is no Markdown migration
   in this repository's half of the sitemap, and no redirect falls out of one.
2. **Markdown-based governance tooling cannot see this layer.** Any check that
   enumerates `.md` files passes over it, because the claims are in TypeScript. A page
   here is reviewed by a human or it is not reviewed.
3. **Every new route needs both locales.** The site declares `en` and `zh-Hant`, and
   translations live in `i18n/zh-Hant/code.json`. A route added in one locale serves
   English content on a translated URL — which D6 records as already happening for the
   blog, so it is a live failure mode rather than a hypothetical one.

## The four things a layout pass gets wrong here

These come from the hub page and its sources; the reasoning is there, not here. They are
repeated because each is a decision made while writing a component, when the sitemap is
not open.

1. **The navbar budget does not move.** Four items on the left, three on the right, as
   today. AAASM-5587 requires the new surfaces to be cross-linked *without* an oversized
   mega menu, and at narrow widths the navbar collapses into a drawer that is a vertical
   list of the same items. New routes reach readers from within pages and from the
   footer — not by becoming navbar entries. The role routes in particular are somewhere
   a reader is *routed to* from a chooser, not something they navigate to by name.
2. **A URL fragment cannot be redirected.** The homepage carries `#security` and
   `#architecture` anchors today. If a section moves to its own route, the anchor has to
   stay behind on `/` — a fragment is never sent to the server, so no 301 and no
   `_headers` rule can catch it, and the link breaks silently rather than 404ing. This
   is the one redirect obligation the sitemap creates on this side, and it lands on
   AAASM-5586.
3. **This layer may not author reference material, a policy schema, a threat model or an
   API surface.** Those are L2 and L3. A trust or evidence page routes to the evidence;
   it does not reproduce it. Company and portfolio positioning is L0's, on
   `horonomy.dev`, not this site's.
4. **A claim's bound travels with it, on the same screen.** Not a footnote, not a
   tooltip, not a "learn more". And a `<title>`, an `og:title`, a social card or a
   search snippet has no room for a bound beside it, so those take the headline from
   [`product-promise.md`](https://github.com/ai-agent-assembly/docs/blob/HEAD/docs/src/product-promise.md),
   which is written to survive being quoted alone.

## Two constraints on any architecture-shaped page

ADR 0033 forbidden designs 1 and 2, restated because this is the repository where they
would be violated by a diagram rather than by a sentence:

- **No fixed pipeline of SDK, then proxy, then eBPF** as the architecture — in prose or
  as a three-box diagram.
- **No depiction of eBPF as a cross-platform final layer.** It is one implementation of
  platform-specific host-level interception, available on Linux, and today predominantly
  an observation mechanism.

Both bind `/how-it-works` most directly, which is AAASM-5586's page rather than
AAASM-5594's — recorded here so the constraint is in the repository the diagram gets
drawn in.

## Boundaries with the other Website V2 tickets

The sitemap's partition table is the authority; this is the slice of it that names files
in *this* repository, so a reviewer can check two branches do not collide without
opening the hub page.

| Ticket | Owns in this repository | Must not touch |
| --- | --- | --- |
| AAASM-5585 | `src/pages/index.tsx`, `src/components/home/**` | Navbar, footer, `/product` |
| AAASM-5586 | `src/pages/product.tsx`, the new How It Works route | `/`, the role routes |
| AAASM-5587 | The four new role route files, under one shared prefix | `/`, `/product`, navbar |
| AAASM-5596 | `docusaurus.config.ts`, `src/components/MegaMenu/menus.ts`, `_headers` | Any page body |
| AAASM-5594 (this) | `design/content-briefs/AAASM-5594-sitemap.md` | Everything else |

Three routes the sitemap defines have **no ticket yet** — the use-case pages, the
trust/evidence page, and the maturity page that closes AAASM-5591's roadmap gap at this
layer. They are listed as unassigned on the hub page rather than folded into one of the
rows above, so that nobody picks them up by assuming they came with a neighbouring
ticket.

## The versioned design record

`design/v1/` is the AAASM-4143 homepage design record and is **not** superseded by this
file or by the sitemap. Note one thing before reusing its language, the same note
AAASM-5584's pointer already carries: its *Security-model background rationale* section
describes the hero background as expressing the three-layer interception model gated by
the gateway. ADR 0033 supersedes that framing — it is forbidden design 1 — so the
sentence is a historical record of a v1 decision and must not be carried into a new
page. Correcting `design/v1/` is not this ticket's to do.

---

_AAASM-5594 · last reviewed 2026-08-07_
