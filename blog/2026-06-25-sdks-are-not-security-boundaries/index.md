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

- **SDK (in-process)** — fastest path; applies pre-execution allow/deny on the framework tool
  calls it wraps, and emits events. It does not see raw HTTP, subprocess spawns, or file access.
- **Sidecar proxy** — enforces network egress without touching agent code, on traffic that is
  routed to it. The process has to honour `HTTP_PROXY`/`HTTPS_PROXY` and trust the local CA, and
  interception is HTTP/1.1 — HTTP/2, gRPC, and WebSocket fall outside it.
- **eBPF (kernel)** — uprobes on OpenSSL plus exec/file syscall hooks **observe** what the layers
  above never saw, including deliberate bypass attempts. The probes emit telemetry and return no
  verdict, so this layer detects; it does not block. Linux x86_64 only.

Each layer raises the cost of evading *undetected*. The SDK is for adoption and speed; the proxy
is where a second, out-of-process decision gets made; eBPF is where you find out something
happened that neither of them saw. Treating the SDK as the whole story is the mistake — defense
in depth is the point.

The honest version of "defense in depth" is worth stating, though, because the alternative is the
over-claim this post exists to argue against: three conditional layers compose into a *narrower*
gap, not the absence of one. An action that is not a wrapped tool call, is not routed through the
proxy, and does not run OpenSSL on Linux x86_64 is seen by none of them.
