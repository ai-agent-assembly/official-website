# AAASM-4698 — zh-Hant (Traditional Chinese) marketing-site localization

Playwright validation for enabling Docusaurus i18n on the marketing site
(`official-website`) and shipping a first-pass Traditional Chinese (zh-Hant)
translation of the priority home + product content.

## What changed

- **i18n enabled** — `docusaurus.config.ts` now builds `['en', 'zh-Hant']`
  (defaultLocale `en`, `zh-Hant` labelled 繁體中文) and the navbar carries the
  built-in `localeDropdown`.
- **Home + product instrumented** — the priority home sections (hero,
  problem/"what is it", trust strip, security model, architecture,
  choose-your-path, final CTA, blog teaser) and the whole `/product` page are
  wrapped in `<Translate>` / `translate()` so their strings extract into the
  i18n catalogs. Tracking props (UTM, GA4 event names) are untouched.
- **zh-Hant first-pass** — `i18n/zh-Hant/code.json` (78 custom strings) plus the
  navbar, footer, and blog SEO catalogs are translated. Product/API/CLI names
  (Agent Assembly, SDK, eBPF, gRPC, CLI, Cloud Console, Apache-2.0) stay in
  English; Docusaurus theme strings use the bundled zh-Hant translations.
- **Draft flag** — a locale-gated banner renders on non-default locales only:
  「此為機器初翻，尚待母語審閱 (draft — pending native review)」.

## How it was validated

- `pnpm build` builds **both** locales cleanly (`build/` for en, `build/zh-Hant/`
  for zh-Hant). The `#install` / `#security` broken-anchor warnings are
  pre-existing (anchors are set on rendered components) and non-fatal.
- `pnpm typecheck`, `eslint`, and `prettier --check` pass (pre-commit gates).
- Production build served locally on `:3100`; pages captured with Playwright
  (Chromium, 1280×900) for both locales.
- **Language dropdown switches en ↔ 繁中**: the en home navbar renders
  `English` (active) + `繁體中文` → `/zh-Hant/`; the zh-Hant home renders the
  reciprocal `English` → `/`. Dropdown toggle confirmed in the accessibility
  snapshot as `button "繁體中文"`.
- No visual or interaction regression: layout, CTAs, and the governed-field
  hero animation are unchanged between locales.

## Deferred

- The `InstallBlock` (tabbed install-command picker) and `NextSteps` sections
  remain English this pass — they render command vocabulary and outbound rows
  and warrant their own instrumentation slice. They are visible untranslated in
  the zh-Hant full-page screenshot.
- zh-Hant copy is a machine-drafted first pass, flagged pending native review.

## Screenshots

| Page | English | zh-Hant |
| --- | --- | --- |
| Home — hero (viewport) | `home-hero-en.png` | `home-hero-zh-Hant.png` |
| Home — full page | `home-fullpage-en.png` | `home-fullpage-zh-Hant.png` |
| Product — full page | `product-en.png` | `product-zh-Hant.png` |
