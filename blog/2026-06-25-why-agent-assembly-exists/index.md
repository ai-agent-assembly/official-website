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

Agent frameworks make agents *capable*. They don't give an agent an identity, constrain
its authority, or keep secrets out of the model's reach. That gap is what Agent Assembly
closes: a runtime boundary that gives every agent an identity, limits what it can do, and
injects secrets at execution time so they never enter the context the model can see.

This blog is where we'll share the build — engineering notes, security decisions, and the
story of making a governance layer for autonomous agents.
