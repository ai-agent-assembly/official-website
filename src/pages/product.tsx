import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import {DOCS_URL} from '@site/src/generated/site-urls';
import styles from './product.module.css';

const DOCS = DOCS_URL;
const GITHUB = 'https://github.com/ai-agent-assembly';
// AAASM-5528 — the coverage / known-limitations page the layer claims resolve to.
const LIMITATIONS_DOC = `${DOCS_URL}/core/latest/devtools/limitations.html`;

export default function Product(): ReactNode {
  return (
    /*
     * The description is a metadata surface: it has no room for a boundary
     * clause beside it, so it takes the promise rather than a description of
     * the architecture — the same rule, and the same sentence, as the homepage.
     * What stood here called the product "a governance layer for AI agents",
     * which is the hero line AAASM-5585 rejected, in the one place a search
     * result quotes it back.
     */
    <Layout
      title={translate({
        id: 'product.meta.title',
        message: 'Product — Agent Assembly',
      })}
      description={translate({
        id: 'product.meta.description.promise',
        message:
          'Agent Assembly decides whether an AI agent’s action is allowed before that action runs — on the paths you route through it — and records what was decided, so a risky call can be refused, or blocked pending a decision, instead of discovered afterwards.',
      })}
    >
      <div className={styles.wrap}>
        <div className={styles.kicker}>
          <Translate id="product.kicker">Product</Translate>
        </div>
        {/*
         * product-promise.md's approved headline and subheadline, quoted
         * verbatim and kept together — the source declares them NON-SEVERABLE,
         * because the headline alone reads as a claim over all agent behaviour
         * and the subheadline is the boundary that makes it a product claim.
         * They are the homepage's pair too, deliberately: a reader arriving
         * here from `/` must not meet a second, differently-worded promise.
         *
         * What stood here was "A governance layer for AI agents" plus "it
         * enforces policy … and blocks unsafe actions at runtime" — the hero
         * AAASM-5585 removed from `/`. "Enforces" and "blocks" are also the
         * undifferentiated verbs ADR 0033 §6 rules out: each can mean observed,
         * detected, evaluated or refused, and the reader cannot tell which.
         */}
        <h1 className={styles.title}>
          <Translate id="product.promise.headline">
            Decide what an AI agent may do — before it does it.
          </Translate>
        </h1>
        <p className={styles.intro}>
          <Translate id="product.promise.subheadline">
            Agent Assembly evaluates the actions you route through it against
            your policy, refuses them, or blocks them pending a decision, and
            records what it decided. An action you have not routed through it is
            not inspected — and the record says so.
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
              that boundary without you rewriting your agents’ logic — though
              the agent does have to be launched through a governed path for the
              boundary to apply.
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
                    Hash-chained audit trail — tamper-evident, not immutable
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
                    Outbound requests scanned for credentials before they are
                    forwarded
                  </Translate>
                </li>
                <li>
                  <Translate id="product.iai.item.noContext">
                    Recognised credentials redacted by default; blocked outright
                    if you set policy to block
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
                'Three independently-deployable layers — in-process {sdks}, a sidecar {proxy}, and {ebpf} kernel hooks — feed a central {gateway} that holds the registry, evaluates policy, tracks budgets, and records the audit log. The proxy denies an action before it leaves the machine; the SDK evaluates in-process and is advisory, since it depends on the agent calling it; the kernel layer observes and reports. Adopt the depth you need.'
              }
            </Translate>
          </p>
          {/*
           * AAASM-5528: the sentence above stops short of the full coverage
           * matrix, so it must resolve to the source-backed limitations page
           * rather than telling the reader to go find it. Do not drop this link.
           */}
          <p className={styles.p}>
            <Link to={LIMITATIONS_DOC}>
              <Translate id="product.layers.limitations">
                What each layer does and does not cover →
              </Translate>
            </Link>
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
