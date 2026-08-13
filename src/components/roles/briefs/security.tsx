import React from 'react';
import Translate, {translate} from '@docusaurus/Translate';
import type {RoleBrief} from '../types';
import {
  RC1,
  RC2,
  RC3,
  RC4,
  RC6,
  RC7,
  RC9,
  RC11,
  RC12,
  RC14,
  RC16,
} from './register';
import {
  SECURITY_MODEL,
  RISK_SCENARIOS,
  PRODUCT_PROMISE,
  COMPATIBILITY,
  CAPABILITY_MANIFEST,
  CLAIM_VOCABULARY,
  REPO_LIMITATIONS,
} from './shared';

/*
 * AAASM-5587 — Brief 1, Security / Risk. `audience: security-engineer`.
 *
 * Every capability sentence below is a register entry from `role-narratives.md`
 * in the register's own wording, with the register's own Bound beside it. The
 * cross-brief consistency table there records which entries this brief cites —
 * RC1, RC2, RC3, RC4, RC6, RC7, RC9, RC11, RC14, RC15, RC16, and RC12 stated as
 * absent — and this file cites those and no others.
 *
 * Two things a later editor will want to do and must not:
 *
 *   - Tighten a bound. The bounds read long because they are the claim. RC1's
 *     "the destination lists are empty by default" is the difference between a
 *     control an evaluator can rely on out of the box and one they have to
 *     build, and a bound trimmed for rhythm is a broader claim.
 *   - Promote RC9 into the Intervention section. It is the only path that
 *     reaches ADR 0030's `HostEnforced` rung, and it is recorded as unearned at
 *     the published tag — so it belongs in Limitations, where it says what the
 *     bypass-resistance claim is worth, and nowhere else on this page.
 */
