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

// AAASM-5528 — the coverage / known-limitations page the capability claims
// must resolve to. Cross-hostname, so it carries UTM per HORO-47 §5.2.
const LIMITATIONS_DOC = `${DOCS_URL}/core/latest/devtools/limitations.html?${UTM_DOCS}`;

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

export function Problem(): ReactNode {
  return (
    <section className={`${styles.section} ${styles.soft}`}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <Translate id="home.problem.eyebrow">The problem</Translate>
        </div>
        <h2 className={styles.h2}>
          <Translate id="home.problem.title">
            Agent frameworks help agents act. Nothing governs what they do.
          </Translate>
        </h2>
        <p className={styles.lead}>
          <Translate id="home.problem.lead">
            Autonomous agents call tools, move money, and touch production
            systems — with the same credentials as the human who deployed them,
            and secrets sitting inside the model’s context window. Agent
            Assembly is the runtime boundary that was missing.
          </Translate>
        </p>
      </div>
    </section>
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

interface Pillar {
  readonly icon: string;
  readonly title: string;
  readonly text: string;
}

export function ThreePillars(): ReactNode {
  const pillars: readonly Pillar[] = [
    {
      icon: '🪪',
      title: translate({
        id: 'home.pillars.identity.title',
        message: 'Identity',
      }),
      text: translate({
        id: 'home.pillars.identity.text',
        message:
          'Each registered agent carries a team-scoped identity, so policy and audit can answer "who did this".',
      }),
    },
    {
      icon: '🛡️',
      title: translate({
        id: 'home.pillars.authority.title',
        message: 'Authority',
      }),
      text: translate({
        id: 'home.pillars.authority.text',
        message:
          'Allow/deny policy, egress control, budgets, and human-in-the-loop gates limit what each agent is permitted to do.',
      }),
    },
    {
      icon: '🔑',
      title: translate({
        id: 'home.pillars.secret.title',
        message: 'Secret Isolation',
      }),
      text: translate({
        id: 'home.pillars.secret.text',
        message:
          'Outbound traffic on the inspected paths is scanned, and credentials matching the built-in patterns are redacted before the request is forwarded — or blocked, if you set policy to block.',
      }),
    },
  ];
  return (
    <SectionInView
      as="section"
      eventName="security_model_view"
      className={styles.section}
      id="security"
    >
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <Translate id="home.pillars.eyebrow">Security model</Translate>
        </div>
        <h2 className={styles.h2}>
          <Translate id="home.pillars.title">
            Three boundaries for a governed agent
          </Translate>
        </h2>
        <div className={styles.grid3}>
          {pillars.map((p) => (
            <div key={p.title} className={styles.card}>
              <div className={styles.cardIcon}>{p.icon}</div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardText}>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionInView>
  );
}

interface Layer {
  readonly tag: string;
  readonly text: string;
}

export function HowItWorks(): ReactNode {
  const layers: readonly Layer[] = [
    {
      tag: 'SDK',
      text: translate({
        id: 'home.layers.sdk.text',
        message:
          'In-process hooks (Python, Node.js, Go) emit events and raise on a deny before the wrapped tool call runs. Advisory by design: it depends on the agent cooperating, so it is defense-in-depth, not the gate.',
      }),
    },
    {
      tag: 'Proxy',
      text: translate({
        id: 'home.layers.proxy.text',
        message:
          'A sidecar MitM proxy enforces network-egress policy with no agent code changes — it needs the process to route through it and trust its CA. On macOS the proxy attempts that install at start and macOS prompts for admin authorization; refusing it fails proxy startup. On Linux you run sudo aasm proxy install-ca.',
      }),
    },
    {
      tag: 'eBPF',
      text: translate({
        id: 'home.layers.ebpf.text',
        message:
          'Observe-only kernel probes — OpenSSL uprobes plus exec/file syscall hooks — surface activity the layers above never saw. Linux only; it reports, it does not block.',
      }),
    },
    {
      tag: 'Gateway',
      text: translate({
        id: 'home.layers.gateway.text',
        message:
          'The brain: agent registry, policy engine, per-team budgets, and the audit trail — over gRPC and HTTP.',
      }),
    },
  ];
  return (
    <SectionInView
      as="section"
      eventName="architecture_view"
      className={`${styles.section} ${styles.soft}`}
      id="architecture"
    >
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <Translate id="home.how.eyebrow">Architecture</Translate>
        </div>
        <h2 className={styles.h2}>
          <Translate id="home.how.title">
            Three independently-deployable interception layers
          </Translate>
        </h2>
        <p className={styles.lead}>
          <Translate id="home.how.lead">
            Adopt the depth you need — from a one-line SDK import to
            kernel-level observation. Each layer has its own precondition, so
            they narrow the gap rather than closing it.
          </Translate>
        </p>
        <div className={styles.layers}>
          {layers.map((l) => (
            <div key={l.tag} className={styles.layer}>
              <span className={styles.layerTag}>{l.tag}</span>
              <span className={styles.cardText}>{l.text}</span>
            </div>
          ))}
        </div>
        {/*
         * AAASM-5528: the layer copy above states each layer's boundary, but a
         * summary card cannot carry the full coverage matrix. This link is the
         * required route from the high-level claim to the source-backed
         * limitations page — do not remove it when editing the layer copy.
         */}
        <p className={styles.cardText} style={{marginTop: '1.25rem'}}>
          <TrackedLink
            className={styles.trustLink}
            eventName="cta_view_docs_click"
            ctaLocation="body"
            targetProduct="docs"
            to={LIMITATIONS_DOC}
            alsoFire={['docs_click']}
            linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
          >
            <Translate id="home.how.limitations">
              What each layer does and does not cover →
            </Translate>
          </TrackedLink>
        </p>
      </div>
    </SectionInView>
  );
}

/**
 * Three explicit conversion paths from IA plan §2.2 (developer,
 * platform/security, buyer). This block mirrors the hero CTAs one
 * card at a time so scrollers who missed the hero can still self-serve.
 *
 * The Cloud card must never read as a fake door (§4.6). Copy is
 * unambiguously "Early access / design partner", not "Coming soon"
 * and not "Log in".
 */
interface PathCard {
  readonly icon: string;
  readonly title: string;
  readonly text: string;
  readonly link: string;
  readonly label: string;
  readonly eventName: string;
  readonly alsoFire?: readonly string[];
  readonly targetProduct: 'agent_assembly' | 'early_access' | 'docs' | 'github';
  /** External links open in new tab with `noopener`. */
  readonly external?: boolean;
}

export function ChooseYourPath(): ReactNode {
  const paths: readonly PathCard[] = [
    {
      icon: '⚙️',
      title: translate({
        id: 'home.paths.developer.title',
        message: 'Developer — self-host the OSS runtime',
      }),
      text: translate({
        id: 'home.paths.developer.text',
        message:
          'Run a limited-function stack — gateway, CLI, SDKs, proxy, and eBPF hooks — on your own infrastructure for evaluation and development. Free and Apache-2.0.',
      }),
      link: SELF_HOSTING_ANCHOR,
      label: translate({
        id: 'home.paths.developer.label',
        message: 'Jump to install',
      }),
      eventName: 'cta_start_self_hosting_click',
      targetProduct: 'agent_assembly',
    },
    {
      icon: '🛡️',
      title: translate({
        id: 'home.paths.security.title',
        message: 'Platform / Security — review the model',
      }),
      text: translate({
        id: 'home.paths.security.text',
        message:
          'Read the identity, authority, and secret-isolation contract before you decide what to trust in production.',
      }),
      link: '#security',
      label: translate({
        id: 'home.paths.security.label',
        message: 'Read the security model',
      }),
      eventName: 'cta_view_docs_click',
      alsoFire: ['docs_click'],
      targetProduct: 'docs',
    },
    {
      icon: '☁️',
      title: translate({
        id: 'home.paths.cloud.title',
        message: 'Cloud — request early access',
      }),
      text: translate({
        id: 'home.paths.cloud.text',
        message:
          'The full-functionality managed control plane, in early access. Design-partner program only — Cloud is not generally available.',
      }),
      link: EARLY_ACCESS_ROUTE,
      label: translate({
        id: 'home.paths.cloud.label',
        message: 'Request Cloud Early Access',
      }),
      eventName: 'cta_cloud_early_access_click',
      targetProduct: 'early_access',
    },
  ];
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <Translate id="home.paths.eyebrow">Choose your path</Translate>
        </div>
        <h2 className={styles.h2}>
          <Translate id="home.paths.title">Three ways to start</Translate>
        </h2>
        <div className={styles.grid3}>
          {paths.map((p) => (
            <div key={p.title} className={styles.card}>
              <div className={styles.cardIcon}>{p.icon}</div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardText}>{p.text}</p>
              <TrackedLink
                className={styles.cardLink}
                eventName={p.eventName}
                ctaLocation="body"
                targetProduct={p.targetProduct}
                to={p.link}
                alsoFire={p.alsoFire}
                linkProps={
                  p.external
                    ? {rel: 'noopener noreferrer', target: '_blank'}
                    : undefined
                }
              >
                {p.label} →
              </TrackedLink>
            </div>
          ))}
        </div>
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
            Give your agents a boundary.
          </Translate>
        </h2>
        <p className={styles.lead}>
          <Translate id="home.final.lead">
            Identity, authority, and secret isolation — in one runtime layer.
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
