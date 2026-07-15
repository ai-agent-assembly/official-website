import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import {DOCS_URL} from '@site/src/generated/site-urls';
import styles from './product.module.css';

const DOCS = DOCS_URL;
const GITHUB = 'https://github.com/ai-agent-assembly';

export default function Product(): ReactNode {
  return (
    <Layout
      title={translate({
        id: 'product.meta.title',
        message: 'Product — Agent Assembly',
      })}
      description={translate({
        id: 'product.meta.description',
        message:
          'What Agent Assembly is: a governance layer for AI agents — it enforces policy, tracks cost, and intercepts unsafe actions.',
      })}
    >
      <div className={styles.wrap}>
        <div className={styles.kicker}>
          <Translate id="product.kicker">Product</Translate>
        </div>
        <h1 className={styles.title}>
          <Translate id="product.title">
            A governance layer for AI agents
          </Translate>
        </h1>
        <p className={styles.intro}>
          <Translate id="product.intro">
            Agent Assembly is not another agent framework. It is the governance
            layer that sits between your agents and the outside world — it
            enforces policy, tracks cost, and intercepts unsafe actions at
            runtime.
          </Translate>
        </p>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>
            <Translate id="product.why.title">
              Why agent frameworks are not enough
            </Translate>
          </h2>
          <p className={styles.p}>
            <Translate id="product.why.body">
              Frameworks make agents capable — they plan, call tools, and act.
              But they don’t give an agent an identity, constrain its authority,
              or keep credentials out of the model’s reach. Agent Assembly adds
              that boundary without you rewriting your agents.
            </Translate>
          </p>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>
            <Translate id="product.iai.title">
              Identity, Authority, and Secret Isolation
            </Translate>
          </h2>
          <div className={styles.cols}>
            <div className={styles.panel}>
              <p className={styles.panelTitle}>
                🪪{' '}
                <Translate id="product.iai.identityAuthority">
                  Identity &amp; Authority
                </Translate>
              </p>
              <ul className={styles.list}>
                <li>
                  <Translate id="product.iai.item.identity">
                    Per-agent, team-scoped identity
                  </Translate>
                </li>
                <li>
                  <Translate id="product.iai.item.policy">
                    Allow/deny policy + network egress control
                  </Translate>
                </li>
                <li>
                  <Translate id="product.iai.item.budgets">
                    Per-team budgets and quotas
                  </Translate>
                </li>
                <li>
                  <Translate id="product.iai.item.approval">
                    Human-in-the-loop approval gates
                  </Translate>
                </li>
                <li>
                  <Translate id="product.iai.item.audit">
                    Tamper-evident audit trail
                  </Translate>
                </li>
              </ul>
            </div>
            <div className={styles.panel}>
              <p className={styles.panelTitle}>
                🔑{' '}
                <Translate id="product.iai.secretIsolation">
                  Secret Isolation
                </Translate>
              </p>
              <ul className={styles.list}>
                <li>
                  <Translate id="product.iai.item.inject">
                    Credentials injected at execution time
                  </Translate>
                </li>
                <li>
                  <Translate id="product.iai.item.noContext">
                    Secrets never enter the model context
                  </Translate>
                </li>
                <li>
                  <Translate id="product.iai.item.resolution">
                    Per-team secret resolution
                  </Translate>
                </li>
                <li>
                  <Translate id="product.iai.item.redaction">
                    Redaction on the audit path
                  </Translate>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>
            <Translate id="product.layers.title">
              Runtime boundary &amp; enforcement layers
            </Translate>
          </h2>
          <p className={styles.p}>
            <Translate
              id="product.layers.body"
              values={{
                sdks: <strong>SDKs</strong>,
                proxy: <strong>proxy</strong>,
                ebpf: <strong>eBPF</strong>,
                gateway: <strong>gateway</strong>,
              }}
            >
              {
                'Three independently-deployable layers — in-process {sdks}, a sidecar {proxy}, and {ebpf} kernel hooks — feed a central {gateway} that holds the registry, evaluates policy, tracks budgets, and records the audit log. Adopt the depth you need.'
              }
            </Translate>
          </p>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>
            <Translate id="product.oss.title">
              Open-source core vs hosted Cloud Console
            </Translate>
          </h2>
          <div className={styles.cols}>
            <div className={styles.panel}>
              <p className={styles.panelTitle}>
                <Translate id="product.oss.core.title">
                  Open-source core
                </Translate>
              </p>
              <p className={styles.p}>
                <Translate id="product.oss.core.body">
                  Self-host a limited-function stack — gateway, CLI, SDKs,
                  proxy, and eBPF — from the Apache-2.0 crates, for local
                  evaluation and development. No cost.
                </Translate>
              </p>
            </div>
            <div className={styles.panel}>
              <p className={styles.panelTitle}>
                <Translate id="product.oss.cloud.title">
                  Hosted Cloud Console
                </Translate>
              </p>
              <p className={styles.p}>
                <Translate id="product.oss.cloud.body">
                  A managed control plane for orgs, teams, policy versioning,
                  approvals, and audit — without running the backend yourself.
                </Translate>
              </p>
            </div>
          </div>
          <p className={styles.p} style={{marginTop: '1rem'}}>
            <Translate id="product.oss.summary">
              The open-source core self-hosts a limited-function stack for
              evaluation and development; the hosted console delivers the full
              feature set as a managed service.
            </Translate>
          </p>
        </section>

        <div className={styles.ctaRow}>
          <Link className={styles.btnPrimary} to={DOCS}>
            <Translate id="product.cta.getStarted">Get started →</Translate>
          </Link>
          <Link className={styles.btnGhost} to={GITHUB}>
            <Translate id="product.cta.github">GitHub</Translate>
          </Link>
          <span
            className={`${styles.btnGhost} ${styles.btnDisabled}`}
            aria-disabled="true"
          >
            <Translate id="product.cta.cloudConsole">Cloud Console </Translate>
            <span className={styles.soon}>
              <Translate id="product.cta.comingSoon">👷 Coming soon</Translate>
            </span>
          </span>
        </div>
      </div>
    </Layout>
  );
}
