import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {
  Hero,
  Problem,
  TrustStrip,
  ThreePillars,
  HowItWorks,
  ChooseYourPath,
  InstallBlock,
  NextSteps,
  FinalCTA,
} from '@site/src/components/home';
import styles from '@site/src/components/home/styles.module.css';

/**
 * Agent Assembly landing page — HORO-42.
 *
 * Section order encodes IA plan §2.2's three-path funnel:
 *
 *   1. Hero              — 10-second contract (§4.1): H1, sub, 3 CTAs.
 *   2. Problem           — one idea per section (§4.7).
 *   3. TrustStrip        — OSS credibility signals before any deeper ask (§4.5).
 *   4. ThreePillars      — security model, IntersectionObserver-tracked (§5.2).
 *   5. HowItWorks        — architecture, IntersectionObserver-tracked (§5.2).
 *   6. ChooseYourPath    — the three paths, one card each.
 *   7. InstallBlock      — HORO-44 tabbed picker over command_type vocabulary.
 *   8. NextSteps         — HORO-44 docs/examples/repo/SDK outbound row.
 *   9. From the blog     — same-hostname, no UTM.
 *  10. FinalCTA          — dominant CTA repeats at page bottom.
 */
export default function Home(): ReactNode {
  return (
    <Layout
      title="Agent Assembly — governance runtime for AI agents"
      description="Identity, authority, and secret isolation for every AI agent — enforced at the SDK, the proxy, and the kernel. Open source today; managed cloud in early access."
    >
      <Hero />
      <main>
        <Problem />
        <TrustStrip />
        <ThreePillars />
        <HowItWorks />
        <ChooseYourPath />
        <InstallBlock />
        <NextSteps />
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
