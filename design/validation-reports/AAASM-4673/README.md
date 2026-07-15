# AAASM-4673 — Marketing-copy alignment validation

Playwright before/after validation for the self-host + "what is it" copy
alignment (follow-up of AAASM-4639 self-host contradiction and AAASM-4644 rival
"what is it" models). Canonical wording is taken from the docs pages
(`open-core-boundary.md`, `faq.md`, `README.md`, `comparison.md`).

## What changed

- **"What is it" framing** → canonical model: *a governance layer for AI agents —
  enforces policy, tracks cost, intercepts unsafe actions.* Applied to the home
  hero H1/subhead and the `/product` page H1/intro/description.
- **Self-host messaging** → limited-function OSS self-host for local evaluation and
  development; full functionality via the managed cloud. Removes the "Full control"
  / "works on its own" over-promise that contradicted the SaaS-only-for-full-features
  policy. Applied to the home "Choose your path" developer/cloud cards, the install
  block lead, and the `/product` open-core-vs-cloud section.

## How it was validated

- `pnpm` gates run locally: `tsc` (typecheck), `eslint`, `prettier --check`, and
  `docusaurus build` all pass. (Broken-anchor warnings for `#install`/`#security`
  are pre-existing — those anchors are set on rendered components — and are
  non-fatal.)
- Production build served locally on `:3100`; pages captured with Playwright
  (Chromium, 1280×900) before and after the change. No visual or interaction
  regression — layout, CTAs, and the governed-field hero animation are unchanged.

## Screenshots

| View | Before | After |
|---|---|---|
| Home hero ("what is it") | `home-hero-before.png` | `home-hero-after.png` |
| Home full page (install / self-host section) | `home-fullpage-before.png` | `home-fullpage-after.png` |
| Product page (open-core vs Cloud) | `product-before.png` | `product-after.png` |
