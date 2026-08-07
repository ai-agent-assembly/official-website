import React, {type ReactNode} from 'react';
import Translate, {translate} from '@docusaurus/Translate';
import {TrackedLink} from '@site/src/components/Tracked';
import {SectionInView} from './SectionInView';
import styles from './styles.module.css';
import {GovernedField} from './GovernedField';
import {DOCS_URL} from '@site/src/generated/site-urls';

/*
 * AAASM-5585 — the homepage narrative.
 *
 * Every capability sentence below is quoted from a merged, reviewed source
 * rather than written here. This page is near the bottom of ADR 0034's truth
 * hierarchy: it may simplify what those sources say, never broaden it.
 *
 *   - The hero headline and subheadline are product-promise.md's, verbatim and
 *     non-severable. The subheadline IS the boundary clause; it may not move
 *     below the fold, become a tooltip, or be dropped for layout.
 *   - The flagship story, its boundary clause and the three supporting threats
 *     are risk-scenarios.md's Tier 1 wording, verbatim. Tier 2 — any "we
 *     stopped X", any averted consequence — is gated on AAASM-5532/5529 and
 *     must not appear here.
 *   - Outcome, default-posture and platform sentences are role-narratives.md's
 *     claim register (RC1–RC16). The Bound column is part of the claim; a card
 *     that drops it is the broadening ADR 0034 §2.3 forbids.
 *
 * Two things this page may not say, both known ground truth: there is no
 * end-to-end audit trail (emission is best-effort, and the node and go SDK
 * audit sinks are production no-ops — AAASM-5681), and agent identity is
 * asserted rather than verified (AAASM-5665, RC16).
 */

// Cross-hostname destinations carry UTM per HORO-47 §5.2. Same-hostname
// destinations (#install, /early-access) MUST NOT carry UTM — that
// would overwrite the visitor's session source in GA4.
const UTM_DOCS =
  'utm_source=product_site&utm_medium=docs_link&utm_campaign=agent_assembly_launch';
const DOCS = `${DOCS_URL}/?${UTM_DOCS}`;
const GITHUB_CORE =
  'https://github.com/ai-agent-assembly/agent-assembly?utm_source=product_site&utm_medium=referral&utm_campaign=agent_assembly_launch';
const GITHUB_EXAMPLES =
  'https://github.com/ai-agent-assembly/examples?utm_source=product_site&utm_medium=referral&utm_campaign=oss_install';

/** A Docs Hub page, with the UTM every cross-hostname link carries. */
function hub(page: string): string {
  return `${DOCS_URL}/${page}?${UTM_DOCS}`;
}

// AAASM-5528 — the coverage / known-limitations page the capability claims
// must resolve to. Cross-hostname, so it carries UTM per HORO-47 §5.2.
const LIMITATIONS_DOC = `${DOCS_URL}/core/latest/devtools/limitations.html?${UTM_DOCS}`;

// The Docs Hub pages this page derives from. Each is the canonical owner of
// the wording quoted beside it — link out, never fork.
const PROMISE_DOC = hub('product-promise.html');
const SCENARIOS_DOC = hub('risk-scenarios.html');
const CLAIMS_DOC = hub('role-narratives.html');
const SECURITY_DOC = hub('security-model.html');
const STATUS_DOC = hub('source-of-truth.html');
const POLICY_DOC = hub('policy-reference.html');
const OPEN_CORE_DOC = hub('open-core-boundary.html');

// Same-hostname anchors — no UTM.
const SELF_HOSTING_ANCHOR = '#install';
const EARLY_ACCESS_ROUTE = '/early-access';

