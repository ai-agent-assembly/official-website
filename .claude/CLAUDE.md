# CLAUDE.md — official-website

Guidance for Claude Code (and humans) working in this repository. This file holds
**repo-specific** context only; universal engineering policy lives in the global
config. When a fact here duplicates `README.md`, `package.json`, `docusaurus.config.ts`,
or the `deploy.yml` workflow, treat those as the source of truth and update them, not
just this file.

Org-wide baseline: https://github.com/ai-agent-assembly/.github/blob/main/CLAUDE.md
(org-universal conventions this file doesn't repeat).

## What this repo is

The **public marketing website** for AI Agent Assembly — the product that enforces
governance on AI agents. It is a [Docusaurus](https://docusaurus.io/) 3 site
(TypeScript + React 19), built and deployed to **Cloudflare Pages** on every push to
`main`, and published at **<https://agent-assembly.com>**.

This is the top-of-funnel product site (landing pages, blog). It is **not** the docs
hub: developer documentation lives in the separate `agent-assembly-docs` repo and each
component ships its own docs site. Keep this site to marketing, positioning, and
announcements — link out to the docs hub rather than duplicating reference content.

## Site layout

| Path | Role |
|---|---|
| `docusaurus.config.ts` | Docusaurus config: `title`, `url`, `baseUrl`, navbar/footer, presets |
| `src/` | Authored React/TypeScript source (pages, components, CSS) — the analysed source root |
| `blog/` | Blog posts (Markdown/MDX) |
| `static/` | Static assets served as-is (images, favicon) |
| `build/` | Build output — **gitignored**, never commit it |
| `.docusaurus/` | Docusaurus cache — **gitignored** |

## Build, test, serve

Package manager is **pnpm** (v10 in CI; `pnpm-lock.yaml` is committed — never introduce
`package-lock.json` or `yarn.lock`). Node **>=20**. Run `pnpm lefthook install` once
after cloning to enable the pre-commit hooks.

```sh
pnpm install            # install dependencies (CI uses --frozen-lockfile)
pnpm start              # live-reload dev server at http://localhost:3000
pnpm build              # production build into build/ (CI gate)
pnpm serve              # serve the built site locally
pnpm typecheck          # tsc --noEmit (CI gate)
pnpm lint               # eslint . (CI gate)
pnpm lint:fix           # eslint --fix
pnpm format             # prettier --write .
pnpm format:check       # prettier --check . (CI gate)
```

## CI / deploy

- **`ci.yml`** runs on PRs and pushes to `main`: `lint`, `format` (`format:check`),
  `typecheck`, `build`, and a `sonar` job (SonarCloud; skips cleanly until `SONAR_TOKEN`
  is provisioned). Reproduce all four gates locally before pushing.
- **`deploy.yml`** builds and deploys to **Cloudflare Pages** (project `official-website`,
  production branch `main`) on push to `main`. Requires the `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID` secrets.
- **`installer-drift.yml`** — repo-specific drift check; consult the workflow before
  touching install-related content.
- **lefthook** runs `eslint`, `prettier --check`, and `typecheck` on staged files
  pre-commit. Never `--no-verify`.

## Conventions

- **Commits:** `<emoji> (<scope>): <imperative summary>` (gitmoji.dev). One logical
  unit per commit; bisectable. Keep them small and atomic.
- **Branch:** `<release-or-phase>/<ticket>/<type>/<short_summary>`
  (e.g. `v0.0.1/AAASM-4081/config/base_config`). Type values: `feat`, `fix`, `refactor`,
  `test`, `docs`, `config`, `deps`, `remove`, `lint`.
- **PR title:** `[<ticket>] <emoji> (<scope>): <summary>`; base branch **always
  `main`**; body follows `.github/PULL_REQUEST_TEMPLATE.md` (inherited from the org
  `.github` repo); ≥1 Pioneer-team approval.

## Repo-specific gotchas

- **Default branch is `main`** (not `master` like the core monorepo). Branch off and
  PR against `main`.
- **`origin` is canonical** — it points to `AI-agent-assembly/official-website` (the org,
  accessed via the `ai-agent-assembly` → `AI-agent-assembly` case alias). Confirm with
  `git remote -v`; scope changes against `origin/main`, which is often ahead of a stale
  checkout.
- **pnpm only.** The lockfile is `pnpm-lock.yaml`; Dependabot's `npm` ecosystem reads it.
  Do not switch package managers.
- **Health files are inherited**, not local: Code of Conduct, Contributing, Security
  policy, and the PR template come from the org `.github` repo. Do not add local copies.
- **Org GitHub Actions can be billing-blocked** — jobs may abort in seconds with a
  payments message. Check run **annotations** before triaging as a real failure;
  **validate locally** (`pnpm build`) rather than waiting on CI.
- **Never `--no-verify`; never force-push.**

## Project policy

- **JIRA:** project AAASM at <https://lightning-dust-mite.atlassian.net> (board 7). Set
  **Component** (`customfield_10041`) to the repo (`AI-agent-assembly/official-website`);
  Team (`customfield_10001`) = Pioneer. Epic → Story → Subtask (one Subtask ≈ one commit)
  + a `Verify …` subtask per Story.
- **Marketing content only.** Developer/reference docs live in `agent-assembly-docs` and
  each component's own docs site — link out, don't duplicate.
- **Self-hosted deployment is out of scope** product-wide (SaaS-only). Don't add
  Helm/Terraform/air-gapped/migration content even if the spec mentions it.
- **The Protocol Specification stays in the `agent-assembly` monorepo** — never author
  spec content here or in a separate `agent-assembly-spec` repo (archived by design).

## Documentation conventions — document the WHY, not the WHAT

This is the public front door: the prose **is** the product. Pages should convey
positioning and intent a visitor cannot reconstruct elsewhere — the problem, the
value, the differentiation — not restate API surface or version numbers that live (and
change) in the docs hub and component sites. Duplicated content rots out of sync; link
out to the canonical source instead.
