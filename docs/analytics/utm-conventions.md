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
  hostname boundary (for example, `horonomy.dev` → `agent-assembly.com` or
  `agent-assembly.com` → `docs.agent-assembly.com`).

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
  describes *where the click happened on-page*. See Section 4.
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

### 2.5 `utm_content` — which variant of a post

Distinguishes multiple links that share the same source/medium/campaign.
Answers: *within one initiative, which specific creative or placement
produced this click?*

Common patterns:

| Value shape | Use for |
|---|---|
| `hero_cta` | The primary hero CTA on a landing page (when the link crosses hostnames) |
| `footer_link` | Footer link on the Horonomy site pointing at the product site |
| `readme_badge` | The clickable badge in a GitHub README |
| `blog_<slug>` | Body link inside a blog post; slug matches the article filename (no personal names) |
| `post_variant_<letter>` | A/B split for two founder posts running the same day (`post_variant_a`, `post_variant_b`) |

**Rules for `utm_content`**

- No PII. Never encode an email, order id, session id, name, or handle.
  Values must be identical across every recipient of the same link.
- Use `<pattern>_<qualifier>` shape. If you need free text (e.g. a blog
  slug), reuse the slug the content already publishes under.
- If the variant does not carry campaign-comparison value (e.g. one link
  in an entire early-access email), omit `utm_content` rather than
  inventing a filler value.

## 3. Composition rules

Valid parameter combinations. A cell marked ✓ means the value is required
for that channel; ○ means optional but recommended; blank means omit.

| Channel example                | source     | medium         | campaign            | content     |
|--------------------------------|------------|----------------|---------------------|-------------|
| GitHub README badge link       | `github` ✓ | `readme` ✓     | `agent_assembly_launch` ✓ | `readme_badge` ○ |
| GitHub Issues body link        | `github` ✓ | `readme` ✓     | matches initiative ✓ | ○           |
| LinkedIn founder feed post     | `linkedin` ✓ | `social` ✓   | matches initiative ✓ | `post_variant_a` ○ |
| LinkedIn DM                    | `linkedin` ✓ | `direct_outreach` ✓ | matches initiative ✓ | ○      |
| X public post                  | `x` ✓      | `social` ✓     | matches initiative ✓ | ○           |
| Reddit subreddit thread        | `reddit` ✓ | `community` ✓  | matches initiative ✓ | ○           |
| Hacker News Show HN            | `hackernews` ✓ | `community` ✓ | `agent_assembly_launch` ✓ | ○     |
| Early-access confirmation email | `email` ✓ | `direct_outreach` ✓ | `early_access` ✓ | ○         |
| Third-party newsletter placement | `newsletter` ✓ | `newsletter` ✓ | matches initiative ✓ | slug ○   |
| Docs → product cross-hostname link | `docs` ✓ | `docs_link` ✓  | matches initiative ✓ | page slug ○ |
| Blog → early-access cross-hostname link | `blog` ✓ | `docs_link` ✓ | `early_access` ✓ | blog slug ○ |

**Composition constraints**

- `source` and `medium` are ALWAYS required. A URL with `utm_campaign`
  but no `utm_source` is invalid — GA4 will silently attribute the visit
  as Direct.
- Same-hostname internal links MUST NOT carry any UTM parameters. UTM
  overwrites the visitor's original session source.
- Do not carry UTM through a redirect chain unless every hop preserves
  the query string. Prefer a direct final URL.

## 4. Worked examples

Each example is a real link shape the team will produce in the first
launch wave. Copy the pattern; substitute the moving parts. Every
example is safe to publish — no PII, no personal handles, no ad-hoc
values.

### 4.1 GitHub README badge — link URL

`https://agent-assembly.com/?utm_source=github&utm_medium=readme&utm_campaign=agent_assembly_launch&utm_content=readme_badge`

Attach only to the *link URL* under the badge, never to the badge image
source (shields.io strips or refuses URL params on the image endpoint).

### 4.2 LinkedIn founder feed post

`https://agent-assembly.com/?utm_source=linkedin&utm_medium=social&utm_campaign=agent_security_content&utm_content=post_variant_a`

Bump the `utm_content` letter for each variant of a repost or A/B test.
Do NOT put the poster's name in `utm_content`.

### 4.3 Reddit r/MachineLearning thread

`https://github.com/ai-agent-assembly/agent-assembly?utm_source=reddit&utm_medium=community&utm_campaign=oss_install&utm_content=ai_agents_thread`

The `utm_content` uses the thread's *topic slug*, not the thread title
verbatim. Keep it short, lowercase, snake_case.

### 4.4 Hacker News Show HN

`https://github.com/ai-agent-assembly/agent-assembly?utm_source=hackernews&utm_medium=community&utm_campaign=agent_assembly_launch`

`utm_content` is omitted — the campaign already identifies the initiative,
and HN traffic will surface as a single tagged row.

### 4.5 Cross-hostname internal link (docs → early access)

`https://agent-assembly.com/early-access?utm_source=docs&utm_medium=docs_link&utm_campaign=early_access&utm_content=security_model_page`

Fires because the click crosses `docs.agent-assembly.com` →
`agent-assembly.com`. `utm_content` is the docs page slug where the CTA sits.

### 4.6 Early-access confirmation email

`https://agent-assembly.com/quickstart?utm_source=email&utm_medium=direct_outreach&utm_campaign=early_access`

Sent from the confirmation-email template. Do NOT append a recipient
identifier — every recipient of that template hits the same tagged URL.
Recipient-level attribution belongs in the email tool, not the URL.

### 4.7 Third-party newsletter placement

`https://agent-assembly.com/?utm_source=newsletter&utm_medium=newsletter&utm_campaign=agent_security_content&utm_content=this_week_in_ai_2026_07`

`utm_content` encodes the newsletter name and issue date, in snake_case,
so multiple placements in the same newsletter over time stay distinct.
