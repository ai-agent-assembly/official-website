import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import {ROLE_BRIEFS, rolePath} from '@site/src/components/roles/briefs';
import narrative from '@site/src/pages/narrative.module.css';
import styles from '@site/src/components/roles/styles.module.css';

/*
 * AAASM-5587 — `/roles`, the chooser the four evaluator entry pages sit under.
 *
 * WHY THERE IS A CHOOSER AT ALL
 * -----------------------------
 * AAASM-5594's navbar budget does not move: three items left, three right, six
 * total, and at narrow widths that collapses into a drawer which is a vertical
 * list of the same items. Four more top-level entries would make that drawer
 * ten items long. So the role routes are somewhere a reader is routed TO, and
 * this page is the one destination a single link can point at — the homepage's
 * role router links here, and AAASM-5596 can add one footer entry rather than
 * four.
 *
 * WHAT THIS PAGE DELIBERATELY DOES NOT DO
 * ---------------------------------------
 * It carries no capability sentence. Every claim about what the product does
 * belongs to the shared claim register, and a claim restated on an index page
 * is a claim that can drift from the four pages it indexes. What a reader gets
 * here is the job each brief ends in — which is what they are choosing between
 * — and nothing about the product itself.
 *
 * It also does not rank the four. The order is the register's publication
 * order, and the grid gives each the same weight, because a reader arriving
 * here already knows which one they are.
 */
export default function RolesIndex(): ReactNode {
  return (
    /*
     * A metadata surface has no room for a bound beside it, so the description
     * is the product promise verbatim — self-bounding, with its routing clause
     * inside the sentence — exactly as `/`, `/product` and the four role pages
     * carry it. The title is a plain label and asserts nothing.
     */
    <Layout
      title={translate({
        id: 'roles.index.meta.title',
        message: 'Evaluator briefs by role — Agent Assembly',
      })}
      description={translate({
        id: 'roles.index.meta.description',
        message:
          'Agent Assembly decides whether an AI agent’s action is allowed before that action runs — on the paths you route through it — and records what was decided, so a risky call can be refused, or blocked pending a decision, instead of discovered afterwards.',
      })}
    >
      <div className={narrative.wrap}>
        <div className={narrative.kicker}>
          <Translate id="roles.index.kicker">Evaluator briefs</Translate>
        </div>
        <h1 className={narrative.title}>
          <Translate id="roles.index.title">
            The same product, read from four jobs
          </Translate>
        </h1>
        <p className={narrative.intro}>
          <Translate id="roles.index.intro">
            Four readers ask four different questions of the same system. Each
            brief below answers one of them end to end — what is going wrong
            today, what Agent Assembly does about it, how far each answer
            reaches, what it does not cover, and what to read next.
          </Translate>
        </p>
        {/*
         * The consistency promise, stated on the page rather than only in the
         * source. It is the reason these are four pages and not four pitches,
         * and an evaluator who reads two of them is entitled to know that the
         * agreement between them is mechanical rather than editorial.
         */}
        <p className={narrative.lede}>
          <Translate id="roles.index.lede">
            They are not four independent documents. Every capability sentence
            in all four is quoted from one shared claim register, with the bound
            that travels with it — so two of these pages cannot describe the
            same control at two different strengths. A brief may leave an entry
            out; it may not restate one more weakly.
          </Translate>
        </p>

        <div className={styles.chooserGrid}>
          {ROLE_BRIEFS.map((b) => (
            <div key={b.slug} className={narrative.card}>
              <h2 className={narrative.cardTitle}>{b.name}</h2>
              <p className={narrative.cardText}>{b.job}</p>
              <p className={styles.chooserJob}>
                <Translate id="roles.index.audienceLabel">
                  Written for
                </Translate>{' '}
                <code>{b.audience}</code>
              </p>
              <Link className={narrative.link} to={rolePath(b.slug)}>
                <Translate id="roles.index.read">Read the brief →</Translate>
              </Link>
            </div>
          ))}
        </div>

        <p className={narrative.sectionFoot}>
          <Translate id="roles.index.notYours">
            None of these your job? The product page is the same material
            without a role attached.
          </Translate>{' '}
          <Link className={narrative.link} to="/product">
            <Translate id="roles.index.productLink">
              What the product is →
            </Translate>
          </Link>
        </p>

        <div className={narrative.ctaRow}>
          <Link className={narrative.btnPrimary} to="/product">
            <Translate id="roles.index.cta.product">
              What the product is →
            </Translate>
          </Link>
          <Link className={narrative.btnGhost} to="/how-it-works">
            <Translate id="roles.index.cta.howItWorks">How it works</Translate>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