export const securityBrief: RoleBrief = {
  slug: 'security',
  audience: 'security-engineer',
  name: <Translate id="roles.security.name">Security and risk</Translate>,
  metaTitle: translate({
    id: 'roles.security.meta.title',
    message: 'Security and risk — Agent Assembly',
  }),
  job: (
    <Translate id="roles.security.job">
      Decide whether this changes the risk position for agents already running,
      and what it does not cover.
    </Translate>
  ),

  pain: [
    {
      key: 'a',
      text: (
        <Translate id="roles.security.pain.a">
          An AI agent in your estate can already reach the network, the
          filesystem and a shell. The controls you own were built for humans and
          for services: identity, review, change management, and logs you read
          afterwards. None of them sits between the agent’s decision and the
          agent’s action.
        </Translate>
      ),
    },
    {
      key: 'b',
      text: (
        <Translate id="roles.security.pain.b">
          Your detection story is entirely retrospective, and your compensating
          control is that nobody has given the agents anything important yet —
          which stops being true the week a team ships an agent with a
          production credential.
        </Translate>
      ),
    },
  ],

  trigger: (
    <Translate id="roles.security.trigger">
      A team asks to run a coding agent against a repository that has deploy
      keys in it. You are asked to sign off, and the honest answer is that you
      have no mechanism to say what it may reach — only a mechanism to find out
      later.
    </Translate>
  ),

  interventionLead: (
    <Translate id="roles.security.intervention.lead">
      Agent Assembly is a decision point placed in front of an agent’s actions,
      on the paths you route through it, plus the record of what it decided. For
      a security review, six entries carry the weight.
    </Translate>
  ),

  claims: [RC1, RC2, RC4, RC3, RC11, RC6],

  outcome: [
    {
      key: 'a',
      text: (
        <Translate id="roles.security.outcome.a">
          For an agent you routed, a request to a destination outside the list
          you configured is refused before a connection is opened.
        </Translate>
      ),
    },
    {
      key: 'b',
      text: (
        <Translate id="roles.security.outcome.b">
          The security position that changes is ordering — the decision precedes
          the effect — not coverage, and not the completeness of the record:
          whether a given refusal’s entry durably reaches the audit chain is
          RC6, which is Unmeasured. Buy the ordering; do not buy a ledger.
        </Translate>
      ),
    },
  ],

  proof: [
    {
      key: 'bypasses',
      text: (
        <Translate id="roles.security.proof.bypasses">
          The bypasses are enumerated and published rather than argued away —
          both as a limitations page and as the known-bypasses field of every
          row in the capability manifest.
        </Translate>
      ),
      label: (
        <Translate id="roles.security.proof.bypasses.link">
          The enumerated bypasses →
        </Translate>
      ),
      href: REPO_LIMITATIONS,
      targetProduct: 'github',
      external: true,
    },
    {
      key: 'manifest',
      text: (
        <Translate id="roles.security.proof.manifest">
          The 80-row evidence base every sentence on this page resolves against,
          carrying each row’s coverage term, decision timing, default state,
          failure posture and evidence.
        </Translate>
      ),
      label: (
        <Translate id="roles.security.proof.manifest.link">
          The capability manifest →
        </Translate>
      ),
      href: CAPABILITY_MANIFEST,
      targetProduct: 'github',
      external: true,
    },
    {
      key: 'model',
      text: (
        <Translate id="roles.security.proof.model">
          The threat model, the trust boundaries and the audit properties — what
          chain verification does and does not establish.
        </Translate>
      ),
      label: (
        <Translate id="roles.security.proof.model.link">
          The security model →
        </Translate>
      ),
      href: SECURITY_MODEL,
      targetProduct: 'docs',
      external: true,
    },
    {
      key: 'scenarios',
      text: (
        <Translate id="roles.security.proof.scenarios">
          Per-scenario decision, decider and boundary, each with the manifest
          rows it rests on.
        </Translate>
      ),
      label: (
        <Translate id="roles.security.proof.scenarios.link">
          Risk scenarios →
        </Translate>
      ),
      href: RISK_SCENARIOS,
      targetProduct: 'docs',
      external: true,
    },
    {
      key: 'posture',
      text: (
        <Translate id="roles.security.proof.posture">
          What is on by default, row by row — the Level 3 table on the product
          promise. A capability that exists but is off is a different product
          from one that is on.
        </Translate>
      ),
      label: (
        <Translate id="roles.security.proof.posture.link">
          What is on by default →
        </Translate>
      ),
      href: PRODUCT_PROMISE,
      targetProduct: 'docs',
      external: true,
    },
    {
      key: 'vocabulary',
      text: (
        <Translate id="roles.security.proof.vocabulary">
          The claim discipline itself, including the wording this product
          refuses to publish and why no approval makes an unsupported absolute
          true.
        </Translate>
      ),
      label: (
        <Translate id="roles.security.proof.vocabulary.link">
          The claim vocabulary →
        </Translate>
      ),
      href: CLAIM_VOCABULARY,
      targetProduct: 'github',
      external: true,
    },
  ],

  limitations: [
    {
      key: 'bypass',
      title: (
        <Translate id="roles.security.limit.bypass.title">
          Bypass resistance has exactly one rung and one row.
        </Translate>
      ),
      text: (
        <Translate id="roles.security.limit.bypass.text">
          Treat every other state — including GatewayProtected — as saying
          nothing about bypass resistance.
        </Translate>
      ),
      entry: RC9,
    },
    {
      key: 'empty',
      title: (
        <Translate id="roles.security.limit.empty.title">
          The destination lists are empty by default.
        </Translate>
      ),
      text: (
        <Translate id="roles.security.limit.empty.text">
          Out of the box RC1 refuses nothing. The always-on one is RC2, and it
          ranges over address space rather than over destinations you name.
        </Translate>
      ),
    },
    {
      key: 'routing',
      title: (
        <Translate id="roles.security.limit.routing.title">
          Routing is per agent and per launch.
        </Translate>
      ),
      text: (
        <Translate id="roles.security.limit.routing.text">
          An agent started outside the managed launch is outside the boundary,
          and that is not detectable from the inside (RC15).
        </Translate>
      ),
    },
    {
      key: 'host',
      title: (
        <Translate id="roles.security.limit.host.title">
          The largest gap is host actions.
        </Translate>
      ),
      text: (
        <Translate id="roles.security.limit.host.text">
          A shell command or subprocess spawned by a native agent process has no
          interception mechanism at all in a released build; browser automation
          and database queries likewise. The policy language can express these
          rules; nothing released can act on them.
        </Translate>
      ),
    },
    {
      key: 'uninspected',
      title: (
        <Translate id="roles.security.limit.uninspected.title">
          Uninspected is not clean.
        </Translate>
      ),
      entry: RC7,
    },
    {
      key: 'evidence',
      title: (
        <Translate id="roles.security.limit.evidence.title">
          The evidence is tamper-evident, not immutable, and it can be lost.
        </Translate>
      ),
      text: (
        <Translate id="roles.security.limit.evidence.text">
          A dropped entry is indistinguishable from a deleted one, and no
          manifest row establishes that a decision’s record durably arrives at
          all — the term is Unmeasured (RC6). Do not present the audit chain as
          the control that satisfies a retention or non-repudiation requirement.
        </Translate>
      ),
    },
    {
      key: 'agentplane',
      title: (
        <Translate id="roles.security.limit.agentplane.title">
          The agent plane accepts unauthenticated callers.
        </Translate>
      ),
      text: (
        <Translate id="roles.security.limit.agentplane.text">
          A deliberate bootstrap path with a bounded exposure, and still not an
          authenticated plane.
        </Translate>
      ),
      entry: RC16,
    },
    {
      key: 'approval',
      title: (
        <Translate id="roles.security.limit.approval.title">
          Approval required is not a capability you can buy today.
        </Translate>
      ),
      entry: RC12,
    },
    {
      key: 'platform',
      title: (
        <Translate id="roles.security.limit.platform.title">
          Windows has no local mediation.
        </Translate>
      ),
      entry: RC14,
    },
  ],

  next: [
    {
      text: (
        <Translate id="roles.security.next.read">
          Read the security model — the threat model, the trust boundaries, and
          what the audit chain does and does not establish.
        </Translate>
      ),
      label: (
        <Translate id="roles.security.next.read.link">
          The security model →
        </Translate>
      ),
      href: SECURITY_MODEL,
      targetProduct: 'docs',
      external: true,
    },
    {
      text: (
        <Translate id="roles.security.next.do">
          Then check your own platform and channel position before scoping a
          trial — the answer differs by operating system and by how you
          installed, and it decides which of the above you can actually run.
        </Translate>
      ),
      label: (
        <Translate id="roles.security.next.do.link">
          The compatibility matrix →
        </Translate>
      ),
      href: COMPATIBILITY,
      targetProduct: 'docs',
      external: true,
    },
  ],
};
