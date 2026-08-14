import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import {TrackedLink} from '@site/src/components/Tracked';
import type {RoleBrief, ProofLink, NextStep} from './types';
import {ROLE_BRIEFS, rolePath} from './briefs';
import {ROLE_NARRATIVES} from './briefs/shared';
import narrative from '@site/src/pages/narrative.module.css';
import styles from './styles.module.css';

/*
 * AAASM-5587 — the layout every evaluator entry page renders through.
 *
 * There is one layout rather than four pages because the briefs' own rule is
 * that a reader must be able to work the same sequence on any of them: pain,
 * trigger, intervention, outcome, proof, limitations, next. A per-page layout
 * would let one role's page quietly lose a section, and the section a layout
 * pass drops first is Limitations — the one that decides whether the page
 * survives contact with an evaluator.
 *
 * `narrative.module.css` is imported rather than copied. These are narrative
 * routes and they should look like `/product` and `/how-it-works`, so the
 * shared primitives stay in the one stylesheet that owns them; only what is new
 * to a role surface lives in the local module.
 *
 * Two things this component enforces that a page author could otherwise get
 * wrong, and both are ADR 0034 broadening in practice:
 *
 *   - A claim renders through one path, and that path always emits the term and
 *     always emits the bound. `Claim` makes both required, so there is no way
 *     to render a register sentence stripped of what limits it.
 *   - The `<title>` and the meta description never take a capability sentence.
 *     A metadata surface has no room for a bound beside it, so the description
 *     is the product promise verbatim — a sentence written to be self-bounding,
 *     with its routing clause inside it — and the title is a plain label. This
 *     is the same rule and the same sentence `/` and `/product` already use, so
 *     a reader arriving from either does not meet a second promise.
 */

/**
 * The promise, translated.
 *
 * Held here rather than imported from `/product` because `src/pages/product.tsx`
 * is AAASM-5586's file and a shared constant would put this ticket inside it;
 * the duplication is deliberate and the string is the one `product-promise.md`
 * publishes.
 *
 * It goes through `translate()` and not a bare const. A meta description is the
 * sentence a search result and a social card quote back, and a bare const ships
 * the English one on every zh-Hant route — which is exactly the failure mode
 * AAASM-5593 records for the blog, reintroduced on four new pages while `/`,
 * `/product` and `/roles` all carry the translated one.
 */
function metaDescription(): string {
  return translate({
    id: 'roles.meta.description',
    message:
      'Agent Assembly decides whether an AI agent’s action is allowed before that action runs — on the paths you route through it — and records what was decided, so a risky call can be refused, or blocked pending a decision, instead of discovered afterwards.',
  });
}

