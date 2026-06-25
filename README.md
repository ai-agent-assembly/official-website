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
```

## Notes

- Docs routing is disabled here on purpose — docs are a separate hub.
- Deployment to `agent-assembly.com` is tracked separately (depends on the domain/DNS work).
