---
slug: sdks-are-not-security-boundaries
title: SDKs Are Not Security Boundaries
authors: [team]
tags: [engineering, security]
---

An in-process SDK is the fastest way to govern an agent — but it is not, by itself, a
security boundary. Anything running in the same process can bypass it.

{/* truncate */}

:::note[Editorial note — 13 August 2026]

As published, this post framed the product as a fixed stack of three tiers, each one catching
what the tier above it missed. That framing has since been **retracted**. ADR 0033 records it as
a forbidden design: it presents one deployment shape as the architecture, and "the tier below
catches it" implies a continuity of coverage the product does not have — an absent component
governs nothing, and nothing behind it picks up the slack.

The body below has been corrected to the current framing: governance is a set of distinct
**roles**, each with its own reach, its own decision authority and its own failure mode, and
which of them exist at all is a deployment fact. The argument this post makes is unchanged —
an in-process SDK is not a security boundary — and the bounds it stated were already accurate.
Only the framing carrying them has been replaced.

:::

That's why Agent Assembly does not rely on the SDK alone. Governance is spread across distinct
roles, and which of them are present is something you decide when you deploy — not a ladder that
fills itself in:

- **In-process checkpoint (SDK)** — fastest path; the language wrapper raises on a deny before the
  tool call it wraps runs, and emits events. Advisory by construction: `aa-sdk-client` itself has
  no in-tree caller that refuses, a non-cooperating process simply never calls it, and it does not
  see raw HTTP, subprocess spawns, or file access.
- **Transport mediation (proxy)** — refuses network egress without requiring changes to the agent,
  on traffic that is routed to it. The process has to honour `HTTP_PROXY`/`HTTPS_PROXY` and trust
  the local CA, and interception is HTTP/1.1 — HTTP/2, gRPC, and WebSocket fall outside it.
- **Host-level interception (Linux eBPF)** — uprobes on OpenSSL plus exec/file syscall hooks
  **observe** activity that neither of the other two roles is positioned to see. The probes emit
  telemetry and return no verdict, so this role detects; it does not block, and anything it records
  has already happened. Linux only — the file-I/O kprobes, specifically, are x86_64 — and there is
  no macOS or Windows equivalent.

Each role raises the cost of evading *undetected*. The SDK is for adoption and speed; the proxy is
where a second, out-of-process decision gets made; the kernel probes are where you find out
something happened that neither of them saw. Treating the SDK as the whole story is the mistake —
defense in depth is the point.

The honest version of "defense in depth" is worth stating, though, because the alternative is the
over-claim this post exists to argue against: three conditional roles compose into a *narrower*
gap, not the absence of one. An action that is not a wrapped tool call, is not routed through the
proxy, and does not run OpenSSL on a Linux host with the probes loaded is seen by none of them.

The per-role boundaries, and which bypasses have actually been *measured* versus merely reasoned
about, are enumerated in
[Limitations and known bypasses](https://docs.agent-assembly.com/core/latest/devtools/limitations.html).
