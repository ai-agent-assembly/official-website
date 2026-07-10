import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './arena.module.css';

const ARENA_DOCS = 'https://docs.agent-assembly.com/arena';
const ARENA_GITHUB = 'https://github.com/ai-agent-assembly/arena';

export default function Arena(): ReactNode {
  return (
    <Layout
      title="Arena — Agent Assembly"
      description="Arena is the public trial ground for agent-assembly governance. Agents enter, agent-assembly defends, and every match leaves a report."
    >
      <div className={styles.wrap}>
        <div className={styles.kicker}>Arena</div>
        <h1 className={styles.title}>
          The public trial ground for agent-assembly governance
        </h1>
        <p className={styles.intro}>
          Arena is the public trial ground for agent-assembly governance. Agents
          enter, agent-assembly defends, and every match leaves a report.
        </p>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Examples vs. Arena</h2>
          <div className={styles.cols}>
            <div className={styles.panel}>
              <p className={styles.panelTitle}>Examples</p>
              <ul className={styles.list}>
                <li>Small, instructional, happy-path samples</li>
                <li>Runnable in minutes, one framework at a time</li>
                <li>Teaches SDK integration, not governance limits</li>
              </ul>
            </div>
            <div className={styles.panel}>
              <p className={styles.panelTitle}>Arena</p>
              <ul className={styles.list}>
                <li>Cross-framework governance trials</li>
                <li>Adversarial scenarios and behavior profiles</li>
                <li>Deterministic mock/replay agents</li>
                <li>Every match leaves a report</li>
              </ul>
            </div>
          </div>
          <p className={styles.p} style={{marginTop: '1rem'}}>
            Don&rsquo;t confuse the two: <code>examples</code> shows you how to
            wire up an agent. <code>arena</code> shows you what happens when
            that agent tries to misbehave.
          </p>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Latest report</h2>
          <div className={styles.reportCard}>
            <div className={styles.reportLabel}>Report summary</div>
            <p className={styles.reportBody}>
              Match reports are published as trials run in Arena. Check the
              repository for the latest results across scenarios and frameworks.
            </p>
            <Link className={styles.reportLink} to={ARENA_GITHUB}>
              View match reports on GitHub →
            </Link>
          </div>
        </section>

        <div className={styles.ctaRow}>
          <Link className={styles.btnPrimary} to={ARENA_DOCS}>
            Read the docs →
          </Link>
          <Link className={styles.btnGhost} to={ARENA_GITHUB}>
            GitHub
          </Link>
        </div>
      </div>
    </Layout>
  );
}
