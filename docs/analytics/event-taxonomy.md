---
title: GA4 and GTM event taxonomy
description: Canonical event names, parameters, key events, and DebugView validation plan for Horonomy and Agent Assembly.
status: draft
ticket: HORO-45
epic: HORO-39
---

# GA4 and GTM event taxonomy

> Wave 1 planning deliverable for Epic [HORO-39](https://lightning-dust-mite.atlassian.net/browse/HORO-39).
> This document is the canonical reference every implementation ticket
> (HORO-41, HORO-42, HORO-43, HORO-44, HORO-48) uses when wiring up
> analytics. Report / dashboard building (HORO-46) reads its event list
> from here. Pre-launch QA (HORO-50) validates events against this doc.

## 1. Purpose and scope

### 1.1 Why this document exists

Current GA4 for Horonomy and Agent Assembly records only the automatic
GA4 events (`page_view`, `session_start`, `user_engagement`, `scroll`,
`click`). Without structured events, the team cannot tell whether
visitors want OSS self-hosting, cloud early access, GitHub validation,
docs adoption, or none of the above.

Before external community promotion, every high-intent action across
the three surfaces must be measured as a named event with a stable set
of parameters, and a defined subset of those events must be marked as
GA4 Key Events so conversion reporting is possible.

### 1.2 What this document is

- The canonical list of event names.
- A parameter dictionary (types, allowed values, PII rationale).
- The list of GA4 Key Events (conversions).
- The GTM-vs-code decision for each event.
- A DebugView / Realtime validation checklist.
- A worked example for instrumenting a new CTA.
- A cross-surface segmentation guide (hostname, surface, page_path).
- An explicit security / privacy check.

### 1.3 What this document is NOT

- Not a copy of the GA4 web interface. GA4 config screens change; this
  document is stable text a reviewer can read in one sitting.
- Not a page-to-event binding table. That is HORO-40 Section 5. This
  document assumes those bindings exist and tells the implementer how
  to fire the events correctly.
- Not a UTM convention. UTM is HORO-47. UTM values ride on URLs; event
  parameters ride on GA4 payloads. Do not conflate them.
- Not a dashboard spec. That is HORO-46.

### 1.4 Guiding constraints (from Epic HORO-39)

- Events must distinguish OSS install intent, docs intent, GitHub
  validation, security evaluation, and cloud early-access lead intent.
- No PII in any event parameter — enforce with the closed-vocabulary
  parameters defined in Section 3.
- Prefer GTM for events whose value evolves faster than the site's
  build cadence; use code-emitted dataLayer events for behavior that
  the app controls (copy-to-clipboard, form submits, section-in-view
  visibility).
- Every event, at minimum, carries `hostname`, `page_path`, `page_title`,
  and `surface`. See Section 3.

## 2. Core events

Names are drawn from the Epic (HORO-39). Where the Epic description
uses accidental Markdown italics (e.g. `security*model*view`), the
canonical form is `snake_case` with underscores: `security_model_view`.

Each event has: a stable name, a plain-English meaning, and the trigger
that must fire it. Parameters live in Section 3.

### 2.1 Navigation and content events

| Event                 | Meaning                                                     | Trigger                                                                              |
|-----------------------|-------------------------------------------------------------|--------------------------------------------------------------------------------------|
| `docs_click`          | Visitor left a non-docs surface for the docs site           | Click on a link whose `link_domain` is `docs.agent-assembly.com`                    |
| `quickstart_click`    | Visitor followed the quickstart CTA                         | Click on any CTA whose target is the quickstart page                                 |
| `installation_view`   | Visitor viewed the installation page                        | Page view of the installation page (`page_path` starts with `/installation`)         |
| `architecture_view`   | Visitor viewed the architecture section or page             | ≥50% viewport visibility of the architecture section, OR page view of that page     |
| `security_model_view` | Visitor viewed the security model section or page           | ≥50% viewport visibility of the security-model section, OR page view of that page   |
| `sdk_page_view`       | Visitor viewed an SDK page (parameter `sdk` names which)    | Page view of an SDK page                                                             |
| `outbound_click`      | Fallback event for outbound clicks not covered elsewhere    | Any outbound click that does NOT have a more specific event above                    |

### 2.2 High-intent product events

| Event                          | Meaning                                                                    | Trigger                                                                                    |
|--------------------------------|----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| `copy_install_command`         | Visitor copied an install command to clipboard                             | Copy button on an install-command block (code-emitted, not automatic GA4)                  |
| `cta_start_self_hosting_click` | Visitor clicked the "Start self-hosting" CTA                               | Click on the primary hero CTA of that name                                                 |
| `cta_cloud_early_access_click` | Visitor clicked "Request Cloud Early Access"                               | Click on the cloud-early-access CTA anywhere on the product site or docs footer            |
| `cta_view_github_click`        | Visitor clicked "View on GitHub" from a CTA (not a nav link)               | Click on a hero / body / final "View on GitHub" button                                     |
| `cta_view_docs_click`          | Visitor clicked "View docs" from a CTA (not the nav)                       | Click on a hero / body "View docs" button                                                  |
| `github_org_click`             | Visitor left for the GitHub org page                                       | Any click to `github.com/ai-agent-assembly` (the org root)                                 |
| `github_core_repo_click`       | Visitor deep-linked to the core repo                                       | Any click to `github.com/ai-agent-assembly/agent-assembly`                                 |
| `examples_repo_click`          | Visitor deep-linked to the examples repo                                   | Any click to `github.com/ai-agent-assembly/agent-assembly-examples`                        |

### 2.3 Cloud Early Access events

| Event                                | Meaning                                        | Trigger                                                    |
|--------------------------------------|------------------------------------------------|------------------------------------------------------------|
| `cloud_early_access_page_view`       | Visitor loaded the early-access form page      | Page view of the early-access route                        |
| `cloud_early_access_submit`          | Visitor submitted the early-access form        | Form submit success (code-emitted dataLayer event)         |
| `cloud_early_access_oss_docs_click`  | On thank-you, visitor took the OSS next step   | Click on "See OSS docs" link on the thank-you page         |
| `cloud_early_access_github_click`    | On thank-you, visitor took the GitHub next step | Click on "View on GitHub" link on the thank-you page      |

### 2.4 Horonomy-specific events

| Event                                    | Meaning                                              | Trigger                                                             |
|------------------------------------------|------------------------------------------------------|---------------------------------------------------------------------|
| `horonomy_product_agent_assembly_click`  | Visitor left Horonomy for the Agent Assembly site    | Cross-hostname click from `horonomy.dev` to `agent-assembly.com`    |
| `horonomy_github_click`                  | Visitor left Horonomy for the GitHub org page        | Any click on Horonomy pointing at `github.com/ai-agent-assembly`    |
| `horonomy_manifesto_click`               | Visitor clicked the manifesto / about CTA            | Nav or hero-secondary click on Horonomy                             |
| `horonomy_contact_click`                 | Visitor clicked a contact link                       | Click on any contact link on Horonomy                               |
| `horonomy_blog_click`                    | Visitor clicked a Horonomy blog post title           | Click on a blog post title, either in nav or on the blog list       |

### 2.5 Docs-specific events

Docs mirror several product events but with a `docs_` prefix so that a
report can attribute intent to the docs site vs the product site
without a hostname filter.

| Event                        | Meaning                                                | Trigger                                                             |
|------------------------------|--------------------------------------------------------|---------------------------------------------------------------------|
| `docs_quickstart_click`      | High-intent action inside quickstart                   | Any next-step CTA on the quickstart page                            |
| `docs_installation_view`     | Docs installation page view                            | Same as `installation_view`, but the parameter `surface=docs`       |
| `docs_copy_install_command`  | Copy on a docs install-command block                   | Copy-to-clipboard on an install command inside docs                 |
| `docs_sdk_python_view`       | Python SDK docs page view                              | Page view of the Python SDK page                                    |
| `docs_sdk_node_view`         | Node SDK docs page view                                | Page view of the Node SDK page                                      |
| `docs_sdk_go_view`           | Go SDK docs page view                                  | Page view of the Go SDK page                                        |
| `docs_examples_click`        | Click from docs to the examples repo                   | Any click from docs to `agent-assembly-examples`                    |
| `docs_security_model_view`   | Docs security model page view                          | Page view of the security model page                               |
| `docs_github_issue_click`    | Docs → GitHub Issues click                             | Click on "Open a GitHub issue" or equivalent in docs troubleshooting |

Wherever a docs event has an unprefixed twin (e.g. `docs_installation_view`
vs `installation_view`), fire the unprefixed event on the product site
and the docs-prefixed event on the docs site — they are the same
concept scoped to different surfaces via the `surface` parameter.

### 2.6 Contact event

| Event           | Meaning                                | Trigger                                                                       |
|-----------------|----------------------------------------|-------------------------------------------------------------------------------|
| `contact_click` | Visitor initiated contact              | Any contact form submit, `mailto:` link click, or dedicated contact CTA click |

## 3. Event parameter dictionary

Every event carries a stable set of parameters. Where a parameter is
listed as a closed vocabulary, values outside that vocabulary must be
rejected at review — GA4 will not tell you a typo happened; it will
silently create a new row.

### 3.1 Required on every event

| Parameter    | Type    | Meaning                                                          | Allowed values / rules                                                            |
|--------------|---------|------------------------------------------------------------------|------------------------------------------------------------------------------------|
| `hostname`   | string  | The site the event fired on                                      | `horonomy.dev`, `agent-assembly.com`, `docs.agent-assembly.com`                    |
| `page_path`  | string  | The path portion of the URL, no query or fragment                | Starts with `/`; lowercase; no email addresses, IDs, or tokens                     |
| `page_title` | string  | The page's `<title>`                                             | Free text, but no PII (must be identical for every visitor of that page)           |
| `surface`    | string  | Coarse surface classification for reporting                      | `horonomy_site`, `product_site`, `docs`, `github_readme` (for outbound-from-README) |

### 3.2 CTA-bound events

Any event that fires from a click, form submit, or view of a specific
CTA carries these in addition to Section 3.1.

| Parameter      | Type    | Meaning                                              | Allowed values                                                                                    |
|----------------|---------|------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| `cta_location` | string  | Where on the page the CTA sits                       | `hero`, `nav`, `body`, `install_block`, `footer`, `thank_you`, `side_rail`                        |
| `link_url`     | string  | Full URL of the target                               | Absolute URL, no session identifiers, no user IDs                                                 |
| `link_domain`  | string  | Hostname of the target                               | Derived from `link_url`                                                                            |
| `target_product` | string | Which product surface the click points at            | `agent_assembly`, `horonomy`, `docs`, `github`, `early_access`                                    |

### 3.3 Install-command events

Fires alongside `copy_install_command` and its docs twin.

| Parameter       | Type    | Meaning                                    | Allowed values                                    |
|-----------------|---------|--------------------------------------------|----------------------------------------------------|
| `command_type`  | string  | Which install method the command represents | `curl`, `brew`, `docker`, `source`, `other`      |

Do NOT include the command string itself as a parameter — the vocabulary
is enough for segmentation, and encoding the command bloats the payload.

### 3.4 SDK page events

Fires alongside `sdk_page_view` and its docs twins.

| Parameter | Type   | Meaning                | Allowed values                     |
|-----------|--------|------------------------|-------------------------------------|
| `sdk`     | string | Which SDK is being viewed | `python`, `node`, `go`, `other`  |

### 3.5 Cloud early-access form event

Fires alongside `cloud_early_access_submit` only.

| Parameter       | Type    | Meaning                                     | Allowed values                                                     |
|-----------------|---------|---------------------------------------------|--------------------------------------------------------------------|
| `role`          | string  | Self-selected role from the form            | `developer`, `platform_engineer`, `security_engineer`, `founder`, `other` |
| `team_size`     | string  | Self-selected team/company size             | `solo`, `startup`, `team`, `enterprise`, `other`                   |
| `deployment`    | string  | Preferred deployment                        | `oss`, `self_hosted`, `saas`, `not_sure`                           |

The form MUST NOT emit `email`, `company_name`, `full_name`, or
`github_url` as event parameters. Those fields belong in the form-backend
storage (a private database or spreadsheet), never in the GA4 payload
where they end up in browser history and third-party analytics tags.

### 3.6 Parameter shape rules

- All parameter names: lowercase snake_case.
- All string values: lowercase, no whitespace, no punctuation beyond
  `_`, `-`, `/`, `.`, `:` for URLs.
- Boolean-ish values are represented as strings (`"true"` / `"false"`)
  because GA4's custom parameters are string-typed by default; do not
  send raw booleans and expect them to survive.
- No parameter may vary per visitor for the same on-page event —
  otherwise it is PII by construction.

## 4. GA4 Key Events (conversions)

Configure the following as GA4 Key Events (Admin → Events → Mark as key
event). These are the events the reporting dashboard (HORO-46) and
launch review framework (HORO-50) will treat as conversion signals.

- `copy_install_command` — proxy for OSS install intent.
- `cloud_early_access_submit` — direct SaaS-lead signal.
- `github_core_repo_click` — engineering-audience validation signal.
- `examples_repo_click` — hands-on learn-by-example intent.
- `contact_click` — high-intent inbound.

**Why exactly this set.** These five cover the three explicit paths
the Epic defines (developer, platform/security, buyer) plus a general
contact signal. Marking anything else as a Key Event dilutes the
conversion dashboard; if additional signals prove important, propose
adding them in a follow-up PR that also updates the reports.

**What is NOT a Key Event even though it might look like one.**

- `docs_click` — too broad; users click into docs for many reasons,
  not all conversion-worthy. Report on it as an event, not a conversion.
- `security_model_view` — depth-of-engagement signal, not conversion.
  Reported separately in the funnel.
- `cta_start_self_hosting_click` — intermediate step; the actual
  conversion is `copy_install_command`.

**GA4 configuration notes.**

- Key Events must be registered from real event data — GA4 requires at
  least one instance of the event before it can be marked. The launch
  order is: implement → validate in DebugView → mark as Key Event.
- Do NOT enable "Modeled conversions" for these events before the
  first 100 real conversions land — the model has nothing to fit on
  and produces misleading estimates during the launch window.

## 5. Implementation notes — GTM vs code-emitted dataLayer

The site loads GTM; GTM loads GA4. Events reach GA4 in two ways:

1. **GTM-authored triggers**, listening for DOM clicks matched by a
   CSS selector or a link URL pattern.
2. **Code-emitted `dataLayer.push(...)` events**, then a GTM trigger of
   type "Custom Event" that forwards them to GA4.

Pick one per event based on the following rule.

### 5.1 Use GTM triggers when

The event is inferable from DOM inspection alone — CSS class, link
target, or page-path pattern is enough. These events benefit from GTM
because analytics can iterate without a site rebuild.

- All navigation clicks (`docs_click`, `horonomy_github_click`, nav CTAs).
- Outbound-link clicks by destination domain (`github_core_repo_click`,
  `examples_repo_click`).
- Page-view classification events (`installation_view`,
  `sdk_page_view` variants) — GTM's built-in Page View trigger with a
  Page Path filter.

### 5.2 Use code-emitted dataLayer events when

The event is a signal the DOM cannot know about — application state,
async behavior, or a JS action that has no reliable click target.

- `copy_install_command` — fires from the copy-to-clipboard handler
  inside the install-block component. GTM cannot detect the copy action.
- `cloud_early_access_submit` — fires from the form's `onSubmit`
  success branch, not on the submit button click (a click does not
  guarantee submission succeeded).
- `section_security_model_view` / `section_architecture_view` — fires
  from an IntersectionObserver watching the section, thresholded at
  ≥50% viewport visibility for ≥1 second. GTM's built-in scroll trigger
  is too coarse.

### 5.3 dataLayer event shape

Every code-emitted event follows this shape:

```js
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: "<event_name>",
  // event-specific parameters from Section 3
});
```

GTM must have a corresponding "Custom Event" trigger per event name,
paired with a GA4 Event tag that maps dataLayer parameters onto GA4
parameter names. Do not send a dataLayer event without a matching GTM
trigger — it will accumulate silently in the dataLayer with no effect.

### 5.4 What NOT to do

- Do NOT rely on GA4's automatic `outbound_click` for
  `github_core_repo_click` — automatic outbound-click classification
  is too coarse to distinguish org page vs core repo vs examples.
- Do NOT emit a dataLayer event AND a GTM DOM trigger for the same
  interaction — double-counted events are painful to detect in reports.
- Do NOT emit events from React `useEffect` cleanups; the event will
  fire on unmount and inflate counts.
- Do NOT include the click target's `innerText` as a parameter — it
  varies with locale and screen reader tools and is not stable.

### 5.5 Environment: staging vs production

- Non-production builds must set GTM's environment to "staging" and
  point at a **separate GA4 property**. If a separate property is not
  available yet, prefix every event name with `dev_` in the local dev
  build so it never contaminates prod reports.
- CI preview deployments count as non-production and must use the
  staging environment.

## 6. DebugView and Realtime validation checklist

Every event listed in Section 2 must be validated in GA4 DebugView
before it is treated as production-ready. Run this checklist once per
event during initial implementation and once again after any change
to that event's trigger or parameters.

### 6.1 Pre-flight

- [ ] The site is loaded from a browser that has the GA4 Debug
      extension enabled OR the URL has `?debug_mode=true` set, OR the
      site is running from staging with the debug flag on.
- [ ] GA4 DebugView is open in a second tab and connected to the
      correct property (staging or production).

### 6.2 For each event

- [ ] Perform the trigger action once.
- [ ] Confirm the event appears in DebugView within 5 seconds.
- [ ] Confirm every parameter listed in Section 3 for that event is
      present and has an expected value.
- [ ] Confirm `hostname` matches the surface you tested from.
- [ ] Confirm `surface` matches the surface (do not send
      `surface=product_site` from a docs page).
- [ ] Confirm no unexpected parameter is attached (especially no
      parameter with a value that varies per visitor).
- [ ] Repeat the trigger action; confirm two events appear, not one
      (guards against dedupe bugs).

### 6.3 Full-funnel walk-through

Run once end-to-end before pre-launch QA (HORO-50) inherits the checklist.

- [ ] Land on `agent-assembly.com/` → confirm `page_view` fires with
      `surface=product_site`.
- [ ] Click "Start self-hosting" hero CTA → confirm
      `cta_start_self_hosting_click` fires with `cta_location=hero`.
- [ ] Copy the install command → confirm `copy_install_command`
      fires with the correct `command_type`.
- [ ] Click "View on GitHub" → confirm `cta_view_github_click` AND
      `github_core_repo_click` both fire, and that they are distinct
      events (not one masquerading as the other).
- [ ] Click "Request Cloud Early Access" → confirm
      `cta_cloud_early_access_click` fires.
- [ ] On the early-access page, confirm `cloud_early_access_page_view`.
- [ ] Submit the form → confirm `cloud_early_access_submit` with the
      three parameters (`role`, `team_size`, `deployment`) and NO
      email / name / company fields.
- [ ] On thank-you, click "See OSS docs" → confirm
      `cloud_early_access_oss_docs_click`.
- [ ] Cross-hostname to docs; page-view should fire with
      `surface=docs`.
- [ ] Copy an install command in docs → confirm
      `docs_copy_install_command` (docs) fires, and that the
      `command_type` parameter is correctly detected.
- [ ] Click through to `agent-assembly-examples` → confirm
      `examples_repo_click`.
- [ ] Cross-hostname to `horonomy.dev`; page-view should fire with
      `surface=horonomy_site`.
- [ ] Click "Explore Agent Assembly" → confirm
      `horonomy_product_agent_assembly_click`.

### 6.4 Realtime cross-check

DebugView shows only events flagged as debug. To confirm production
tag firing, use GA4 Realtime with a non-debug browser: perform the
same walk-through, confirm events appear in the Realtime → Events
card within 30 seconds.

## 7. Instrumenting a new CTA — worked example

Scenario: HORO-42 adds a new "Compare with LangChain" CTA in the body
of the Agent Assembly landing page. The button links out to a docs
comparison page.

**Step 1 — Decide the event name.**

The action is a click on a CTA that leaves for docs. There is no
existing event for a "compare-with-competitor" action.

- If this CTA will exist on more than one page, name it after the
  action (`cta_compare_langchain_click`).
- If this CTA is a one-off body element, and the audience segmentation
  it enables is small, do NOT invent a new event — fall back to
  `outbound_click` with a `link_url` parameter.

For this example, assume it will appear in more than one place. New
event: `cta_compare_langchain_click`. Add it to Section 2.2 and get
review sign-off before writing tag config.

**Step 2 — Decide GTM vs code.**

The trigger is a click on a specific DOM element with a stable class
name (`.cta-compare-langchain`). No JS state is required. → Use a
GTM trigger, not a dataLayer event (Section 5.1).

**Step 3 — Draft the parameters.**

- Section 3.1 required: `hostname`, `page_path`, `page_title`, `surface`.
- Section 3.2 CTA-bound: `cta_location=body`, `link_url=<the link>`,
  `link_domain=docs.agent-assembly.com`, `target_product=docs`.
- No install-specific or SDK-specific parameters.

**Step 4 — Add to the plan.**

- Update this doc's Section 2.2 with the new event and its trigger.
- Update HORO-40 (IA/messaging plan) Section 5.2 with the page-to-event
  binding — the CTA is on the product-site landing page.
- If the click is a Key Event candidate, propose it in Section 4 with
  an explicit rationale; otherwise leave it as a regular event.

**Step 5 — Configure GTM.**

- Trigger: Click — Just Links, condition `Click Classes matches CSS selector .cta-compare-langchain`.
- Tag: GA4 Event, event name `cta_compare_langchain_click`, parameters
  mapped from GTM built-in variables (`{{Page Hostname}}`,
  `{{Page Path}}`, `{{Page Title}}`, and constants for `surface` and
  `target_product`).

**Step 6 — Validate.**

Run the Section 6.2 checklist for this event. Do NOT mark it as a Key
Event before the walk-through succeeds twice on different days.

**Step 7 — Update reports.**

HORO-46 owns the reports. Notify that owner (or update the dashboard
in the same PR chain) so the new event surfaces in the funnel views.

## 8. Cross-surface segmentation guide

The three surfaces are on three different hostnames but they need to
be reportable both individually and as a single funnel. The event
schema in Sections 2 and 3 makes this possible if implementers follow
the rules below.

### 8.1 Reporting individual surfaces

- Filter GA4 explorations on `hostname = <hostname>`. This is the
  primary way HORO-46 will split reports.
- Cross-check with `surface`. If `hostname=agent-assembly.com` but
  `surface=docs`, something is misconfigured — surface should have
  been set to `product_site`.

### 8.2 Reporting the full funnel

- Use `surface` as the primary breakdown when a report needs to show
  "docs vs product vs Horonomy" without the noise of subdomains.
- Use `page_path` for within-surface funnels (e.g. product-site
  landing → early-access page → thank-you).

### 8.3 Landing-page attribution

- The first event of a session is always a `page_view` on some
  hostname. Use `landing_page` (a GA4 automatic dimension) plus
  `hostname` to distinguish "arrived on Horonomy" from "arrived on
  Agent Assembly".
- Do NOT overwrite session source with UTM on same-hostname internal
  navigation (see HORO-47 Section 5.2).

### 8.4 Cross-hostname UTM

UTM is a URL-level concern. Section 3 does not include UTM parameters
as event parameters because GA4 already exposes `session_source`,
`session_medium`, `session_campaign`, and `session_content` as
session-scoped dimensions.

Implementers should NOT re-emit UTM values as event parameters —
that duplicates data and creates two rows that must be kept in sync.
The correct pattern is:

- URL carries UTM (per HORO-47).
- GA4 automatically captures UTM at session start.
- Events carry only the parameters in Section 3.

### 8.5 Common cross-surface reporting questions

- "Of visitors who landed on Horonomy, what % clicked through to the
  product site?"
  Filter: `landing_page` contains `horonomy.dev`; conversion:
  `horonomy_product_agent_assembly_click`.
- "Of visitors on docs, what % copied an install command?"
  Filter: `hostname = docs.agent-assembly.com`; conversion:
  `docs_copy_install_command`.
- "Of visitors who submitted the early-access form, what surface did
  they land on?"
  Filter: converters = users with `cloud_early_access_submit`;
  breakdown: `landing_page` and `hostname`.

HORO-46 turns these questions into concrete explorations.

## 9. Security and privacy check

The taxonomy was reviewed against the following criteria. Every future
change to this doc must pass the same review before merging.

### 9.1 No PII in any parameter

Section 3 has been audited. No parameter listed contains an email
address, user identifier, session token, IP address, order number,
name, or handle. The `cloud_early_access_submit` event's `role`,
`team_size`, and `deployment` are closed vocabularies with 3–5 values
each and cannot identify an individual.

### 9.2 No PII in event names

Every event name in Section 2 is a description of an action, not of a
person. There is no `contact_user_<id>_click` or similar pattern.

### 9.3 Consent posture

- Events must only fire after GA4's consent mode is initialised with
  the visitor's choice. If the visitor has denied analytics consent,
  no event beyond GA4's automatic anonymised traffic ping should reach
  the property.
- The consent-mode integration itself is out of scope for this Epic
  (tracked separately), but the taxonomy must not assume events fire
  regardless of consent state.

### 9.4 Third-party sharing

- GTM tags for the events in Section 2 send data ONLY to GA4. Any
  proposal to add a third-party marketing tag (Meta Pixel, LinkedIn
  Insight Tag, etc.) is a separate change with its own privacy review.
- GA4 is configured with IP anonymisation enabled by default; this
  configuration is out of scope for this taxonomy but the taxonomy
  assumes it.

### 9.5 Attack surface of parameter values

- Because event parameters are user-visible in DebugView and can leak
  through screenshot sharing, no parameter carries anything that would
  be sensitive if disclosed (no session tokens, no early-access
  submission IDs, no CSRF tokens).
- Event names themselves are semi-public — they appear in the built
  JS bundle. No secret information should be inferable from an event
  name (no `vip_customer_click`, etc.).

### 9.6 What implementers must NOT add

- Do not add `email` as a parameter to any event, even if the form has
  the email in scope at the time of firing.
- Do not add a "user id" or any hash of user identity as a parameter.
- Do not add free-text search terms without sanitising for PII.
- Do not send the value of any form field as an event parameter — the
  closed vocabularies in Section 3.5 are the only exception.

### 9.7 Sign-off gate

This section is reviewed at Wave 3 pre-launch QA (HORO-50). Any event
added between now and launch must also pass Section 9.1–9.6 before it
is enabled in production.
