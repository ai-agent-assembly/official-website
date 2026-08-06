---
slug: why-agent-assembly-exists
title: Why Agent Assembly Exists
authors: [team]
tags: [founders-notes, security]
---

Autonomous agents are shipping into production faster than the controls around them.
An agent that can call tools can move money, touch customer data, and reach the open
internet — usually with the same credentials as the human who deployed it, and with
secrets sitting inside the model's context window.

{/* truncate */}

Agent frameworks make agents _capable_. They don't give an agent an identity, constrain
its authority, or keep credentials from travelling with its requests. That gap is what
Agent Assembly is closing: a runtime boundary that gives a registered agent an identity,
limits what it can do on the paths you route through it, and scans its outbound traffic
so recognised credentials are redacted before the request is forwarded.

Worth saying plainly, because the distinction matters more than the pitch: that boundary
holds on the paths it is wired into. An agent launched outside the managed path with no
integration installed, or talking over a transport the proxy does not parse, is outside it —
and we publish exactly where that line falls in
[Limitations and known bypasses](https://docs.agent-assembly.com/core/latest/devtools/limitations.html).

This blog is where we'll share the build — engineering notes, security decisions, and the
story of making a governance layer for autonomous agents.
