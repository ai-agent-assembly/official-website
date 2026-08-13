import React from 'react';
import Translate, {translate} from '@docusaurus/Translate';
import type {RoleBrief} from '../types';
import {RC6, RC8, RC10, RC11, RC14, RC15} from './register';
import {
  DOCKER_CONTAINERS,
  SELF_HOST_OBSERVABILITY,
  COMPATIBILITY,
  SOURCE_OF_TRUTH,
  TROUBLESHOOTING,
  CAPABILITY_MANIFEST,
} from './shared';

/*
 * AAASM-5587 — Brief 2, Platform / SRE. `audience: operator`.
 *
 * The register entries this brief cites are RC6, RC8, RC9, RC10, RC11, RC14 and
 * RC15. Four of them are intervention claims; RC8, RC9 and RC14 appear only in
 * Limitations, which is where the hub page's cross-brief table puts them.
 *
 * This brief's Limitations section is the longest of the four, and that is not
 * an accident of drafting. The three silent failure modes and the distribution
 * position are the facts that decide whether a rollout plan is sound, and an
 * operator who learns them after the rollout learns them during an incident.
 * A limitations section thinner than its siblings is a signal that something
 * was dropped, not that the role has fewer limits.
 */
export const platformBrief: RoleBrief = {
  slug: 'platform',
  audience: 'operator',
  name: <Translate id="roles.platform.name">Platform and SRE</Translate>,
  metaTitle: translate({
    id: 'roles.platform.meta.title',
    message: 'Platform and SRE — Agent Assembly',
  }),
  job: (
    <Translate id="roles.platform.job">
      Decide what this puts on my on-call rotation, and what it does when it
      breaks.
    </Translate>
  ),

  pain: [
    {
      key: 'a',
      text: (
        <Translate id="roles.platform.pain.a">
          Agent workloads arrive without an operational contract. They are
          started by developers on laptops and by CI on runners, they talk to
          third-party endpoints you did not approve, and when something goes
          wrong the first question — what did it actually do — has no owner and
          no answer.
        </Translate>
      ),
    },
    {
      key: 'b',
      text: (
        <Translate id="roles.platform.pain.b">
          You are asked to make them safe without being given a place to stand.
        </Translate>
      ),
    },
  ],

  trigger: (
    <Translate id="roles.platform.trigger">
      An incident review asks which agent made a call, and the answer takes two
      days of log correlation across three systems and is still a guess.
    </Translate>
  ),

  interventionLead: (
    <Translate id="roles.platform.intervention.lead">
      A small number of processes you run and own: a control plane that answers
      policy questions and holds the record, a sidecar proxy on the wire, and a
      managed launch that puts a tool’s traffic in front of the proxy. Four
      entries decide what that costs you operationally.
    </Translate>
  ),

  claims: [RC11, RC10, RC6, RC15],

  outcome: [
    {
      key: 'a',
      text: (
        <Translate id="roles.platform.outcome.a">
          Agent egress becomes a thing with a configuration, a failure posture
          and an owner, rather than ambient process behaviour.
        </Translate>
      ),
    },
    {
      key: 'b',
      text: (
        <Translate id="roles.platform.outcome.b">
          When the control plane is configured and goes away, the paths that
          depend on it refuse rather than quietly widening. The inverse does not
          hold, and the Limitations below open with it.
        </Translate>
      ),
    },
  ],

  proof: [
    {
      key: 'docker',
      text: (
        <Translate id="roles.platform.proof.docker">
          Deployment shapes and the container story — what runs where, and what
          a limited-function self-hosted stack contains.
        </Translate>
      ),
      label: (
        <Translate id="roles.platform.proof.docker.link">
          Docker and containers →
        </Translate>
      ),
      href: DOCKER_CONTAINERS,
      targetProduct: 'docs',
      external: true,
    },
    {
      key: 'observability',
      text: (
        <Translate id="roles.platform.proof.observability">
          What the running system exposes, and what it does not — read this
          before you design an alert on it.
        </Translate>
      ),
      label: (
        <Translate id="roles.platform.proof.observability.link">
          Self-host observability →
        </Translate>
      ),
      href: SELF_HOST_OBSERVABILITY,
      targetProduct: 'docs',
      external: true,
    },
    {
      key: 'posture',
      text: (
        <Translate id="roles.platform.proof.posture">
          Per-row failure posture and default state — the two fields a summary
          drops first and an operator checks first — across all 80 rows.
        </Translate>
      ),
      label: (
        <Translate id="roles.platform.proof.posture.link">
          The capability manifest →
        </Translate>
      ),
      href: CAPABILITY_MANIFEST,
      targetProduct: 'github',
      external: true,
    },
    {
      key: 'position',
      text: (
        <Translate id="roles.platform.proof.position">
          Version and platform position per component, and which channel each
          artifact actually reaches.
        </Translate>
      ),
      label: (
        <Translate id="roles.platform.proof.position.link">
          Source of truth and status →
        </Translate>
      ),
      href: SOURCE_OF_TRUTH,
      targetProduct: 'docs',
      external: true,
    },
    {
      key: 'troubleshooting',
      text: (
        <Translate id="roles.platform.proof.troubleshooting">
          First-response material for the failures you will actually be paged
          for.
        </Translate>
      ),
      label: (
        <Translate id="roles.platform.proof.troubleshooting.link">
          Troubleshooting →
        </Translate>
      ),
      href: TROUBLESHOOTING,
      targetProduct: 'docs',
      external: true,
    },
  ],

  limitations: [
    {
      key: 'asymmetry',
      title: (
        <Translate id="roles.platform.limit.asymmetry.title">
          Fail-closed is not symmetric.
        </Translate>
      ),
      text: (
        <Translate id="roles.platform.limit.asymmetry.text">
          Configured-then-unreachable refuses; a runtime with no gateway
          configured falls through to a local evaluation whose terminal default
          is allow (RC11). The difference is a configuration mistake away.
        </Translate>
      ),
    },
    {
      key: 'silent',
      title: (
        <Translate id="roles.platform.limit.silent.title">
          Three failure modes are silent.
        </Translate>
      ),
      text: (
        <Translate id="roles.platform.limit.silent.text">
          An unreadable eBPF policy file falls back to an empty rule set and
          raises no degradation event; a corrupt budget store resets the cap to
          zero spend; a full audit channel drops the entry and the call still
          reports success. None of the three pages you.
        </Translate>
      ),
    },
    {
      key: 'degradation',
      title: (
        <Translate id="roles.platform.limit.degradation.title">
          Degradation is emitted and rendered nowhere.
        </Translate>
      ),
      text: (
        <Translate id="roles.platform.limit.degradation.text">
          The event type exists and the producers exist, and there is no
          consumer — the health endpoint’s degraded-layers field is a boot-time
          snapshot that never updates, and its status is a hardcoded literal
          (RC10). Tracked as AAASM-5535. Plan to consume the event stream
          yourself, or plan not to know.
        </Translate>
      ),
    },
    {
      key: 'distribution',
      title: (
        <Translate id="roles.platform.limit.distribution.title">
          The distribution position is not uniform, and it decides what you can
          install.
        </Translate>
      ),
      text: (
        <Translate id="roles.platform.limit.distribution.text">
          The proxy is a Linux release artifact; on macOS the only route is a
          cargo install. The eBPF loader daemon reaches crates.io only and is
          absent from the GitHub Release assets, the Homebrew tap and the
          install script — so an operator who installed through any of those has
          no host-level component and, on macOS, no proxy for the managed launch
          to start (RC8, RC9). Tracked as AAASM-5653.
        </Translate>
      ),
    },
    {
      key: 'probes',
      title: (
        <Translate id="roles.platform.limit.probes.title">
          Kernel probes report; they do not decide.
        </Translate>
      ),
      entry: RC8,
    },
    {
      key: 'environment',
      title: (
        <Translate id="roles.platform.limit.environment.title">
          The managed launch hands the child the entire parent environment.
        </Translate>
      ),
      text: (
        <Translate id="roles.platform.limit.environment.text">
          A shell or file tool inside the agent can read any credential you
          exported into the shell that started it.
        </Translate>
      ),
    },
    {
      key: 'listener',
      title: (
        <Translate id="roles.platform.limit.listener.title">
          The proxy refuses a non-loopback listener.
        </Translate>
      ),
      text: (
        <Translate id="roles.platform.limit.listener.text">
          It does so even with the remote-clients flag, because it has no
          listener TLS and no client authentication. Do not work around it.
        </Translate>
      ),
    },
    {
      key: 'llmonly',
      title: (
        <Translate id="roles.platform.limit.llmonly.title">
          Payload inspection is limited to model-provider hosts by default.
        </Translate>
      ),
      text: (
        <Translate id="roles.platform.limit.llmonly.text">
          Broader inspection is a configuration you make, and it carries a
          latency and compatibility cost (RC3).
        </Translate>
      ),
    },
    {
      key: 'platform',
      title: (
        <Translate id="roles.platform.limit.platform.title">
          Windows has no local mediation.
        </Translate>
      ),
      entry: RC14,
    },
  ],

  next: [
    {
      text: (
        <Translate id="roles.platform.next.read">
          Read self-host observability — what the running system exposes is the
          input to every alert and dashboard you would build on it.
        </Translate>
      ),
      label: (
        <Translate id="roles.platform.next.read.link">
          Self-host observability →
        </Translate>
      ),
      href: SELF_HOST_OBSERVABILITY,
      targetProduct: 'docs',
      external: true,
    },
    {
      text: (
        <Translate id="roles.platform.next.do">
          Then confirm your platform and channel before you plan a rollout — the
          distribution limitation above means the answer decides which
          components you can install at all.
        </Translate>
      ),
      label: (
        <Translate id="roles.platform.next.do.link">
          The compatibility matrix →
        </Translate>
      ),
      href: COMPATIBILITY,
      targetProduct: 'docs',
      external: true,
    },
  ],
};
