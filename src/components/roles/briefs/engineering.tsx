import React from 'react';
import Translate, {translate} from '@docusaurus/Translate';
import type {RoleBrief} from '../types';
import {RC1, RC3, RC4, RC5, RC15} from './register';
import {
  POLICY_REFERENCE,
  DOCUMENTATION,
  CAPABILITY_MANIFEST,
  ADR_0033,
} from './shared';

/*
 * AAASM-5587 — Brief 3, Engineering. `audience: developer`.
 *
 * Cites RC1, RC3, RC4, RC5, RC12 (as absent) and RC15. Note what is NOT here:
 * this brief is silent on RC6, RC8, RC9 and RC16, and silence is permitted —
 * an engineer does not need the tenant-isolation posture to plan an
 * integration, and omitting it is correct. Silence is not disagreement. What a
 * brief may not do is restate an entry at a different strength.
 *
 * The reason RC5 and RC15 are presented as a contrast rather than a list is
 * that the brief's own intervention field makes the contrast the point: the
 * first is in your code and is advisory, the second is out of your process and
 * is where refusal actually holds. Rendering them as two peers of equal
 * authority would lose the only thing an integrator needs to take away.
 */
export const engineeringBrief: RoleBrief = {
  slug: 'engineering',
  audience: 'developer',
  name: <Translate id="roles.engineering.name">Engineering</Translate>,
  metaTitle: translate({
    id: 'roles.engineering.meta.title',
    message: 'Engineering — Agent Assembly',
  }),
  job: (
    <Translate id="roles.engineering.job">
      Decide what adopting this costs me in my codebase, and which of my actions
      it actually reaches.
    </Translate>
  ),

  pain: [
    <Translate key="a" id="roles.engineering.pain.a">
      You are shipping an agent, and the governance conversation arrives as a
      blocker rather than as a library.
    </Translate>,
    <Translate key="b" id="roles.engineering.pain.b">
      What you want to know is small and specific: what do I add, what does it
      wrap, what does it do when the policy says no, and what does it miss. What
      you usually get is an architecture diagram.
    </Translate>,
  ],

  trigger: (
    <Translate id="roles.engineering.trigger">
      Security asks for evidence of what your agent may do before it will be
      approved for a production credential, and there is nothing in the codebase
      to point at.
    </Translate>
  ),

  interventionLead: (
    <Translate id="roles.engineering.intervention.lead">
      Two integration shapes, and they are not equivalent. The SDK wraps your
      framework’s tool seam and checks a call before the tool body runs. The
      managed launch puts the process’s outbound traffic in front of the proxy,
      which is where the destination, credential and MCP entries apply. The
      first is in your code and is advisory; the second is out of your process
      and is where refusal actually holds.
    </Translate>
  ),

  claims: [RC5, RC15, RC1, RC3, RC4],

  outcome: [
    <Translate key="a" id="roles.engineering.outcome.a">
      A wrapped tool call is checked before its body runs and, on the paths that
      fail closed, raises rather than executing.
    </Translate>,
    <Translate key="b" id="roles.engineering.outcome.b">
      The decision is recorded against your agent’s identity, so the evidence
      question has an answer that is not a log grep.
    </Translate>,
  ],

  proof: [
    {
      key: 'adapters',
      text: (
        <Translate id="roles.engineering.proof.adapters">
          Per-framework adapter status, per language, is the framework and
          coverage fields of the SDK rows in the capability manifest — read the
          row for your framework before you plan around it.
        </Translate>
      ),
      label: (
        <Translate id="roles.engineering.proof.adapters.link">
          The capability manifest →
        </Translate>
      ),
      href: CAPABILITY_MANIFEST,
      targetProduct: 'github',
      external: true,
    },
    {
      key: 'policy',
      text: (
        <Translate id="roles.engineering.proof.policy">
          Policy syntax and what it can express. Policy is versioned YAML or
          JSON you review through the Git workflow you already use, so a rule
          described on this site is a rule you can look up.
        </Translate>
      ),
      label: (
        <Translate id="roles.engineering.proof.policy.link">
          The policy reference →
        </Translate>
      ),
      href: POLICY_REFERENCE,
      targetProduct: 'docs',
      external: true,
    },
    {
      key: 'sdks',
      text: (
        <Translate id="roles.engineering.proof.sdks">
          SDK-level detail per language — the Python, Node and Go documentation,
          including which modes produce a refusal and which do not.
        </Translate>
      ),
      label: (
        <Translate id="roles.engineering.proof.sdks.link">
          SDK documentation →
        </Translate>
      ),
      href: DOCUMENTATION,
      targetProduct: 'docs',
      external: true,
    },
    {
      key: 'adr',
      text: (
        <Translate id="roles.engineering.proof.adr">
          Where the SDK sits in the trust model, and why it is advisory rather
          than authoritative — stated in the architecture decision record, not
          inferred from a diagram.
        </Translate>
      ),
      label: (
        <Translate id="roles.engineering.proof.adr.link">ADR 0033 →</Translate>
      ),
      href: ADR_0033,
      targetProduct: 'github',
      external: true,
    },
  ],

  limitations: [
    {
      key: 'advisory',
      title: (
        <Translate id="roles.engineering.limit.advisory.title">
          The SDK is advisory by design.
        </Translate>
      ),
      text: (
        <Translate id="roles.engineering.limit.advisory.text">
          It is a defence-in-depth posture, not the authoritative gate (RC5).
          Refusal that holds against an uncooperative process is the proxy’s,
          out of your process.
        </Translate>
      ),
    },
    {
      key: 'node',
      title: (
        <Translate id="roles.engineering.limit.node.title">
          Node’s default mode produces no refusal.
        </Translate>
      ),
      text: (
        <Translate id="roles.engineering.limit.node.text">
          The check is routed through an allow-all no-op client unless a
          check-capable mode is selected. Asking for enforcement without one is
          refused at init rather than silently allowed, and an auto-detected
          framework warns rather than throwing — deliberately, to preserve
          zero-config. This is the single most important sentence on any Node
          integration page. Tracked as AAASM-4991.
        </Translate>
      ),
    },
    {
      key: 'uneven',
      title: (
        <Translate id="roles.engineering.limit.uneven.title">
          Wrapping is not uniform across frameworks, and the difference is the
          deny signal.
        </Translate>
      ),
      text: (
        <Translate id="roles.engineering.limit.uneven.text">
          Some Python adapters raise before the body; others return a sentinel
          string, so a caller that catches only the policy exception treats a
          refused call as a success whose result is a string. The LangGraph and
          Mastra node hooks and the LangChain callback handler cannot refuse by
          construction — they observe. The explicit LangChain wrapper can, and
          it is off by default.
        </Translate>
      ),
    },
    {
      key: 'go',
      title: (
        <Translate id="roles.engineering.limit.go.title">
          Go requires an explicit call.
        </Translate>
      ),
      text: (
        <Translate id="roles.engineering.limit.go.text">
          The default build without the FFI tag and CGO denies every wrapped
          call rather than allowing them, which is fail-closed but is also not
          the advertised behaviour.
        </Translate>
      ),
    },
    {
      key: 'unadapted',
      title: (
        <Translate id="roles.engineering.limit.unadapted.title">
          A framework with no adapter is not covered.
        </Translate>
      ),
      text: (
        <Translate id="roles.engineering.limit.unadapted.text">
          Neither is a direct call that does not pass a patched seam. The
          wrapper reaches what it wraps and nothing else.
        </Translate>
      ),
    },
    {
      key: 'outside',
      title: (
        <Translate id="roles.engineering.limit.outside.title">
          Anything the SDK does not wrap is outside it.
        </Translate>
      ),
      text: (
        <Translate id="roles.engineering.limit.outside.text">
          Raw HTTP, subprocess, filesystem, a database driver, browser
          automation from inside your process. That class is the reason the
          proxy exists, and on host actions there is no released mechanism at
          all.
        </Translate>
      ),
    },
    {
      key: 'stdio',
      title: (
        <Translate id="roles.engineering.limit.stdio.title">
          MCP over stdio is not on the mediated path.
        </Translate>
      ),
      text: (
        <Translate id="roles.engineering.limit.stdio.text">
          And it is the most common way tool servers are run (RC4).
        </Translate>
      ),
    },
    {
      key: 'routing',
      title: (
        <Translate id="roles.engineering.limit.routing.title">
          Routing has prerequisites in the environment, not in your source.
        </Translate>
      ),
      text: (
        <Translate id="roles.engineering.limit.routing.text">
          The tool must be launched so the proxy variable is set and the CA is
          trusted. Codex and Windsurf inject the first without the second
          (RC15), which is the configuration measured as failing the handshake
          silently.
        </Translate>
      ),
    },
    {
      key: 'approval',
      title: (
        <Translate id="roles.engineering.limit.approval.title">
          Approval required is not something you can integrate against.
        </Translate>
      ),
      text: (
        <Translate id="roles.engineering.limit.approval.text">
          No manifest row reaches that term. The hold exists in the gateway path
          and fails closed on timeout, but no shipped operator surface can
          answer it. Tracked as AAASM-5657 (RC12).
        </Translate>
      ),
    },
  ],

  next: [
    {
      text: (
        <Translate id="roles.engineering.next.read">
          Read the policy reference — what a rule can express is the boundary of
          what you can ask for, and it is shorter than most people expect.
        </Translate>
      ),
      label: (
        <Translate id="roles.engineering.next.read.link">
          The policy reference →
        </Translate>
      ),
      href: POLICY_REFERENCE,
      targetProduct: 'docs',
      external: true,
    },
    {
      text: (
        <Translate id="roles.engineering.next.do">
          Then pick your language’s SDK documentation and check your framework’s
          adapter row before you write against it — the deny signal differs by
          adapter, and Node’s default mode differs most.
        </Translate>
      ),
      label: (
        <Translate id="roles.engineering.next.do.link">
          SDK documentation →
        </Translate>
      ),
      href: DOCUMENTATION,
      targetProduct: 'docs',
      external: true,
    },
  ],
};
