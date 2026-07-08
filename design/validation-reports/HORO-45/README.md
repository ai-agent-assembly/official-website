# HORO-45 — validation report

Local dev-server validation ahead of merge, captured with Playwright against
`pnpm start --port 4145`.

## Key finding

The AA site's `docusaurus.config.ts` sets `docs: false` in the classic
preset — the docs plugin is disabled. `docs/analytics/event-taxonomy.md`
is therefore an internal repo-only spec and is NOT served as a public
route. Zero user-facing impact from this PR.

## Screenshots

| File | What it shows |
|---|---|
| `01-homepage-unchanged.png` | Homepage (`/`) — hero, CTAs ("Start self-hosting", "Try Cloud · Coming soon"), example policy-check block, navbar. No regression. |
| `02-docs-route-404-proves-no-side-effect.png` | `/docs/analytics/event-taxonomy` returns Docusaurus "Page Not Found" — proves the markdown file is not exposed to visitors. |

All CI gates green: Lint, Format, Typecheck, Build, SonarCloud, drift.
