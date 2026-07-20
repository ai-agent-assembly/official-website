import React, {type ReactNode} from 'react';
import Translate, {translate} from '@docusaurus/Translate';
import {TrackedLink} from '@site/src/components/Tracked';
import {SectionInView} from './SectionInView';
import styles from './styles.module.css';
import {GovernedField} from './GovernedField';
import {DOCS_URL} from '@site/src/generated/site-urls';

// Cross-hostname destinations carry UTM per HORO-47 §5.2. Same-hostname
// destinations (#install, /early-access) MUST NOT carry UTM — that
// would overwrite the visitor's session source in GA4.
const DOCS = `${DOCS_URL}/?utm_source=product_site&utm_medium=docs_link&utm_campaign=agent_assembly_launch`;
const GITHUB_CORE =
  'https://github.com/ai-agent-assembly/agent-assembly?utm_source=product_site&utm_medium=referral&utm_campaign=agent_assembly_launch';
const GITHUB_EXAMPLES =
  'https://github.com/ai-agent-assembly/examples?utm_source=product_site&utm_medium=referral&utm_campaign=oss_install';

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
            Governance runtime for AI agents
          </Translate>{' '}
          <span className={styles.eyebrowLine} />
        </div>
        {/*
         * 10-second rule (IA plan §4.1): the H1 answers "what is it",
         * the sub answers "what problem does it solve" and "who is it
         * for", and the three CTAs answer "how do I try it" and "where
         * does Cloud fit". Keep this stack tight — anything that
         * pushes the CTAs below the fold breaks the contract.
         */}
        <h1 className={styles.heroTitle}>
          <Translate id="home.hero.title">
            A governance layer for AI agents.
          </Translate>
        </h1>
        <p className={styles.heroSub}>
          <Translate id="home.hero.sub">
            Agent Assembly sits between your agents and the outside world and
            enforces policy, tracks cost, and intercepts unsafe actions — at the
            SDK, the network proxy, and the kernel. Self-host a limited-function
            stack for evaluation and development; full functionality runs in the
            managed cloud (early access).
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
              $ aasm policy check payments-agent →
            </span>
            {'\n'}
            <span className={styles.muted}> tool: </span>http.post
            api.stripe.com/charges{'\n'}
            <span className={styles.ok}>
              {' '}
              ✓ identity verified payments-agent@team-a
            </span>
            {'\n'}
            <span className={styles.ok}> ✓ within budget $4.10 / $50.00</span>
            {'\n'}
            <span className={styles.deny}>
              {' '}
              ✗ denied egress host not in allow-list
            </span>
            {'\n'}
            <span className={styles.muted}> secret </span>
            {'STRIPE_KEY'}
            <span className={styles.muted}>
              {' injected at runtime — never in context'}
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
          'Every agent gets a verifiable identity scoped to a team, so policy and audit can answer "who did this".',
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
          'Real credentials are injected at execution time and never enter the model context the agent can see.',
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
            Three boundaries for every agent
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
          'In-process hooks (Python, Node.js, Go) emit events and apply pre-execution allow/deny. The fastest path.',
      }),
    },
    {
      tag: 'Proxy',
      text: translate({
        id: 'home.layers.proxy.text',
        message:
          'A sidecar MitM proxy enforces network-egress policy with no code changes — catches what the SDK misses.',
      }),
    },
    {
      tag: 'eBPF',
      text: translate({
        id: 'home.layers.ebpf.text',
        message:
          'Kernel uprobes on SSL libraries plus exec/file syscall hooks catch everything, including bypass attempts (Linux).',
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
            kernel-level enforcement.
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