export function Hero(): ReactNode {
  return (
    <header className={styles.hero}>
      <GovernedField />
      <div className={styles.heroInner}>
        <div className={styles.heroEyebrow}>
          <span className={styles.eyebrowLine} />{' '}
          <Translate id="home.hero.eyebrow">
            Decisions before the action, not alerts after it
          </Translate>{' '}
          <span className={styles.eyebrowLine} />
        </div>
        {/*
         * product-promise.md's approved headline and subheadline. They are
         * declared NON-SEVERABLE at the source: the headline published alone
         * reads as a claim over all agent behaviour, which is the single most
         * common defect in this product's published copy (37 of 69 audited
         * rows). The subheadline carries the boundary and must stay on this
         * screen, above the fold. Quote them; do not paraphrase — a paraphrase
         * is a new claim with its own evidence burden.
         */}
        <h1 className={styles.heroTitle}>
          <Translate id="home.hero.title">
            Decide what an AI agent may do — before it does it.
          </Translate>
        </h1>
        <p className={styles.heroSub}>
          <Translate id="home.hero.sub">
            Agent Assembly evaluates the actions you route through it against
            your policy, refuses them, or blocks them pending a decision, and
            records what it decided. An action you have not routed through it is
            not inspected — and the record says so.
          </Translate>
        </p>
        {/*
         * Three explicit conversion paths (IA plan §2.2 + §4.3 one
         * dominant CTA per page). Primary: developer self-hosting.
         * Secondary: buyer / design-partner. Tertiary: engineer
         * validation via GitHub. Wording avoids "Learn more" and
         * "Coming soon" fake-doors (§4.6).
         */}
        <div className={`${styles.ctaRow} ${styles.ctaRowCenter}`}>
          <TrackedLink
            className={styles.btnPrimary}
            eventName="cta_start_self_hosting_click"
            ctaLocation="hero"
            targetProduct="agent_assembly"
            to={SELF_HOSTING_ANCHOR}
          >
            <Translate id="home.cta.selfHost">Start self-hosting →</Translate>
          </TrackedLink>
          <TrackedLink
            className={styles.btnGhost}
            eventName="cta_cloud_early_access_click"
            ctaLocation="hero"
            targetProduct="early_access"
            to={EARLY_ACCESS_ROUTE}
          >
            <Translate id="home.cta.earlyAccess">
              Request Cloud Early Access
            </Translate>
          </TrackedLink>
          <TrackedLink
            className={styles.btnGhost}
            eventName="cta_view_github_click"
            ctaLocation="hero"
            targetProduct="github"
            to={GITHUB_CORE}
            alsoFire={['github_core_repo_click']}
            linkProps={{
              rel: 'noopener noreferrer',
              target: '_blank',
              'aria-label': translate({
                id: 'home.cta.starRepo.ariaLabel',
                message:
                  'Star the Agent Assembly core repository on GitHub (opens in a new tab)',
              }),
            }}
          >
            <Translate id="home.cta.starRepo">Star the core repo</Translate>
          </TrackedLink>
        </div>
        {/*
         * A governed launch, as it actually reads. Decision-scoped only: it
         * shows what was decided, never an averted consequence — that is
         * risk-scenarios.md's Tier 2, gated on AAASM-5532 / AAASM-5529.
         *
         * Deliberately absent from the previous version of this block: an
         * "identity verified" line (agent identity is asserted, not verified —
         * AAASM-5665 / RC16) and a budget line (whether a declared cap is
         * checked in the decision path is Unmeasured — RC13).
         */}
        <div
          className={`${styles.terminal} ${styles.heroTerminal}`}
          aria-hidden="true"
        >
          <div className={styles.terminalBar}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
          <pre className={styles.terminalBody}>
            <span className={styles.muted}>
              $ aasm run claude --policy team.yaml
            </span>
            {'\n'}
            <span className={styles.muted}> launched on the governed path</span>
            {'\n\n'}
            <span className={styles.muted}> CONNECT </span>
            files.unapproved.example:443{'\n'}
            <span className={styles.deny}>
              {' '}
              ✗ refused before dial — not in the allow-list you configured
            </span>
            {'\n\n'}
            <span className={styles.muted}> CONNECT </span>
            api.anthropic.com:443{'\n'}
            <span className={styles.review}>
              {' '}
              ~ redacted {'AKIA…'} matched a known pattern, removed before
              forward
            </span>
            {'\n\n'}
            <span className={styles.muted}> CONNECT </span>
            telemetry.vendor.example:443{'\n'}
            <span className={styles.muted}>
              {' '}
              · connection observed — payload not inspected
            </span>
          </pre>
        </div>
      </div>
    </header>
  );
}

/**
 * Trust-before-ask (IA plan §4.5): before the primary CTA appears
 * again in the install block, surface the OSS credibility signals
 * (GitHub, license, docs). Cross-hostname links carry UTM per §5.2.
 */
export function TrustStrip(): ReactNode {
  return (
    <section className={`${styles.section} ${styles.trustStrip}`}>
      <div className={`${styles.inner} ${styles.trustInner}`}>
        <span className={styles.trustLabel}>
          <Translate id="home.trust.label">Open source. Verifiable.</Translate>
        </span>
        <TrackedLink
          className={styles.trustLink}
          eventName="github_core_repo_click"
          ctaLocation="body"
          targetProduct="github"
          to={GITHUB_CORE}
          linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
        >
          <Translate id="home.trust.coreRepo">Core repo on GitHub →</Translate>
        </TrackedLink>
        <TrackedLink
          className={styles.trustLink}
          eventName="examples_repo_click"
          ctaLocation="body"
          targetProduct="github"
          to={GITHUB_EXAMPLES}
          linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
        >
          <Translate id="home.trust.examples">Example runs →</Translate>
        </TrackedLink>
        <TrackedLink
          className={styles.trustLink}
          eventName="cta_view_docs_click"
          ctaLocation="body"
          targetProduct="docs"
          to={DOCS}
          alsoFire={['docs_click']}
          linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
        >
          <Translate id="home.trust.docs">Read the docs →</Translate>
        </TrackedLink>
      </div>
    </section>
  );
}

