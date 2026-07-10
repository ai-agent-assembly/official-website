# Agent Assembly — Official Website

Source for the official product website at **[agent-assembly.com](https://agent-assembly.com)**.

This is a single-product marketing site (homepage, product page, blog) built with
[Docusaurus](https://docusaurus.io/) + TypeScript. Technical documentation lives on
`docs.agent-assembly.com`; the SaaS console on `app.agent-assembly.com`.

## Local development

```bash
pnpm install
pnpm start          # dev server at http://localhost:3000
pnpm build          # production build to ./build
pnpm serve          # preview the production build
pnpm lint            # eslint
 pnpm format         # prettier --write
 pnpm format:check   # prettier --check
 pnpm typecheck      # tsc --noEmit
 pnpm lefthook install  # one-time: enable pre-commit hooks
```

## Structure

```text
blog/                       Blog posts + authors.yml + tags.yml
src/pages/index.tsx         Custom homepage
src/pages/product.tsx       Product page
src/components/home/        Homepage section components
static/img/                 Images and brand assets
docusaurus.config.ts        Site config (nav, footer, blog)
metadata/site-metadata.yaml Canonical URLs + served install-script URL (SoT)
src/generated/site-urls.ts  Generated TS constants — DO NOT edit by hand
```

## Canonical URLs and the install-script URL

The four canonical URLs the site ships (`marketing`, `docs`, `app`, `api`) and
the served install-script URL live in **`metadata/site-metadata.yaml`**, the
single source of truth. The generator at `scripts/generate-site-metadata.mjs`
reads that file and rewrites:

- `src/generated/site-urls.ts` — TS constants imported by `docusaurus.config.ts`,
  `src/pages/product.tsx`, and `src/components/MegaMenu/menus.ts`.
- A bounded `# BEGIN GENERATED: install-script-url` / `# END GENERATED`
  sentinel block near the top of `static/install.sh`. The executable body
  (from `set -eu` onward) is untouched — it is enforced byte-identical to the
  canonical upstream installer by `installer-drift.yml`.

To change a URL:

```bash
# 1. edit metadata/site-metadata.yaml
pnpm run generate:site-metadata
# 2. commit the SoT change AND the regenerated artifacts
```

The `Site metadata drift check` workflow (`.github/workflows/site-metadata-drift.yml`)
re-runs the generator in CI and fails if the tracked artifacts drift from the
SoT — so hand-edits to `src/generated/site-urls.ts` or the install.sh sentinel
block will not merge.

## Notes

- Docs routing is disabled here on purpose — docs are a separate hub.
- Deployment to `agent-assembly.com` is tracked separately (depends on the domain/DNS work).
