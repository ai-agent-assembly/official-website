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

Every long-form piece under this plan must satisfy all six of the following.
Editors reject drafts that miss any one of them.

1. **Problem-first, not product-first.** Open the piece with a concrete
   failure mode a reader has actually seen (a leaked API key, a runaway
   agent loop, an audit finding, an MCP tool called without policy). The
   Agent Assembly reference appears only after the problem is fully framed
   — typically past the first two H2 sections.

2. **No generic AI hype.** Ban phrases: "the future of AI", "revolutionize",
   "transform your business", "unlock the power of". Ban stock statistics
   without a source. The reader is a working engineer or platform lead who
   is already tired of these.

3. **Concrete diagrams over stock imagery.** Every priority piece needs
   at least one architecture diagram or sequence diagram (Mermaid is
   fine — Docusaurus renders it) that shows the trust boundary being
   discussed. No photographs of "AI"; no gradient hero imagery.

4. **Code or config examples must run.** If a piece includes a policy
   snippet, a tool-call log line, or an audit event, it must match the
   real shapes in the open-source runtime. Editors verify by grepping the
   `agent-assembly` repo before merge.

5. **Internal links are UTM-tagged.** Every internal link that crosses a
   hostname (blog → docs, blog → product page, README → early-access)
   carries `utm_source`, `utm_medium`, `utm_campaign`, and `utm_content`
   per the [HORO-47](https://lightning-dust-mite.atlassian.net/browse/HORO-47)
   vocabulary. Same-host navigation links stay untagged so GA4 does not
   overwrite session source.

6. **One CTA per piece.** Each article has exactly one primary CTA target
   (a product page, the early-access form, the quickstart, or the GitHub
   repo). Secondary links are informational, not CTAs. This keeps event
   attribution ([HORO-45](https://lightning-dust-mite.atlassian.net/browse/HORO-45))
   readable.

## 4. Article backlog

Ten seed articles. Priority order is the intended publish order once the
early-access page ([HORO-43](https://lightning-dust-mite.atlassian.net/browse/HORO-43))
is live. Audience abbreviations: **DEV** = application developer building
agents, **PLAT** = platform / infra engineer, **SEC** = security / compliance
engineer, **DEC** = decision maker (eng manager, director, VP, CTO).

| # | Working title | Audience | Search intent | Primary CTA target |
|---|---|---|---|---|
| 1 | SDKs are not security boundaries for AI agents | DEV, SEC | Informational — "how do I stop my agent from doing X" | `/product` |
| 2 | How to govern tool calls in production AI agents | PLAT, SEC | Solution-aware — "agent tool call policy", "tool call authorization" | `/product` |
| 3 | Why AI agents need identity, authority, and audit trails | SEC, DEC | Category-defining — "AI agent governance" | Early-access (HORO-43) |
| 4 | MCP is not enough without runtime policy | DEV, PLAT | Solution-aware — readers already know MCP | `/product` |
| 5 | How to audit AI agent actions in production | SEC, PLAT | Compliance-driven — "agent audit log", "AI agent observability" | `https://docs.agent-assembly.com` (audit section) |
| 6 | Secret isolation for autonomous agents | DEV, SEC | Problem-aware — "agent leaked API key", "agent credential handling" | `https://docs.agent-assembly.com` (secrets) |
| 7 | The agent security model: prompt layer, tool layer, network layer | SEC, PLAT | Category-defining — mental-model piece | `/product` |
| 8 | From agent framework to governed agent runtime | DEV, PLAT | Solution-aware — "add governance to LangChain / CrewAI / Assistants" | Quickstart (`https://docs.agent-assembly.com/quickstart`) |
| 9 | What to log when an AI agent calls a tool | PLAT, SEC | How-to — "agent telemetry schema", "agent tool call log" | `https://docs.agent-assembly.com` (events / audit) |
| 10 | Buying vs building your agent guardrails | DEC | Buyer-journey — "build vs buy AI guardrails" | Early-access (HORO-43) |

**Notes on prioritisation.** Articles 1–3 are the seed launch set expanded
in Section 5. Article 4 is close behind — MCP is currently the highest-
signal search cluster we can address without a competitor callout. Articles
5–7 close the "what does governance actually mean" loop for security
readers. Articles 8–9 are conversion-oriented developer content and require
the docs sections from [HORO-48](https://lightning-dust-mite.atlassian.net/browse/HORO-48)
to exist first. Article 10 is a decision-maker piece; it should land only
after early-access has been open for at least two weeks so we have
qualitative evidence to reference.

## 5. Priority article outlines

### 5.1 Priority #1 — "SDKs are not security boundaries for AI agents"

**Thesis.** Agent SDKs (LangChain, LlamaIndex, CrewAI, Vercel AI SDK, the
OpenAI Assistants and Anthropic tools APIs) live inside the same process
and trust zone as user-supplied prompt content, so they cannot enforce a
security boundary against the agent they host. Treating an SDK guardrail
as if it were a boundary is the single most common architectural mistake
we see in shipping agent products. This piece defines what a real
boundary looks like and where it has to sit.

**Outline (H2s).**

1. The pattern: "we added a guardrail in the SDK"
2. Why in-process guardrails fail — the model, the tools, and the
   guardrail all read the same memory
3. What a security boundary actually is (control plane vs. data plane
   framing, with a diagram)
4. Three concrete failure modes: prompt-injected tool calls, secret
   read-back through tool output, unbounded network egress
5. Where the boundary has to live: outside the SDK process, in front of
   tool execution and network calls
6. What this looks like with Agent Assembly (short, one diagram)
7. Checklist: is your current guardrail a boundary or a suggestion?

**Primary CTA.** `/product` — the piece is category-defining and the
product page is the correct next step for a reader who now believes the
argument.

**Distribution channels.** GitHub README badge link, LinkedIn (founder
post), Hacker News (Show HN candidate — the existing blog post
`2026-06-25-sdks-are-not-security-boundaries` should be rolled forward
or superseded, not duplicated), Reddit r/programming, Reddit r/LocalLLaMA.

**Target SEO keywords.**

- `AI agent security boundary`
- `LLM agent guardrail`
- `LangChain security`
- `agent SDK security`
- `prompt injection tool call`

**UTM-tagged CTA URL example.**

```
https://agent-assembly.com/product?utm_source=blog&utm_medium=docs_link&utm_campaign=wave1_launch&utm_content=sdk_not_boundary_cta_bottom
```

### 5.2 Priority #2 — "How to govern tool calls in production AI agents"

**Thesis.** Once an agent leaves a demo and reaches production, tool calls
become the highest-risk surface: they cost money, write to systems of
record, and can leak data through their responses. This piece walks a
platform engineer through the four decisions every production tool-call
policy has to answer — who, what, how much, and with what audit — and
shows how to express each one at the runtime boundary rather than in
prompts.

**Outline (H2s).**

1. Why tool calls, not prompts, are the production risk surface
2. Four questions any production policy has to answer:
   who (identity), what (allow/deny), how much (budget/quota), audit (record)
3. Anti-pattern: policy expressed in a system prompt
4. Anti-pattern: policy expressed in the SDK wrapper
5. Policy at the runtime boundary — worked example (sequence diagram)
6. Handling the "the agent asked, but we said no" case gracefully
7. Rolling out policy without breaking existing agents (shadow mode → enforce)

**Primary CTA.** `/product` — the piece maps directly to the product's
Authority pillar.

**Distribution channels.** LinkedIn (platform-eng audience is strong on
LinkedIn), Hacker News, Reddit r/programming, Reddit r/devops,
platform-eng-focused Slack/Discord communities (Platform Engineering
community Slack, r/platform_engineering Discord).

**Target SEO keywords.**

- `AI agent tool call policy`
- `agent tool authorization`
- `LLM tool call governance`
- `agent guardrails production`
- `agent egress control`

**UTM-tagged CTA URL example.**

```
https://agent-assembly.com/product?utm_source=blog&utm_medium=docs_link&utm_campaign=wave1_launch&utm_content=govern_tool_calls_cta_inline
```

## 6. SEO keyword groups

*(To be authored in the next commit.)*

## 7. Distribution candidates

*(To be authored in the next commit.)*

## 8. Handoff notes

*(To be authored in the next commit.)*
