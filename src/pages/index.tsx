import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
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
 * Machine-translated-draft notice. Rendered only on non-default locales
 * whose catalog is a first-pass machine translation pending native review
 * (AAASM-4698). English (defaultLocale) never sees it.
 */
function DraftLocaleBanner(): ReactNode {
  const {
    i18n: {currentLocale, defaultLocale},
  } = useDocusaurusContext();
  if (currentLocale === defaultLocale) {
    return null;
  }
  return (
    <div className={styles.draftBanner} role="note">
      此為機器初翻，尚待母語審閱 (draft — pending native review)
    </div>
  );
}

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
      title={translate({
        id: 'home.meta.title',
        message: 'Agent Assembly — governance runtime for AI agents',
      })}
      description={translate({
        id: 'home.meta.description',
        message:
          'Identity, authority, and secret isolation for every AI agent — enforced at the SDK, the proxy, and the kernel. Open source today; managed cloud in early access.',
      })}
    >
      <DraftLocaleBanner />
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
            <div className={styles.eyebrow}>
              <Translate id="home.blog.eyebrow">From the blog</Translate>
            </div>
            <h2 className={styles.h2}>
              <Translate id="home.blog.title">
                Build notes, engineering, and security write-ups
              </Translate>
            </h2>
            <p className={styles.lead}>
              <Translate id="home.blog.lead">
                Why the runtime boundary matters and how we’re building it.
              </Translate>
            </p>
            <div
              className={styles.ctaRow}
              style={{justifyContent: 'center', marginTop: '1.25rem'}}
            >
              <Link className={styles.btnGhost} to="/blog">
                <Translate id="home.blog.cta">Read the blog →</Translate>
              </Link>
            </div>
          </div>
        </section>
        <FinalCTA />
      </main>
    </Layout>
  );
}
