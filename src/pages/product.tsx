import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {DOCS_URL} from '@site/src/generated/site-urls';
import styles from './product.module.css';

const DOCS = DOCS_URL;
const GITHUB = 'https://github.com/ai-agent-assembly';

export default function Product(): ReactNode {
  return (
    <Layout
      title="Product — Agent Assembly"
      description="What Agent Assembly is: a governance layer for AI agents — it enforces policy, tracks cost, and intercepts unsafe actions."
    >
      <div className={styles.wrap}>
        <div className={styles.kicker}>Product</div>
        <h1 className={styles.title}>A governance layer for AI agents</h1>
        <p className={styles.intro}>
          Agent Assembly is not another agent framework. It is the governance
          layer that sits between your agents and the outside world — it
          enforces policy, tracks cost, and intercepts unsafe actions at
          runtime.
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
                Self-host a limited-function stack — gateway, CLI, SDKs, proxy,
                and eBPF — from the Apache-2.0 crates, for local evaluation and
                development. No cost.
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
            The open-source core self-hosts a limited-function stack for
            evaluation and development; the hosted console delivers the full
            feature set as a managed service.
          </p>
        </section>

        <div className={styles.ctaRow}>
          <Link className={styles.btnPrimary} to={DOCS}>
            Get started →
          </Link>
          <Link className={styles.btnGhost} to={GITHUB}>
            GitHub
          </Link>
          <span
            className={`${styles.btnGhost} ${styles.btnDisabled}`}
            aria-disabled="true"
          >
            {'Cloud Console '}
            <span className={styles.soon}>👷 Coming soon</span>
          </span>
        </div>
      </div>
    </Layout>
  );
}
