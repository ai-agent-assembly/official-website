import React from 'react';
import Translate, {translate} from '@docusaurus/Translate';
import type {RoleBrief} from '../types';
import {RC1, RC3, RC4, RC6, RC12, RC13} from './register';
import {
  RISK_SCENARIOS,
  PRODUCT_PROMISE,
  COMPATIBILITY,
  CAPABILITY_MANIFEST,
} from './shared';

/*
 * AAASM-5587 — Brief 4, Product / QA / Assurance. `audience: auditor`.
 *
 * Cites RC1, RC3, RC4, RC6, RC8, RC9, RC12 (as absent), RC13 and RC14.
 *
 * The hard line on this page is the Tier 1 / Tier 2 gate. `risk-scenarios.md`
 * holds prevented-outcome wording behind AAASM-5532 and AAASM-5529, and neither
 * has closed — so nothing here describes an averted consequence. Every outcome
 * sentence describes a DECISION. "The call was refused" is publishable; "the
 * table was not dropped" is not, and the difference is not pedantry: designing
 * a negative control is not the same as having run one.
 *
 * RC6 appears in this brief as a bound rather than as a tool, which is the
 * register's own framing — it is what stops the audit log from being the thing
 * a test asserts against.
 */
export const productQaBrief: RoleBrief = {
  slug: 'product-qa',
  audience: 'auditor',
  name: (
    <Translate id="roles.productqa.name">Product, QA and assurance</Translate>
  ),
  metaTitle: translate({
    id: 'roles.productqa.meta.title',
    message: 'Product, QA and assurance — Agent Assembly',
  }),
  job: (
    <Translate id="roles.productqa.job">
      Decide what can be tested, what can be signed off, and what has to be
      written down as a known limit.
    </Translate>
  ),

  pain: [
    {
      key: 'a',
      text: (
        <Translate id="roles.productqa.pain.a">
          You are asked to give release confidence on a system whose behaviour
          is non-deterministic, whose failure mode is a side effect rather than
          a wrong answer, and whose test oracle — did the bad thing not happen —
          is an absence.
        </Translate>
      ),
    },
    {
      key: 'b',
      text: (
        <Translate id="roles.productqa.pain.b">
          Conventional assertions confirm that an error was raised, which is not
          the same fact.
        </Translate>
      ),
    },
  ],

  trigger: (
    <Translate id="roles.productqa.trigger">
      An agent-backed feature enters your release, and the acceptance criteria
      say “must not be able to” for the first time.
    </Translate>
  ),

  interventionLead: (
    <Translate id="roles.productqa.intervention.lead">
      The product turns “must not be able to” into a decision, on the paths you
      route. Four scenarios carry approved wording for reuse — the flagship
      egress refusal, secret exfiltration, a destructive production action and
      runaway cost — each with its decider, its default state and its boundary
      named. The entries behind them are below.
    </Translate>
  ),

  claims: [RC1, RC3, RC4, RC13, RC6],

  outcome: [
    {
      key: 'a',
      text: (
        <Translate id="roles.productqa.outcome.a">
          A refusal becomes an observable decision, so a test can assert on the
          decision.
        </Translate>
      ),
    },
    {
      key: 'b',
      text: (
        <Translate id="roles.productqa.outcome.b">
          Assert against the decision and against an independent observer, not
          against the audit log. RC6 is Unmeasured, so a missing entry does not
          distinguish “the decision was not made” from “the record was dropped”,
          and a test that reads the log inherits that ambiguity as a flaky pass.
          The negative control published with the risk scenarios is built on an
          independent listener for exactly this reason.
        </Translate>
      ),
    },
    {
      key: 'c',
      text: (
        <Translate id="roles.productqa.outcome.c">
          Assertions about the averted consequence are a separate and stricter
          thing again — see the Limitations below before you write one.
        </Translate>
      ),
    },
  ],

  proof: [
    {
      key: 'scenarios',
      text: (
        <Translate id="roles.productqa.proof.scenarios">
          The four scenarios, each with a determination and its manifest rows —
          and specifically the negative-control section, which specifies the
          absence check, the paired positive control that proves the check can
          see the effect, and the assertion ordering.
        </Translate>
      ),
      label: (
        <Translate id="roles.productqa.proof.scenarios.link">
          Risk scenarios and the negative control →
        </Translate>
      ),
      href: RISK_SCENARIOS,
      targetProduct: 'docs',
      external: true,
    },
    {
      key: 'evidence',
      text: (
        <Translate id="roles.productqa.proof.evidence">
          Per-row evidence: the evidence and runs-on-main fields, present on all
          80 rows. Read the row before quoting it — some are pinned by standing
          integration tests, some by unit tests only.
        </Translate>
      ),
      label: (
        <Translate id="roles.productqa.proof.evidence.link">
          The capability manifest →
        </Translate>
      ),
      href: CAPABILITY_MANIFEST,
      targetProduct: 'github',
      external: true,
    },
    {
      key: 'provisional',
      text: (
        <Translate id="roles.productqa.proof.provisional">
          What is deliberately not asserted yet — the Provisional table on the
          product promise is the list of claims held back, and it is the fastest
          way to see what an acceptance criterion cannot rest on.
        </Translate>
      ),
      label: (
        <Translate id="roles.productqa.proof.provisional.link">
          The Provisional table →
        </Translate>
      ),
      href: PRODUCT_PROMISE,
      targetProduct: 'docs',
      external: true,
    },
    {
      key: 'position',
      text: (
        <Translate id="roles.productqa.proof.position">
          Release and version position — a demo recorded on one platform is not
          evidence about a released artifact on another.
        </Translate>
      ),
      label: (
        <Translate id="roles.productqa.proof.position.link">
          The compatibility matrix →
        </Translate>
      ),
      href: COMPATIBILITY,
      targetProduct: 'docs',
      external: true,
    },
  ],

  limitations: [
    {
      key: 'approval',
      title: (
        <Translate id="roles.productqa.limit.approval.title">
          Approval is the gap, not a feature.
        </Translate>
      ),
      text: (
        <Translate id="roles.productqa.limit.approval.text">
          An acceptance criterion written against a human approval step cannot
          pass today.
        </Translate>
      ),
      entry: RC12,
    },
    {
      key: 'prevented',
      title: (
        <Translate id="roles.productqa.limit.prevented.title">
          A prevented-outcome claim is gated.
        </Translate>
      ),
      text: (
        <Translate id="roles.productqa.limit.prevented.text">
          Designing a negative control is not the same as having run one. Until
          AAASM-5532 and AAASM-5529 close, describe the decision, not the
          averted consequence.
        </Translate>
      ),
    },
    {
      key: 'absence',
      title: (
        <Translate id="roles.productqa.limit.absence.title">
          An error is not an absence.
        </Translate>
      ),
      text: (
        <Translate id="roles.productqa.limit.absence.text">
          An agent can receive a refusal and still have reached the endpoint by
          another route. A test that asserts on the error and not on the
          independent observer is measuring the wrong thing.
        </Translate>
      ),
    },
    {
      key: 'quality',
      title: (
        <Translate id="roles.productqa.limit.quality.title">
          Evidence quality is not uniform.
        </Translate>
      ),
      text: (
        <Translate id="roles.productqa.limit.quality.text">
          Some rows are pinned by standing integration tests; some by unit tests
          only; some carry no evidence at all and are recorded as gaps. Two rows
          are explicitly marked unit-only. Read the row before quoting it.
        </Translate>
      ),
    },
    {
      key: 'emptylog',
      title: (
        <Translate id="roles.productqa.limit.emptylog.title">
          An empty audit log is evidence about the observer, not about the
          agent.
        </Translate>
      ),
      text: (
        <Translate id="roles.productqa.limit.emptylog.text">
          And a passing chain verification does not mean the log is whole (RC6).
        </Translate>
      ),
    },
    {
      key: 'norow',
      title: (
        <Translate id="roles.productqa.limit.norow.title">
          Two of the sixteen register entries rest on no capability row at all.
        </Translate>
      ),
      text: (
        <Translate id="roles.productqa.limit.norow.text">
          RC6 and RC13 are Unmeasured because the manifest’s only rows for the
          evidence pipeline and for budget are the rows for those subsystems
          failing. An acceptance criterion written against “the decision is in
          the audit log” or “the cap was applied” is currently asserting
          something the evidence base does not carry. Tracked as AAASM-5531.
        </Translate>
      ),
    },
    {
      key: 'budget',
      title: (
        <Translate id="roles.productqa.limit.budget.title">
          A budget cap exists only where a policy declares one.
        </Translate>
      ),
      text: (
        <Translate id="roles.productqa.limit.budget.text">
          An undeclared budget is uncapped, and a corrupt budget store resets
          the cap silently (RC13).
        </Translate>
      ),
    },
    {
      key: 'figures',
      title: (
        <Translate id="roles.productqa.limit.figures.title">
          Coverage figures are not available.
        </Translate>
      ),
      text: (
        <Translate id="roles.productqa.limit.figures.text">
          No percentage, count of governed actions or fleet-level number may be
          derived — including from the four scenarios. Self-reported layer
          availability is not evidence of coverage.
        </Translate>
      ),
    },
    {
      key: 'falsesignals',
      title: (
        <Translate id="roles.productqa.limit.falsesignals.title">
          Three signals look like coverage and are not.
        </Translate>
      ),
      text: (
        <Translate id="roles.productqa.limit.falsesignals.text">
          An environment variable that replaces the probe result outright, a
          proxy probe satisfied by a binary existing on the path, and an SDK
          layer flag asserted unconditionally. Do not build a check on any of
          them.
        </Translate>
      ),
    },
    {
      key: 'platform',
      title: (
        <Translate id="roles.productqa.limit.platform.title">
          Platform and channel change the answer.
        </Translate>
      ),
      text: (
        <Translate id="roles.productqa.limit.platform.text">
          A demo recorded on macOS is not evidence about a released Linux
          artifact (RC8, RC9, RC14).
        </Translate>
      ),
    },
  ],

  next: [
    {
      text: (
        <Translate id="roles.productqa.next.read">
          Read the risk scenarios and their negative-control section — it
          specifies the absence check, the paired positive control, and the
          order the assertions have to run in.
        </Translate>
      ),
      label: (
        <Translate id="roles.productqa.next.read.link">
          Risk scenarios →
        </Translate>
      ),
      href: RISK_SCENARIOS,
      targetProduct: 'docs',
      external: true,
    },
    {
      text: (
        <Translate id="roles.productqa.next.do">
          Then check the Provisional table before writing an acceptance
          criterion — it is the list of claims that are not yet assertable, and
          writing against one is the cheapest mistake to avoid here.
        </Translate>
      ),
      label: (
        <Translate id="roles.productqa.next.do.link">
          The Provisional table →
        </Translate>
      ),
      href: PRODUCT_PROMISE,
      targetProduct: 'docs',
      external: true,
    },
  ],
};
