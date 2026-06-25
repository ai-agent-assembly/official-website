import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {
  Hero,
  Problem,
  ThreePillars,
  HowItWorks,
  ChooseYourPath,
  FinalCTA,
} from '@site/src/components/home';
import styles from '@site/src/components/home/styles.module.css';

export default function Home(): ReactNode {
  return (
    <Layout
      title="Agent Assembly — the runtime boundary for AI agents"
      description="Agent Assembly gives every AI agent an identity, limits what it can do, and keeps secrets outside the model's reach."
    >
      <Hero />
      <main>
        <Problem />
        <ThreePillars />
        <HowItWorks />
        <ChooseYourPath />
        <section className={`${styles.section} ${styles.center}`}>
          <div className={styles.inner}>
            <div className={styles.eyebrow}>From the blog</div>
            <h2 className={styles.h2}>
              Build notes, engineering, and security write-ups
            </h2>
            <p className={styles.lead}>
              Why the runtime boundary matters and how we&rsquo;re building it.
            </p>
            <div
              className={styles.ctaRow}
              style={{justifyContent: 'center', marginTop: '1.25rem'}}
            >
              <Link className={styles.btnGhost} to="/blog">
                Read the blog →
              </Link>
            </div>
          </div>
        </section>
        <FinalCTA />
      </main>
    </Layout>
  );
}
