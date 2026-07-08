# UTM and Source Attribution Conventions

> Status: Draft — Wave 1 planning deliverable for Epic [HORO-39](https://lightning-dust-mite.atlassian.net/browse/HORO-39).
> Ticket: [HORO-47](https://lightning-dust-mite.atlassian.net/browse/HORO-47).

## 1. Purpose and scope

Horonomy and Agent Assembly are approaching their first external community
promotion. Before founder-led posts, community threads, GitHub README badges,
and early-access email links go out, every outbound link that a human might
click must carry consistent UTM parameters so GA4 can distinguish real
developer or buyer intent from generic Direct traffic.

This document defines:

- The controlled vocabulary for each UTM parameter.
- The rules for combining those parameters.
- Worked examples for the channels that will run in the first launch wave.
- Anti-patterns to reject during review.
- A pre-launch checklist that any teammate can run before pressing publish.

**In scope**

- Links shared from Horonomy company site, Agent Assembly product/docs,
  GitHub README badges (link URL only, not badge image), founder-led social
  posts, community threads, newsletters, early-access emails.
- Internal cross-links between our own properties when they cross a
  hostname boundary (for example, `horonomy.com` → `agentassembly.dev` or
  `agentassembly.dev` → `docs.agentassembly.dev`).

**Out of scope**

- Same-hostname internal navigation links. GA4 tracks these through
  page path and referrer; adding UTM would overwrite legitimate session
  source and inflate campaign counts.
- Paid ad tagging (deferred until the OSS funnel is instrumented).
- Server-to-server or API attribution (handled through GA4 measurement
  protocol, not URL tagging).

**Coordination points**

- Baseline vocabularies inherit from the Epic [HORO-39](https://lightning-dust-mite.atlassian.net/browse/HORO-39)
  description. New values require justification in a PR to this document.
- `utm_content` values are distinct from the `cta_location` event parameter
  defined in the event taxonomy work ([HORO-45](https://lightning-dust-mite.atlassian.net/browse/HORO-45)).
  UTM describes *where the click came from off-site*; `cta_location`
  describes *where the click happened on-page*. See Section 5.
- Downstream consumers of this convention: [HORO-41](https://lightning-dust-mite.atlassian.net/browse/HORO-41),
  [HORO-42](https://lightning-dust-mite.atlassian.net/browse/HORO-42),
  [HORO-48](https://lightning-dust-mite.atlassian.net/browse/HORO-48)
  embed UTM-tagged internal links; [HORO-50](https://lightning-dust-mite.atlassian.net/browse/HORO-50)
  runs the QA pass.

## 2. Naming convention

### 2.1 Global rules

- **Casing**: lowercase `snake_case` for every value, every parameter.
  `LinkedIn`, `Linkedin`, `linked-in`, and `linked_in` all resolve to
  different rows in GA4. Only `linkedin` is valid here.
- **Character set**: `[a-z0-9_]` only. No spaces, no punctuation, no
  emoji, no unicode. If a value needs a delimiter, use `_`.
- **Length**: keep each value under 40 characters. GA4 truncates long
  parameter values in some reports.
- **Stability**: a value in production must not be renamed. Retire it and
  introduce a replacement instead — historical GA4 rows do not backfill.
- **No PII, ever**: `utm_content` must never carry an email address,
  user id, order id, session id, or personal name. See Section 6.

### 2.2 `utm_source` — who sent the visitor

Identifies the platform, site, or property the click originated on.
Answers: *where was the user immediately before this click?*

| Value | Use for |
|---|---|
| `github` | Links from any repository README, GitHub org page, GitHub Issues, GitHub Discussions, GitHub release notes |
| `linkedin` | Founder posts, company page posts, LinkedIn newsletter, LinkedIn DMs |
| `x` | Posts on X (formerly Twitter), including quote posts and replies |
| `reddit` | Subreddit threads, comments, DMs |
| `hackernews` | Show HN, Ask HN, comments, submissions |
| `discord` | Discord community messages, announcements, DMs |
| `slack` | Public Slack community messages, DMs |
| `email` | Any 1:1 or bulk email, including founder outreach |
| `blog` | Horonomy blog and Agent Assembly blog outbound links that cross a hostname boundary |
| `docs` | Documentation site outbound links that cross a hostname boundary |
| `newsletter` | Third-party newsletter placements (This Week in AI, etc.) — reserve for external editors, not our own list |

**Adding a new source**: open a PR that (a) shows the channel is
non-trivial (expected >20 clicks in the first month), (b) confirms no
existing value covers it, and (c) updates Section 2.2, Section 6 examples,
and the quick-reference table in Section 8.

### 2.3 `utm_medium` — how the visitor got there

Describes the *type* of surface the click sat on. Answers: *what kind of
touchpoint is this?* A single source usually has more than one medium
(a LinkedIn post is `social`; a LinkedIn DM is `direct_outreach`).

| Value | Use for |
|---|---|
| `readme` | README badges and body links in any repository we control |
| `social` | Public timeline posts on LinkedIn, X, Bluesky, Threads |
| `community` | Public community threads (Reddit, Hacker News, Discord public channels, Slack public channels) |
| `referral` | Third-party blog posts, podcast show notes, conference slide decks |
| `newsletter` | Newsletter body copy, either ours (once we run one) or external |
| `direct_outreach` | 1:1 DMs, cold email, warm intro email |
| `docs_link` | Cross-hostname docs links (docs.agentassembly.dev → agentassembly.dev/early-access) |

**Source × medium relationship**

`utm_source` and `utm_medium` are not redundant. GA4 groups them into a
"Source / medium" dimension (`linkedin / social`, `linkedin / direct_outreach`)
and reports on both. Choose the pair that will still make sense in six
months when someone asks "did DMs convert better than the founder feed?"

**Reserved GA4 medium mappings**

GA4 auto-classifies certain `utm_medium` values into channels. Keep the
convention aligned so Default Channel Group works without extra rules:

- `social` → GA4 "Organic Social" channel.
- `email` (as medium) → GA4 "Email" channel. We do NOT use `email` as
  a medium; we use `direct_outreach` or `newsletter` and set
  `utm_source=email` when it truly is a direct email send. This is a
  deliberate deviation, documented so anyone doing a channel-group review
  knows to add a custom rule mapping `direct_outreach` and `newsletter` to
  the appropriate GA4 channel.
- `referral` → GA4 "Referral" channel.
- `cpc`, `ppc`, `paid*` are RESERVED — do not use until paid ads are in
  scope (out of scope for HORO-47).

### 2.4 `utm_campaign` — what business initiative

Groups clicks by the intent of the effort, not the individual post.
Answers: *which initiative is this click evidence for?*

| Value | Use for |
|---|---|
| `agent_assembly_launch` | The public launch wave — GitHub trending push, first HN Show HN, initial founder feed |
| `agent_security_content` | Ongoing content series on AI agent governance, sandboxing, policy, audit |
| `early_access` | Any promotion of the Cloud Early Access / design-partner form |
| `oss_install` | Promotion of the OSS self-hosting path (install command, quickstart, example run) |

**Choosing a campaign**

- One campaign per business objective. If two posts serve the same
  objective (e.g. two founder posts about early access), they share
  `utm_campaign=early_access` and differ only in `utm_content`.
- A campaign lifespan is typically 4–12 weeks. When an initiative ends,
  the value is retired — do not reuse an old name for a new push.
- `utm_id` is OPTIONAL and, when used, must equal `utm_campaign`. GA4
  respects `utm_id` for Campaign ID reporting; keeping it identical to
  `utm_campaign` avoids a second vocabulary to maintain. Only add
  `utm_id` when a campaign will be joined against external ad-platform
  data (not applicable for HORO-47's OSS/organic scope).

**Adding a new campaign**

Add a row to the quick-reference table in Section 8 and note the start
date, expected end date, and owner in that row. Anyone can add a campaign
value; the constraint is that it must map to a real, named initiative
that a teammate can point to.
