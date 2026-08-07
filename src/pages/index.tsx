import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  Hero,
  Problem,
  TrustStrip,
  ThreeSteps,
  Outcomes,
  Proof,
  CurrentPosition,
  StartByRole,
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
 * Agent Assembly landing page.
 *
 * Section order is AAASM-5585's: problem, governed decision, outcome, proof.
 * It is a reading order, not a menu — each section is the precondition for the
 * next, and the Epic's comprehension tests are graded against the prefixes.
 *
 *   1. Hero            — 5 seconds: the promise's headline plus the boundary
 *                        clause that makes it a product claim rather than a
 *                        category description. Non-severable; keep both above
 *                        the fold.
 *   2. TrustStrip      — OSS credibility signals before any deeper ask (§4.5).
 *   3. Problem         — 15 seconds: the flagship risk, its boundary clause on
 *                        the same screen, and the three supporting threats.
 *   4. ThreeSteps      — the product in plain language, BEFORE any
 *                        implementation path. `#architecture`, tracked (§5.2).
 *   5. Outcomes        — what a decision can be, and which component makes it.
 *                        `#security`, tracked (§5.2).
 *   6. Proof           — 60 seconds, first half: what a reader can check, and
 *                        what this page declines to claim yet.
 *   7. CurrentPosition — 60 seconds, second half: default posture, platform
 *                        position, maturity, known limits.
 *   8. StartByRole     — the audience router. AAASM-5594 records `/` as the
 *                        `evaluator` L1 entry contingent on this ticket
 *                        actually routing by audience; this is that routing.
 *   9. InstallBlock    — HORO-44 tabbed picker over command_type vocabulary.
 *  10. NextSteps       — HORO-44 docs/examples/repo/SDK outbound row.
 *  11. From the blog   — same-hostname, no UTM.
 *  12. FinalCTA        — dominant CTA repeats at page bottom.
 *
 * `#security` and `#architecture` must keep resolving on this route. A URL
 * fragment is never sent to the server, so no redirect or `_headers` rule can
 * catch one that moves — the link breaks silently instead of 404ing.
 */
export default function Home(): ReactNode {
  return (
    /*
     * A <title> and a description are metadata surfaces: non-severability
     * cannot reach them, and there is no room for a boundary clause beside
     * them. Two rules apply and they point the same way.
     *
     * risk-scenarios.md forbids ANY scenario sentence here, and sends metadata
     * to product-promise.md's headline instead — whose indefinite article ("an
     * AI agent", never "your AI agents") was chosen so it survives being quoted
     * alone. The description then carries the promise verbatim, which is
     * self-bounding: the routing clause is inside the sentence.
     *
     * The previous description named the SDK / proxy / kernel pipeline, which
     * is ADR 0033 forbidden design 1 in the one place a search result quotes.
     */
    <Layout
      title={translate({
        id: 'home.meta.title',
        message: 'Decide what an AI agent may do — before it does it',
      })}
      description={translate({
        id: 'home.meta.description',
        message:
          'Agent Assembly decides whether an AI agent’s action is allowed before that action runs — on the paths you route through it — and records what was decided, so a risky call can be refused, or blocked pending a decision, instead of discovered afterwards.',
      })}
    >
      <DraftLocaleBanner />
      <Hero />
      <main>
        <TrustStrip />
        <Problem />
        <ThreeSteps />
        <Outcomes />
        <Proof />
        <CurrentPosition />
        <StartByRole />
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
