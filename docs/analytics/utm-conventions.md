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