/** The switcher. The current role is rendered as text, never as a self-link. */
function RoleSwitcher({current}: {readonly current: string}): ReactNode {
  return (
    <nav
      aria-label={translate({
        id: 'roles.switcher.label',
        message: 'Evaluator roles',
      })}
    >
      <ul className={styles.switcher}>
        {ROLE_BRIEFS.map((b) => (
          <li key={b.slug} className={styles.switcherItem}>
            {b.slug === current ? (
              <span className={styles.switcherCurrent} aria-current="page">
                {b.name}
              </span>
            ) : (
              <Link className={styles.switcherLink} to={rolePath(b.slug)}>
                {b.name}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * A destination link. Cross-hostname links carry their UTM baked into `href`
 * per HORO-47 §5.2 and are tracked; same-hostname links must not carry UTM,
 * because that would overwrite the visitor's session source in GA4.
 */
function Destination({
  item,
  className,
}: {
  readonly item: ProofLink | NextStep;
  readonly className: string;
}): ReactNode {
  if (!item.external) {
    return (
      <Link className={className} to={item.href}>
        {item.label}
      </Link>
    );
  }
  return (
    <TrackedLink
      className={className}
      eventName="cta_view_docs_click"
      ctaLocation="body"
      targetProduct={item.targetProduct ?? 'docs'}
      alsoFire={['docs_click']}
      to={item.href}
      linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
    >
      {item.label}
    </TrackedLink>
  );
}

/*
 * The register is linked, not just named.
 *
 * Every page here cites entries by number, and some bounds cite an entry no
 * card on that page carries — RC15's "via RC1" on the platform page is the
 * clearest case. A number a reader cannot resolve is a citation in appearance
 * only, so the sentence introducing the register ends in a route to it.
 */
function RegisterLink(): ReactNode {
  return (
    <TrackedLink
      eventName="cta_view_docs_click"
      ctaLocation="body"
      targetProduct="docs"
      alsoFire={['docs_click']}
      to={ROLE_NARRATIVES}
      linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
    >
      <Translate id="roles.intervention.registerLink">
        the shared claim register
      </Translate>
    </TrackedLink>
  );
}

export default function RolePage({
  brief,
}: {
  readonly brief: RoleBrief;
}): ReactNode {
  return (
    <Layout title={brief.metaTitle} description={metaDescription()}>
      <main className={narrative.wrap}>
        <RoleSwitcher current={brief.slug} />

        <div className={narrative.kicker}>
          <Translate id="roles.kicker">Evaluator brief</Translate>
        </div>
        <h1 className={narrative.title}>{brief.name}</h1>

        {/*
         * The identity line. `audience` is the AAASM-5591 value this brief
         * serves, published rather than kept internal: it is how a reader
         * confirms in one glance that they are on their own page rather than
         * on the one next to it, and the four names are close enough that the
         * confirmation is worth the line.
         */}
        <dl className={styles.identity}>
          <div className={styles.identityPair}>
            <dt className={styles.identityLabel}>
              <Translate id="roles.identity.audience">Written for</Translate>
            </dt>
            <dd className={styles.identityValue}>
              <code>{brief.audience}</code>
            </dd>
          </div>
          <div className={styles.identityPair}>
            <dt className={styles.identityLabel}>
              <Translate id="roles.identity.job">
                The decision it ends in
              </Translate>
            </dt>
            <dd className={styles.identityValue}>{brief.job}</dd>
          </div>
        </dl>

        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="roles.pain.eyebrow">The pain</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="roles.pain.title">Where this starts</Translate>
          </h2>
          {brief.pain.map((p) => (
            <p key={p.key} className={narrative.p}>
              {p.text}
            </p>
          ))}
        </section>

        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="roles.trigger.eyebrow">The trigger</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="roles.trigger.title">
              What makes it this quarter’s problem
            </Translate>
          </h2>
          <p className={narrative.p}>{brief.trigger}</p>
        </section>

        {/*
         * The intervention. This is the one section where a new claim could
         * enter the site, which is why every card below is a register entry
         * rendered through `Claim` — term, quoted sentence, bound — and why the
         * bound sits on the same screen as the claim rather than behind a
         * "learn more". The register's Bound column is part of the claim.
         */}
        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="roles.intervention.eyebrow">
              What is supported
            </Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="roles.intervention.title">
              What Agent Assembly does about it — and how far each answer
              reaches
            </Translate>
          </h2>
          <p className={narrative.p}>{brief.interventionLead}</p>
          <p className={narrative.p}>
            <Translate
              id="roles.intervention.register"
              values={{register: <RegisterLink />}}
            >
              {
                'Each card below is one entry of a sixteen-entry claim register shared by all four of these pages, quoted rather than paraphrased. The term is the register’s own, copied off the evidence rather than chosen to suit the sentence; the bound beside it is part of the claim, not context for it. Every entry — including the ones this page does not cite — is published with the manifest rows behind it: {register}.'
              }
            </Translate>
          </p>
          <div className={narrative.cardGrid}>
            {brief.claims.map((c) => (
              <div key={c.rc} className={narrative.card}>
                <div className={styles.claimHead}>
                  <span
                    className={`${narrative.termBadge} ${styles.termMulti}`}
                  >
                    {c.term}
                  </span>
                  <span className={styles.rcBadge}>{c.rc}</span>
                </div>
                <p className={narrative.cardText}>{c.text}</p>
                <p className={narrative.cardBound}>
                  <span className={narrative.boundLabel}>
                    <Translate id="roles.boundLabel">
                      Where this stops.
                    </Translate>
                  </span>{' '}
                  {c.bound}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="roles.outcome.eyebrow">The outcome</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="roles.outcome.title">
              What is different after
            </Translate>
          </h2>
          {brief.outcome.map((o) => (
            <p key={o.key} className={narrative.p}>
              {o.text}
            </p>
          ))}
        </section>

        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="roles.proof.eyebrow">Proof</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="roles.proof.title">
              What you can check, and where
            </Translate>
          </h2>
          <ul className={styles.proofList}>
            {brief.proof.map((p) => (
              <li key={p.key} className={styles.proofItem}>
                <p className={styles.proofText}>{p.text}</p>
                <Destination item={p} className={narrative.link} />
              </li>
            ))}
          </ul>
        </section>

        {/*
         * Limitations is styled as content, not as fine print, and it is not
         * last. An evaluator who discovers an overstated claim after
         * provisioning is a worse outcome than one who reads an accurate limit
         * up front — so the section a disclaimer would be buried in is the one
         * this page is partly written to deliver.
         */}
        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="roles.limits.eyebrow">Limitations</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="roles.limits.title">
              What you would otherwise find out later
            </Translate>
          </h2>
          <ul className={narrative.limitList}>
            {brief.limitations.map((l) => (
              <li key={l.key}>
                <strong className={styles.limitTitle}>{l.title}</strong>
                {l.text ? (
                  <span className={styles.limitText}>{l.text}</span>
                ) : null}
                {/*
                 * Where the limitation IS a register entry, it renders through
                 * the same path a claim card does — term, quoted sentence,
                 * bound — rather than being restated in the brief's own words.
                 * A limitation is where an entry is most likely to be quietly
                 * weakened, because it reads as commentary rather than as a
                 * claim.
                 */}
                {l.entry ? (
                  <div className={styles.limitEntry}>
                    <div className={styles.claimHead}>
                      <span
                        className={`${narrative.termBadge} ${styles.termMulti}`}
                      >
                        {l.entry.term}
                      </span>
                      <span className={styles.rcBadge}>{l.entry.rc}</span>
                    </div>
                    <p className={styles.limitText}>{l.entry.text}</p>
                    <p className={narrative.cardBound}>
                      <span className={narrative.boundLabel}>
                        <Translate id="roles.boundLabel">
                          Where this stops.
                        </Translate>
                      </span>{' '}
                      {l.entry.bound}
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="roles.next.eyebrow">Next</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="roles.next.title">
              One page to read, one thing to do
            </Translate>
          </h2>
          <ul className={styles.proofList}>
            {brief.next.map((n) => (
              <li key={n.href} className={styles.proofItem}>
                <p className={styles.proofText}>{n.text}</p>
                <Destination item={n} className={narrative.link} />
              </li>
            ))}
          </ul>
        </section>

        <div className={narrative.ctaRow}>
          <Link className={narrative.btnPrimary} to="/product">
            <Translate id="roles.cta.product">What the product is →</Translate>
          </Link>
          <Link className={narrative.btnGhost} to="/how-it-works">
            <Translate id="roles.cta.howItWorks">How it works</Translate>
          </Link>
          <Link className={narrative.btnGhost} to="/roles">
            <Translate id="roles.cta.roles">The other roles</Translate>
          </Link>
        </div>
      </main>
    </Layout>
  );
}