interface Threat {
  readonly title: string;
  readonly body: string;
}

/**
 * The flagship risk story, then the three supporting threats.
 *
 * Every sentence here is risk-scenarios.md's Tier 1 wording, verbatim. Tier 1
 * is decision-scoped: it says what was decided, never what was averted. The
 * flagship's boundary clause is required on the same screen, above the fold —
 * hence a bordered note directly under the story rather than a footnote, a
 * tooltip or a "learn more".
 */
export function Problem(): ReactNode {
  const threats: readonly Threat[] = [
    {
      title: translate({
        id: 'home.threat.secret.title',
        message: 'A key in a prompt',
      }),
      body: translate({
        id: 'home.threat.secret.body',
        message:
          'An agent pasted a live API key into a request to its model provider. On the provider hosts Agent Assembly inspects, the key was recognised and removed before the request was forwarded. Detection is bounded by the patterns it knows, and the default is to redact and forward, not to block.',
      }),
    },
    {
      title: translate({
        id: 'home.threat.destructive.title',
        message: 'A tool call against production',
      }),
      body: translate({
        id: 'home.threat.destructive.body',
        message:
          'An agent called a tool that would have dropped a production table. The call was evaluated against your policy and refused before the proxy forwarded it. This covers MCP tool calls sent as ordinary HTTP POSTs; tool servers you run over stdio (the most common setup), SSE, or Streamable HTTP are not on this path.',
      }),
    },
    {
      title: translate({
        id: 'home.threat.cost.title',
        message: 'A retry loop that keeps spending',
      }),
      body: translate({
        id: 'home.threat.cost.body',
        message:
          'An agent in a retry loop reached the spend cap its team had declared, and the next call was refused by the policy decision. A cap exists only where a policy declares one, and the refusal stops the call only where something in front of it waits for that answer.',
      }),
    },
  ];

  return (
    <section className={`${styles.section} ${styles.soft}`} id="problem">
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <Translate id="home.problem.eyebrow">The problem</Translate>
        </div>
        <h2 className={styles.h2}>
          <Translate id="home.problem.title">
            An agent can act faster than anyone can review it.
          </Translate>
        </h2>
        <p className={styles.lead}>
          <Translate id="home.problem.lead">
            Monitoring answers the question afterwards. The decision that
            matters happens a moment earlier — while the action can still be
            refused.
          </Translate>
        </p>

        <div className={styles.story}>
          <div className={styles.storyLabel}>
            <Translate id="home.problem.storyLabel">
              What that looks like
            </Translate>
          </div>
          <p className={styles.storyBody}>
            <Translate id="home.problem.flagship">
              A coding agent decided to upload the repository it was working on
              to an endpoint nobody had approved. Because the agent was launched
              through Agent Assembly’s managed launch for Claude Code, the
              connection was evaluated against the destination list the team
              configured, and refused before the proxy dialled it.
            </Translate>
          </p>
          {/*
           * Non-severable from the sentence above: same screen, not a
           * footnote. risk-scenarios.md, Tier 1 constraint 1.
           */}
          <p className={styles.boundNote}>
            <strong>
              <Translate id="home.problem.boundLabel">
                Where this applies.
              </Translate>
            </strong>{' '}
            <Translate id="home.problem.bound">
              This applies to connections you route through Agent Assembly —
              today, via the managed launch for Claude Code — on a host where
              the proxy is installed: a released artifact on Linux, and on macOS
              via cargo install aa-proxy. On Windows there is no local
              mediation. It applies against an approved-destination list you
              configure. An agent you did not route is not inspected, and the
              record says so. A durable local record of the refusal exists only
              where the proxy’s audit path is configured.
            </Translate>
          </p>
        </div>

        <div className={styles.grid3}>
          {threats.map((s) => (
            <div key={s.title} className={styles.card}>
              <h3 className={styles.cardTitle}>{s.title}</h3>
              <p className={styles.cardText}>{s.body}</p>
            </div>
          ))}
        </div>

        <p className={styles.sectionFoot}>
          <TrackedLink
            className={styles.trustLink}
            eventName="cta_view_docs_click"
            ctaLocation="body"
            targetProduct="docs"
            to={SCENARIOS_DOC}
            alsoFire={['docs_click']}
            linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
          >
            <Translate id="home.problem.scenariosLink">
              Each scenario’s decider, default state and known bypasses →
            </Translate>
          </TrackedLink>
        </p>
      </div>
    </section>
  );
}

