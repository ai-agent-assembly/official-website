import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const DOCS = 'https://docs.agent-assembly.com';
const GETTING_STARTED = DOCS;
const GITHUB = 'https://github.com/ai-agent-assembly';
const CONSOLE = 'https://app.agent-assembly.com';

export function Hero(): ReactNode {
  return (
    <header className={styles.hero}>
      <div className={styles.heroGrid}>
        <div>
          <h1 className={styles.heroTitle}>
            Define the boundaries of autonomous agents.
          </h1>
          <p className={styles.heroSub}>
            Agent Assembly gives every AI agent an identity, limits what it can
            do, and keeps secrets outside the model&rsquo;s reach — across
            in-process SDKs, a sidecar proxy, and eBPF kernel hooks.
          </p>
          <div className={styles.ctaRow}>
            <Link className={styles.btnPrimary} to={GETTING_STARTED}>
              Start self-hosting →
            </Link>
            <Link className={styles.btnGhost} to={CONSOLE}>
              Try Cloud →
            </Link>
          </div>
        </div>
        <div className={styles.terminal} aria-hidden="true">
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
            <span className={styles.muted}> secret </span>STRIPE_KEY
            <span className={styles.muted}>
              {' '}
              injected at runtime — never in context
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
        <div className={styles.eyebrow}>The problem</div>
        <h2 className={styles.h2}>
          Agent frameworks help agents act. Nothing governs what they do.
        </h2>
        <p className={styles.lead}>
          Autonomous agents call tools, move money, and touch production systems
          — with the same credentials as the human who deployed them, and
          secrets sitting inside the model&rsquo;s context window. Agent
          Assembly is the runtime boundary that was missing.
        </p>
      </div>
    </section>
  );
}

const PILLARS = [
  {
    icon: '🪪',
    title: 'Identity',
    text: 'Every agent gets a verifiable identity scoped to a team, so policy and audit can answer "who did this".',
  },
  {
    icon: '🛡️',
    title: 'Authority',
    text: 'Allow/deny policy, egress control, budgets, and human-in-the-loop gates limit what each agent is permitted to do.',
  },
  {
    icon: '🔑',
    title: 'Secret Isolation',
    text: 'Real credentials are injected at execution time and never enter the model context the agent can see.',
  },
];

export function ThreePillars(): ReactNode {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}>What Agent Assembly enforces</div>
        <h2 className={styles.h2}>Three boundaries for every agent</h2>
        <div className={styles.grid3}>
          {PILLARS.map((p) => (
            <div key={p.title} className={styles.card}>
              <div className={styles.cardIcon}>{p.icon}</div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardText}>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const LAYERS = [
  {
    tag: 'SDK',
    text: 'In-process hooks (Python, Node.js, Go) emit events and apply pre-execution allow/deny. The fastest path.',
  },
  {
    tag: 'Proxy',
    text: 'A sidecar MitM proxy enforces network-egress policy with no code changes — catches what the SDK misses.',
  },
  {
    tag: 'eBPF',
    text: 'Kernel uprobes on SSL libraries plus exec/file syscall hooks catch everything, including bypass attempts (Linux).',
  },
  {
    tag: 'Gateway',
    text: 'The brain: agent registry, policy engine, per-team budgets, and the audit trail — over gRPC and HTTP.',
  },
];

export function HowItWorks(): ReactNode {
  return (
    <section className={`${styles.section} ${styles.soft}`}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}>How it works</div>
        <h2 className={styles.h2}>
          Three independently-deployable interception layers
        </h2>
        <p className={styles.lead}>
          Adopt the depth you need — from a one-line SDK import to kernel-level
          enforcement.
        </p>
        <div className={styles.layers}>
          {LAYERS.map((l) => (
            <div key={l.tag} className={styles.layer}>
              <span className={styles.layerTag}>{l.tag}</span>
              <span className={styles.cardText}>{l.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PATHS = [
  {
    icon: '⚙️',
    title: 'Open-source Core',
    text: 'Run the gateway, CLI, SDKs, proxy, and eBPF yourself. Free and self-hosted.',
    link: GITHUB,
    label: 'Browse the source',
  },
  {
    icon: '☁️',
    title: 'Hosted Control Plane',
    text: 'A managed cloud console for orgs, teams, policy, approvals, and audit.',
    link: CONSOLE,
    label: 'Open Cloud Console',
  },
  {
    icon: '📚',
    title: 'Technical Docs',
    text: 'Architecture, install paths, policy reference, and SDK guides.',
    link: DOCS,
    label: 'Read the docs',
  },
];

export function ChooseYourPath(): ReactNode {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}>Choose your path</div>
        <h2 className={styles.h2}>Start open-source, or let us host it</h2>
        <div className={styles.grid3}>
          {PATHS.map((p) => (
            <div key={p.title} className={styles.card}>
              <div className={styles.cardIcon}>{p.icon}</div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardText}>{p.text}</p>
              <Link className={styles.cardLink} to={p.link}>
                {p.label} →
              </Link>
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
        <h2 className={styles.h2}>Give your agents a boundary.</h2>
        <p className={styles.lead}>
          Identity, authority, and secret isolation — in one runtime layer.
        </p>
        <div
          className={styles.ctaRow}
          style={{justifyContent: 'center', marginTop: '1.5rem'}}
        >
          <Link className={styles.btnPrimary} to={GETTING_STARTED}>
            Start self-hosting →
          </Link>
          <Link className={styles.btnGhost} to={CONSOLE}>
            Try Cloud →
          </Link>
        </div>
      </div>
    </section>
  );
}
