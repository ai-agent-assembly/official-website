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

_TBD — see following commits._

## 3. Event parameter dictionary

_TBD — see following commits._

## 4. GA4 Key Events (conversions)

_TBD — see following commits._

## 5. Implementation notes — GTM vs code-emitted dataLayer

_TBD — see following commits._

## 6. DebugView and Realtime validation checklist

_TBD — see following commits._

## 7. Instrumenting a new CTA — worked example

_TBD — see following commits._

## 8. Cross-surface segmentation guide

_TBD — see following commits._

## 9. Security and privacy check

_TBD — see following commits._