interface Step {
  readonly tag: string;
  readonly text: string;
}

/**
 * product-promise.md Level 2 — the three plain-language steps, before any
 * implementation path is offered.
 *
 * Keeps `id="architecture"` and the `architecture_view` event. The anchor is
 * load-bearing: a URL fragment is never sent to the server, so no redirect can
 * catch `/#architecture` if it disappears — the link would break silently.
 */
export function ThreeSteps(): ReactNode {
  const steps: readonly Step[] = [
    {
      tag: translate({id: 'home.steps.route.tag', message: '1 · Route it'}),
      text: translate({
        id: 'home.steps.route.text',
        message:
          'An agent is on a governed path when you have put it there: launched through aasm run, started by a developer-tool integration that writes the proxy settings into the tool’s own configuration, or calling a policy checkpoint from an SDK. Routing is a thing you do, per agent and per launch. An agent you did not route is not on the path — and not every tool has a managed launch to offer.',
      }),
    },
    {
      tag: translate({id: 'home.steps.decide.tag', message: '2 · Decide it'}),
      text: translate({
        id: 'home.steps.decide.text',
        message:
          'Before the action takes effect, something on the path decides whether it may proceed — and which thing depends on the path. The proxy refuses on its own local configuration for connection-time egress and for model-provider hosts. The control plane answers policy, budget and approval questions, and it holds no traffic: its answer stops an action only where a component in front of that action waits for it.',
      }),
    },
    {
      tag: translate({id: 'home.steps.show.tag', message: '3 · Show it'}),
      text: translate({
        id: 'home.steps.show.text',
        message:
          'Decisions are written to a hash-chained audit log you can verify yourself with aasm audit verify-chain, which ships in the open-source build. Where nothing inspected an action, the rule is that the record reports it as not inspected rather than as allowed. Emission is best-effort — a decision can be made and its record lost — so the log is a record of what got through, not a ledger of what happened.',
      }),
    },
  ];
  return (
    <SectionInView
      as="section"
      eventName="architecture_view"
      className={styles.section}
      id="architecture"
    >
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <Translate id="home.steps.eyebrow">How it works</Translate>
        </div>
        <h2 className={styles.h2}>
          <Translate id="home.steps.title">
            Route it. Decide it. Show it.
          </Translate>
        </h2>
        <p className={styles.lead}>
          <Translate id="home.steps.lead">
            Three steps, in the order they happen. No product vocabulary is
            required to follow them, and none of the three is skippable — step
            one is what makes the other two possible.
          </Translate>
        </p>
        <div className={styles.layers}>
          {steps.map((s) => (
            <div key={s.tag} className={styles.layer}>
              <span className={styles.layerTag}>{s.tag}</span>
              <span className={styles.cardText}>{s.text}</span>
            </div>
          ))}
        </div>
        <p className={styles.sectionFoot}>
          <TrackedLink
            className={styles.trustLink}
            eventName="cta_view_docs_click"
            ctaLocation="body"
            targetProduct="docs"
            to={PROMISE_DOC}
            alsoFire={['docs_click']}
            linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
          >
            <Translate id="home.steps.promiseLink">
              The same three steps, at evaluator and engineering depth →
            </Translate>
          </TrackedLink>
        </p>
      </div>
    </SectionInView>
  );
}

interface Outcome {
  readonly term: string;
  readonly title: string;
  readonly text: string;
  readonly bound: string;
}

/**
 * What a decision can be — one card per outcome, each with the ADR 0033 §6
 * term it reaches, the component that actually decides, and the bound that
 * travels with the claim (role-narratives.md RC1–RC5, RC12).
 *
 * These are deliberately NOT presented as four branches of one verdict.
 * Redaction is a separate stage applied after the connection decision, the
 * API's five-way runtime verdict is a frozen vocabulary surfaced as null, and
 * presenting either as a live four-way answer is a forbidden design.
 *
 * Keeps `id="security"` and the `security_model_view` event; see the anchor
 * note on ThreeSteps.
 */
