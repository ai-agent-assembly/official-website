---
slug: sdks-are-not-security-boundaries
title: SDKs Are Not Security Boundaries
authors: [team]
tags: [engineering, security]
---

An in-process SDK is the fastest way to govern an agent — but it is not, by itself, a
security boundary. Anything running in the same process can bypass it.

{/* truncate */}

That's why Agent Assembly is built as three independently-deployable layers:

- **SDK (in-process)** — fastest path; applies pre-execution allow/deny and emits events.
- **Sidecar proxy** — enforces network egress with no code changes; catches what the SDK misses.
- **eBPF (kernel)** — uprobes on SSL libraries plus exec/file syscall hooks catch everything,
  including deliberate bypass attempts.

Each layer raises the cost of evasion. The SDK is for adoption and speed; the proxy and eBPF
layers are where the boundary becomes hard to cross. Treating the SDK as the whole story is the
mistake — defense in depth is the point.
