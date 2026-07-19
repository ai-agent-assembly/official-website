# AAASM-4884 — CSP enforcing cutover: validation

Validation that flipping `static/_headers` from `Content-Security-Policy-Report-Only`
to enforcing `Content-Security-Policy` (value unchanged) does **not** break the site.

## Method

- `pnpm build` → served `build/` locally.
- Playwright applied the **exact enforcing policy** from `static/_headers` as a
  `Content-Security-Policy` response header on the document, then loaded pages and
  captured all console CSP violations.

## Result

| Page | Renders | Console errors | CSP violations |
|---|---|---|---|
| `/` (home) | ✅ | 0 | 0 |
| `/blog` | ✅ | 0 | 0 |

The site's actual resource loads are all covered by the policy: scripts (`'self'` +
`www.googletagmanager.com`), styles (`'self' 'unsafe-inline'`), fonts (`'self' data:`
— no external fonts referenced), images (`'self' data: https:`), connect
(`www.google-analytics.com` + same-origin), and the Cloudflare Web Analytics beacon
(`static.cloudflareinsights.com`, edge-injected on the deployed Pages site). The
`github.com` / `pypi.org` / `docs.agent-assembly.com` references in the markup are
navigation links (`href`), not resource loads, so they are not subject to CSP.

## Artifacts

- `aaasm-4884-enforced-csp-home-clean.png` — homepage rendering under the enforcing
  policy (hero, navbar, CTAs, background, code demo all intact).

## Note

On the live edge there is currently a **separate Cloudflare Transform Rule** emitting
an enforcing policy that is *missing* the beacon host; it must be removed so this
`static/_headers` policy is the single CSP source (see the PR description and
AAASM-4884).