export function Outcomes(): ReactNode {
  const outcomes: readonly Outcome[] = [
    {
      term: translate({
        id: 'home.outcome.refuse.term',
        message: 'Denied before execution',
      }),
      title: translate({
        id: 'home.outcome.refuse.title',
        message: 'Refused before it ran',
      }),
      text: translate({
        id: 'home.outcome.refuse.text',
        message:
          'A connection made on a path you routed through Agent Assembly is checked against the destination list you configured and refused before the proxy dials it.',
      }),
      bound: translate({
        id: 'home.outcome.refuse.bound',
        message:
          'The refusal is the proxy’s own local egress configuration, not a control-plane decision, and the destination lists are empty by default — this refusal exists because an operator configured it. One egress control is on by default and no configuration relaxes it: requests to loopback, private, link-local and related address space are refused, including where a public hostname resolves into them.',
      }),
    },
    {
      term: translate({
        id: 'home.outcome.redact.term',
        message: 'Redacted',
      }),
      title: translate({
        id: 'home.outcome.redact.title',
        message: 'Removed before it was forwarded',
      }),
      text: translate({
        id: 'home.outcome.redact.text',
        message:
          'On the model-provider hosts Agent Assembly inspects, a recognised credential is removed from the request before it is forwarded.',
      }),
      bound: translate({
        id: 'home.outcome.redact.bound',
        message:
          'Three built-in hosts, because payload inspection is limited to model-provider hosts by default. The default action is redact and forward, not refuse. Recall is bounded by the pattern set, and model responses on that path are not scanned. This does not keep a credential out of the agent’s own process.',
      }),
    },
    {
      term: translate({
        id: 'home.outcome.evaluate.term',
        message: 'Evaluated',
      }),
      title: translate({
        id: 'home.outcome.evaluate.title',
        message: 'Evaluated against your policy',
      }),
      text: translate({
        id: 'home.outcome.evaluate.text',
        message:
          'An MCP tool call can be checked against your policy by the control plane and refused before the proxy forwards it. A tool call through a wrapped framework seam is checked before the tool body runs.',
      }),
      bound: translate({
        id: 'home.outcome.evaluate.bound',
        message:
          'The MCP path is the only gateway-bound pre-dial refusal in the product, and it is off by default; tool servers over stdio — the most common setup — SSE and WebSocket have no interception mechanism. The SDK is advisory by design, a defence-in-depth posture rather than the authoritative gate: an agent that does not call it is not asking, and the Node SDK’s default mode produces no refusal at all.',
      }),
    },
    {
      term: translate({
        id: 'home.outcome.hold.term',
        message: 'Approval required',
      }),
      title: translate({
        id: 'home.outcome.hold.title',
        message: 'Blocked pending a decision',
      }),
      text: translate({
        id: 'home.outcome.hold.text',
        message:
          'A policy rule can hold an action rather than answering it. The hold is real and it fails closed: the check blocks, and a timeout resolves to a refusal.',
      }),
      bound: translate({
        id: 'home.outcome.hold.bound',
        message:
          'Stated here as an unfinished capability, because that is what it is. No shipped operator surface can answer the queue the hold blocks on, so in practice it blocks and then refuses at the timeout with no person involved. Do not plan on human review yet — tracked as AAASM-5657.',
      }),
    },
  ];
  return (
    <SectionInView
      as="section"
      eventName="security_model_view"
      className={`${styles.section} ${styles.soft}`}
      id="security"
    >
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <Translate id="home.outcome.eyebrow">Supported outcomes</Translate>
        </div>
        <h2 className={styles.h2}>
          <Translate id="home.outcome.title">
            What a decision can be — and which component makes it
          </Translate>
        </h2>
        <p className={styles.lead}>
          <Translate id="home.outcome.lead">
            These are not four branches of one verdict. Each has a different
            decider, a different default and a different reach, and the right
            guarantee attributed to the wrong component is its own kind of
            wrong. Redaction in particular is a separate stage, applied after
            the connection decision.
          </Translate>
        </p>
        <div className={styles.outcomeGrid}>
          {outcomes.map((o) => (
            <div key={o.title} className={styles.card}>
              <span className={styles.termBadge}>{o.term}</span>
              <h3 className={styles.cardTitle}>{o.title}</h3>
              <p className={styles.cardText}>{o.text}</p>
              <p className={styles.cardBound}>{o.bound}</p>
            </div>
          ))}
        </div>
        <p className={styles.sectionFoot}>
          <TrackedLink
            className={styles.trustLink}
            eventName="cta_view_docs_click"
            ctaLocation="body"
            targetProduct="docs"
            to={SECURITY_DOC}
            alsoFire={['docs_click']}
            linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
          >
            <Translate id="home.outcome.securityLink">
              The trust boundary and its enumerated bypasses →
            </Translate>
          </TrackedLink>
        </p>
      </div>
    </SectionInView>
  );
}

