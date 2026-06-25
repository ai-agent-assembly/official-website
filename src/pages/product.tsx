import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './product.module.css';

const DOCS = 'https://docs.agent-assembly.com';
const GITHUB = 'https://github.com/ai-agent-assembly';
const CONSOLE = 'https://app.agent-assembly.com';

export default function Product(): ReactNode {
  return (
    <Layout
      title="Product — Agent Assembly"
      description="What Agent Assembly is: a runtime boundary and governance layer for autonomous AI agents."
    >
      <div className={styles.wrap}>
        <div className={styles.kicker}>Product</div>
        <h1 className={styles.title}>
          A runtime boundary for autonomous agents
        </h1>
        <p className={styles.intro}>
          Agent Assembly is not another agent framework. It is the governance
          layer that sits underneath your agents and enforces what they are
          allowed to do at runtime.
        </p>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>
            Why agent frameworks are not enough
          </h2>
          <p className={styles.p}>
            Frameworks make agents capable — they plan, call tools, and act. But
            they don&rsquo;t give an agent an identity, constrain its authority,
            or keep credentials out of the model&rsquo;s reach. Agent Assembly
            adds that boundary without you rewriting your agents.
          </p>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>
            Identity, Authority, and Secret Isolation
          </h2>
          <div className={styles.cols}>
            <div className={styles.panel}>
              <p className={styles.panelTitle}>
                🪪 Identity &amp; 🛡️ Authority
              </p>
              <ul className={styles.list}>
                <li>Per-agent, team-scoped identity</li>
                <li>Allow/deny policy + network egress control</li>
                <li>Per-team budgets and quotas</li>
                <li>Human-in-the-loop approval gates</li>
                <li>Tamper-evident audit trail</li>
              </ul>
            </div>
            <div className={styles.panel}>
              <p className={styles.panelTitle}>🔑 Secret Isolation</p>
              <ul className={styles.list}>
                <li>Credentials injected at execution time</li>
                <li>Secrets never enter the model context</li>
                <li>Per-team secret resolution</li>
                <li>Redaction on the audit path</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>
            Runtime boundary &amp; enforcement layers
          </h2>
          <p className={styles.p}>
            Three independently-deployable layers — in-process{' '}
            <strong>SDKs</strong>, a sidecar <strong>proxy</strong>, and{' '}
            <strong>eBPF</strong> kernel hooks — feed a central{' '}
            <strong>gateway</strong> that holds the registry, evaluates policy,
            tracks budgets, and records the audit log. Adopt the depth you need.
          </p>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>
            Open-source core vs hosted Cloud Console
          </h2>
          <div className={styles.cols}>
            <div className={styles.panel}>
              <p className={styles.panelTitle}>Open-source core</p>
              <p className={styles.p}>
                Self-host the gateway, CLI, SDKs, proxy, and eBPF. Full control,
                no cost.
              </p>
            </div>
            <div className={styles.panel}>
              <p className={styles.panelTitle}>Hosted Cloud Console</p>
              <p className={styles.p}>
                A managed control plane for orgs, teams, policy versioning,
                approvals, and audit — without running the backend yourself.
              </p>
            </div>
          </div>
          <p className={styles.p} style={{marginTop: '1rem'}}>
            The hosted console is one way to operate Agent Assembly — the
            open-source core works on its own.
          </p>
        </section>

        <div className={styles.ctaRow}>
          <Link className={styles.btnPrimary} to={`${DOCS}/getting-started`}>
            Get started →
          </Link>
          <Link className={styles.btnGhost} to={GITHUB}>
            GitHub
          </Link>
          <Link className={styles.btnGhost} to={CONSOLE}>
            Cloud Console
          </Link>
        </div>
      </div>
    </Layout>
  );
}
