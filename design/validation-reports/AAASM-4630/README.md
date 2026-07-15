# Validation report — AAASM-4630

**PR:** https://github.com/ai-agent-assembly/official-website/pull/70
**Branch:** `v0.0.1/AAASM-4630/fix/examples_cta_stale_version`
**Component:** `src/components/home/NextSteps.tsx` — homepage "Framework integration examples" CTA

## Bug

The CTA was pinned to a frozen docs snapshot (`core/v0.0.1-rc.3/usage-guide/examples.html`)
whose own outbound link to `https://ai-agent-assembly.github.io/python-sdk/stable/examples/`
is dead (pre-custom-domain GitHub Pages URL). Fix repoints the CTA at
`core/latest/usage-guide/examples.html`, which is already clean.

## Validation performed (Playwright MCP)

1. Started the Docusaurus dev server for this worktree (`pnpm start --port 3131`) and
   navigated to `http://localhost:3131/`.
2. Located the "Examples" next-step card and confirmed its rendered `href` is the fixed
   URL: `https://docs.agent-assembly.com/core/latest/usage-guide/examples.html?...`
   (screenshot: `official-website-nextsteps-section-after-fix.png`).
3. Clicked the card — it opens the target in a new tab as designed
   (`target="_blank"`/`rel="noopener noreferrer"` behavior confirmed by the tab list).
4. The new tab loaded a real, fully-rendered "Runnable examples" doc page — not a 404
   (screenshot: `official-website-examples-target-page-after-fix.png`).
5. For contrast/evidence, separately navigated to the dead link the *old* rc.3 snapshot
   pointed at (`https://ai-agent-assembly.github.io/python-sdk/stable/examples/`) and
   confirmed it is in fact a live 404 ("Page not found · GitHub Pages", HTTP 404) —
   screenshot: `official-website-stale-rc3-target-404-before-fix-reference.png`. This
   confirms the bug was real and the fix's target is materially different (renders
   real content instead of following the dead chain).

## Result

CTA click → new tab → real content. No console errors on either page beyond an
expected analytics-cookie-consent banner. Confirmed working end-to-end in a real
browser, not just a static href check.