interface ProofItem {
  readonly title: string;
  readonly text: string;
  readonly linkLabel: string;
  readonly href: string;
  readonly targetProduct: 'docs' | 'github';
}

/**
 * Proof means a claim a reader can check, tied to real evidence — not a
 * confident sentence. Each item names something checkable and links to it.
 *
 * The second half is as load-bearing as the first: where the evidence does not
 * exist yet, this page says what is true (Unmeasured, Planned) rather than
 * reaching. A named prevented-outcome demonstration is gated on AAASM-5532 /
 * AAASM-5529 and is stated as absent rather than quietly omitted.
 */
export function Proof(): ReactNode {
  const items: readonly ProofItem[] = [
    {
      title: translate({
        id: 'home.proof.chain.title',
        message: 'Verify the audit chain yourself',
      }),
      text: translate({
        id: 'home.proof.chain.text',
        message:
          'aasm audit verify-chain ships in the open-source build. It proves the integrity of the entries that are present — not that the log is whole. The chain is tamper-evident, not signed: an unkeyed digest over the JSONL sink, so an emptied log verifies clean and exits zero.',
      }),
      linkLabel: translate({
        id: 'home.proof.chain.link',
        message: 'What verification does and does not establish →',
      }),
      href: SECURITY_DOC,
      targetProduct: 'docs',
    },
    {
      title: translate({
        id: 'home.proof.policy.title',
        message: 'Read the policy that produced the decision',
      }),
      text: translate({
        id: 'home.proof.policy.text',
        message:
          'Policy is versioned YAML or JSON you review through the Git workflow you already use. The field reference is published, so a rule you are shown on this site is a rule you can look up.',
      }),
      linkLabel: translate({
        id: 'home.proof.policy.link',
        message: 'Policy field reference →',
      }),
      href: POLICY_DOC,
      targetProduct: 'docs',
    },
    {
      title: translate({
        id: 'home.proof.register.title',
        message: 'Trace any sentence on this page to its bound',
      }),
      text: translate({
        id: 'home.proof.register.text',
        message:
          'Every capability sentence here is one of sixteen entries in a shared claim register, quoted rather than paraphrased. Each entry carries the term it reaches, the bound that travels with it, and the evidence rows behind it — including the two subjects the register records as unmeasured.',
      }),
      linkLabel: translate({
        id: 'home.proof.register.link',
        message: 'The claim register →',
      }),
      href: CLAIMS_DOC,
      targetProduct: 'docs',
    },
    {
      title: translate({
        id: 'home.proof.source.title',
        message: 'Read the runtime that makes the decision',
      }),
      text: translate({
        id: 'home.proof.source.text',
        message:
          'The gateway, proxy, CLI and SDKs are Apache-2.0 on GitHub, with the tests that pin each behaviour described here. What is open source and what is not is stated rather than implied.',
      }),
      linkLabel: translate({
        id: 'home.proof.source.link',
        message: 'The open-core boundary →',
      }),
      href: OPEN_CORE_DOC,
      targetProduct: 'docs',
    },
  ];

  const notYet: readonly string[] = [
    translate({
      id: 'home.proof.notyet.demo',
      message:
        'A named prevented-outcome demonstration. The negative control for the story above is designed and has not been run, so this page describes the decision that was made, never the consequence that was avoided.',
    }),
    translate({
      id: 'home.proof.notyet.audit',
      message:
        'That every decision reaches the log. Emission is best-effort: the chain head advances before the send, and a dropped entry is indistinguishable from a deleted one. Whether a given decision’s record durably arrives is Unmeasured.',
    }),
    translate({
      id: 'home.proof.notyet.identity',
      message:
        'Verified agent identity. An agent presents an identity and a possession proof, but the agent plane accepts callers without authentication by design, as a bootstrap path. Treat an agent id as asserted, not established.',
    }),
    translate({
      id: 'home.proof.notyet.coverage',
      message:
        'Any coverage figure — a percentage, a count of governed actions, or a number spanning a set of machines. There is nothing to compute one from, and a component reporting itself available is not evidence that it saw anything.',
    }),
  ];

  return (
    <section className={styles.section} id="proof">
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <Translate id="home.proof.eyebrow">Proof</Translate>
        </div>
        <h2 className={styles.h2}>
          <Translate id="home.proof.title">
            Four things you can check without taking our word for it
          </Translate>
        </h2>
        <div className={styles.outcomeGrid}>
          {items.map((p) => (
            <div key={p.title} className={styles.card}>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardText}>{p.text}</p>
              <TrackedLink
                className={styles.cardLink}
                eventName="cta_view_docs_click"
                ctaLocation="body"
                targetProduct={p.targetProduct}
                alsoFire={['docs_click']}
                to={p.href}
                linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
              >
                {p.linkLabel}
              </TrackedLink>
            </div>
          ))}
        </div>

        <div className={styles.notYet}>
          <h3 className={styles.notYetTitle}>
            <Translate id="home.proof.notyet.title">
              And four things this page will not claim yet
            </Translate>
          </h3>
          <ul className={styles.notYetList}>
            {notYet.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

interface DefaultRow {
  readonly subject: string;
  readonly posture: string;
}

/**
 * The default-posture table, narrowed from product-promise.md Level 3, plus
 * the platform position and the managed-service boundary.
 *
 * This is the question that most changes an evaluation: a capability that
 * exists but is off is a different product from one that is on. The table runs
 * in both directions on purpose — understating a shipped control (the SSRF
 * guard, the refusal to launch ungoverned) is graded a defect too.
 */
export function CurrentPosition(): ReactNode {
  const rows: readonly DefaultRow[] = [
    {
      subject: translate({
        id: 'home.pos.launch.subject',
        message: 'Launching a session with no policy',
      }),
      posture: translate({
        id: 'home.pos.launch.posture',
        message:
          'Refused. aasm run will not start a tool when no effective policy resolves, and will not start one whose policy parses but declares no rule. An absent policy is not permission.',
      }),
    },
    {
      subject: translate({
        id: 'home.pos.ssrf.subject',
        message: 'Private-address egress',
      }),
      posture: translate({
        id: 'home.pos.ssrf.posture',
        message:
          'Refused, always. The guard re-checks every resolved address before dialling, so a public hostname that resolves into private space is refused too. No configuration and no environment variable relaxes it.',
      }),
    },
    {
      subject: translate({
        id: 'home.pos.egress.subject',
        message: 'Your own allow and deny lists',
      }),
      posture: translate({
        id: 'home.pos.egress.posture',
        message: 'Empty. You configure them, per destination.',
      }),
    },
    {
      subject: translate({
        id: 'home.pos.inspection.subject',
        message: 'Payload inspection',
      }),
      posture: translate({
        id: 'home.pos.inspection.posture',
        message:
          'Narrow. Three built-in model-provider hosts are inspected by default. Any other host is tunnelled without payload inspection: the connection is observed, the payload is not.',
      }),
    },
    {
      subject: translate({
        id: 'home.pos.creds.subject',
        message: 'Recognised credentials',
      }),
      posture: translate({
        id: 'home.pos.creds.posture',
        message:
          'Redact and forward. Blocking on a detected credential is opt-in. Model responses are not scanned.',
      }),
    },
    {
      subject: translate({
        id: 'home.pos.sdk.subject',
        message: 'SDK enforcement',
      }),
      posture: translate({
        id: 'home.pos.sdk.posture',
        message:
          'Off in the default mode. A policy refusal blocks a wrapped tool only in the check-capable mode; asking for enforcement without it is refused loudly at init rather than silently allowed.',
      }),
    },
    {
      subject: translate({
        id: 'home.pos.fallthrough.subject',
        message: 'An action matching no rule',
      }),
      posture: translate({
        id: 'home.pos.fallthrough.posture',
        message:
          'Allowed. Default-open within a policy, default-refuse on having one — both halves, or the pair misleads.',
      }),
    },
    {
      subject: translate({
        id: 'home.pos.budget.subject',
        message: 'Spend caps',
      }),
      posture: translate({
        id: 'home.pos.budget.posture',
        message:
          'None unless a policy declares one; an undeclared budget is uncapped. Whether a declared cap is checked in the decision path is Unmeasured, and a corrupt budget store resets the cap silently.',
      }),
    },
    {
      subject: translate({
        id: 'home.pos.host.subject',
        message: 'Operating-system-level controls',
      }),
      posture: translate({
        id: 'home.pos.host.posture',
        message:
          'Off unless deployed, and not a decision point. On Linux, kernel probes report TLS plaintext, process execution and file activity; no such signal takes part in any allow or deny decision, and file-I/O probes are x86_64 only. macOS has no equivalent adapter — and is also the one platform where the host-enforcement rung is reachable at all, through an opt-in authorized settings write. Windows has neither.',
      }),
    },
    {
      subject: translate({
        id: 'home.pos.audit.subject',
        message: 'Audit',
      }),
      posture: translate({
        id: 'home.pos.audit.posture',
        message:
          'On, best-effort. Hash-chained JSONL, verifiable in the open-source build. Writing is not guaranteed, so the log records what got through rather than what happened.',
      }),
    },
  ];
  return (
    <section
      className={`${styles.section} ${styles.soft}`}
      id="current-position"
    >
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <Translate id="home.pos.eyebrow">Current position</Translate>
        </div>
        <h2 className={styles.h2}>
          <Translate id="home.pos.title">
            What is on out of the box, and what is not
          </Translate>
        </h2>
        <p className={styles.lead}>
          <Translate id="home.pos.lead">
            A capability that exists but is off is a different product from one
            that is on, so here is the default posture before you configure
            anything. Read it in both directions — two rows below are stronger
            than an evaluator usually expects.
          </Translate>
        </p>
        <div className={styles.postureTableWrap}>
          <table className={styles.postureTable}>
            <thead>
              <tr>
                <th scope="col">
                  <Translate id="home.pos.colSubject">Out of the box</Translate>
                </th>
                <th scope="col">
                  <Translate id="home.pos.colPosture">Default</Translate>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.subject}>
                  <th scope="row">{r.subject}</th>
                  <td>{r.posture}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.positionNotes}>
          <p className={styles.boundNote}>
            <strong>
              <Translate id="home.pos.platformLabel">Platforms.</Translate>
            </strong>{' '}
            <Translate id="home.pos.platform">
              The proxy that delivers most of the above is a released artifact
              on Linux; on macOS it is a cargo install aa-proxy. On Windows
              there is no local mediation of any kind. UDP, QUIC and HTTP/3 are
              outside the transport set.
            </Translate>
          </p>
          <p className={styles.boundNote}>
            <strong>
              <Translate id="home.pos.maturityLabel">Maturity.</Translate>
            </strong>{' '}
            <Translate id="home.pos.maturity">
              The open-source runtime is pre-1.0 and released as a pre-release
              series. The managed service is planned — decided, not built — so
              nothing on this site is a commitment to an availability date, a
              region, an SLA or a compliance position.
            </Translate>
          </p>
        </div>

        <p className={styles.sectionFoot}>
          <TrackedLink
            className={styles.trustLink}
            eventName="cta_view_docs_click"
            ctaLocation="body"
            targetProduct="docs"
            to={LIMITATIONS_DOC}
            alsoFire={['docs_click']}
            linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
          >
            <Translate id="home.pos.limitations">
              Known limits, per integration →
            </Translate>
          </TrackedLink>
          {' · '}
          <TrackedLink
            className={styles.trustLink}
            eventName="cta_view_docs_click"
            ctaLocation="body"
            targetProduct="docs"
            to={STATUS_DOC}
            alsoFire={['docs_click']}
            linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
          >
            <Translate id="home.pos.status">
              Release status, area by area →
            </Translate>
          </TrackedLink>
        </p>
      </div>
    </section>
  );
}

