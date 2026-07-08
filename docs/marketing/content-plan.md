# Initial SEO and Technical Content Plan — AI Agent Governance

> Status: Draft — Wave 1 planning deliverable for Epic [HORO-39](https://lightning-dust-mite.atlassian.net/browse/HORO-39).
> Ticket: [HORO-49](https://lightning-dust-mite.atlassian.net/browse/HORO-49).

## 1. Purpose and scope

This document is the seed content plan that Agent Assembly's founder-led
market-education push will draw from for the first launch wave. It defines
positioning, editorial principles, an article backlog, three priority
long-form pieces with full outlines, an SEO keyword grouping, distribution
candidates, and handoff notes to the landing-page ([HORO-42](https://lightning-dust-mite.atlassian.net/browse/HORO-42)),
early-access ([HORO-43](https://lightning-dust-mite.atlassian.net/browse/HORO-43)),
and docs ([HORO-48](https://lightning-dust-mite.atlassian.net/browse/HORO-48))
workstreams.

**In scope**

- Positioning statement and editorial principles for all long-form content.
- A backlog of 8–12 articles with target audience, search intent, and CTA target.
- Three fully-outlined priority pieces intended to publish inside the launch
  window.
- Keyword clusters grouped by search intent.
- Distribution channel shortlist consistent with [HORO-47](https://lightning-dust-mite.atlassian.net/browse/HORO-47)
  UTM vocabulary.

**Out of scope**

- Full drafts of each article (authoring lands in follow-up tickets).
- Paid promotion / ads plan.
- Editorial calendar with fixed dates. The plan is publish-order priority,
  not date-driven, because early-access ([HORO-43](https://lightning-dust-mite.atlassian.net/browse/HORO-43))
  is the gating dependency.

## 2. Positioning statement

**Agent Assembly is a governance and runtime-boundary layer for autonomous
AI agents. It is not another agent framework.**

Agent frameworks (LangChain, LlamaIndex, CrewAI, OpenAI Assistants, Vercel
AI SDK, etc.) make agents *capable* — they plan, call tools, and act.
Agent Assembly sits *underneath* whatever framework a team already uses and
enforces what those agents are actually *allowed* to do at runtime:

- **Identity** — every agent has a per-agent, team-scoped identity distinct
  from the human developer's credentials.
- **Authority** — allow/deny policy over tool calls, network egress, and
  per-team budgets/quotas — enforced at the boundary, not inside prompts.
- **Audit** — a tamper-evident record of every tool call, network hop, and
  policy decision, mapped back to the agent identity that produced it.
- **Secret isolation** — credentials never reach the model or the tool
  layer inside the same trust zone as user-supplied prompts.

**What we do NOT claim:**

- We are not "the SaaS control plane for AI agents". Cloud/SaaS delivery is
  not generally available. The open-source runtime is the only shipping
  surface today, and content must reflect that.
- We do not claim adoption or traffic numbers. Any figure that appears in
  a piece must be sourced to a third party (Gartner, LangChain state-of-AI
  survey, OpenAI/Anthropic public data) or omitted.
- We do not position against a specific competitor by name in long-form
  content. We contrast with categories ("agent frameworks", "MCP alone",
  "SDK-level guardrails"), not vendors.

## 3. Content principles

*(To be authored in the next commit.)*

## 4. Article backlog

*(To be authored in the next commit.)*

## 5. Priority article outlines

*(To be authored in follow-up commits — one per article.)*

## 6. SEO keyword groups

*(To be authored in the next commit.)*

## 7. Distribution candidates

*(To be authored in the next commit.)*

## 8. Handoff notes

*(To be authored in the next commit.)*