export function FinalCTA(): ReactNode {
  return (
    <section className={`${styles.section} ${styles.soft} ${styles.center}`}>
      <div className={styles.inner}>
        <h2 className={styles.h2}>
          <Translate id="home.final.title">
            Put the decision before the action.
          </Translate>
        </h2>
        <p className={styles.lead}>
          <Translate id="home.final.lead">
            Route one agent, refuse one call it should not have made, and read
            the record it left.
          </Translate>
        </p>
        <div
          className={styles.ctaRow}
          style={{justifyContent: 'center', marginTop: '1.5rem'}}
        >
          <TrackedLink
            className={styles.btnPrimary}
            eventName="cta_start_self_hosting_click"
            ctaLocation="footer"
            targetProduct="agent_assembly"
            to={SELF_HOSTING_ANCHOR}
          >
            <Translate id="home.cta.selfHost">Start self-hosting →</Translate>
          </TrackedLink>
          <TrackedLink
            className={styles.btnGhost}
            eventName="cta_cloud_early_access_click"
            ctaLocation="footer"
            targetProduct="early_access"
            to={EARLY_ACCESS_ROUTE}
          >
            <Translate id="home.cta.earlyAccess">
              Request Cloud Early Access
            </Translate>
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}

/**
 * Re-exports so the landing page can import the install-block and
 * the section-in-view helper from the barrel.
 */
export {InstallBlock} from './InstallBlock';
export {NextSteps} from './NextSteps';
