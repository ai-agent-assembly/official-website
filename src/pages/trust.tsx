import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import {TrackedLink} from '@site/src/components/Tracked';
import {DOCS_URL} from '@site/src/generated/site-urls';
import {
  PROVENANCE,
  TOTALS,
  TERMS,
  DOMAINS,
  PLATFORMS,
} from '@site/src/generated/trust-evidence';
import narrative from './narrative.module.css';
import styles from './trust.module.css';

/*
 * AAASM-5588 — `/trust`, the evidence surface.
 *
 * WHAT THIS PAGE IS FOR
 * ---------------------
 * One public place where an evaluator can settle what is measured, what is
 * prevented, which platforms and paths apply, and what is outside the boundary,
 * without reading source code and without asking anyone.
 *
 * WHY ALMOST EVERY NUMBER HERE IS GENERATED
 * -----------------------------------------
 * `governance/capability-manifest.yaml` in `agent-assembly` is ADR 0034's layer
 * T2. This site is T6 — the second-weakest of the seven truth layers, four
 * below the manifest — so it "may simplify an approved lower-layer fact. It may
 * never broaden it" (ADR 0034 Decision 2).
 *
 * A page that restates T2 in hand-written prose broadens it by accident within
 * one release. AAASM-5587 measured that happening four separate times inside
 * the branch that introduced its copy, every one mechanically detectable and
 * none mechanically detected, because nothing compared the two artifacts.
 *
 * So the tables below render `src/generated/trust-evidence.ts`, which is
 * generated from the manifest by `scripts/trust-evidence.py`, and two checks
 * keep the loop closed:
 *
 *   pnpm trust:check      the built page still renders the projection
 *   pnpm trust:upstream   the projection still matches the published manifest
 *
 * Editing a number in this file without editing the manifest turns the first
 * one red. That is the point of it.
 *
 * WHY IT PUBLISHES COUNTS RATHER THAN CAPABILITY SENTENCES
 * --------------------------------------------------------
 * ADR 0034 §2.3: "An omitted dimension is read at the broadest value admissible
 * for that dimension — unless the claim carries a resolvable claim or
 * capability identifier in the same block." A prose capability sentence on a
 * marketing page, with no row id beside it, asserts every platform, every
 * channel and the top of every strength ordering.
 *
 * This page therefore makes very few capability claims of its own. It reports
 * what the manifest records — "36 of 80 rows carry `coverage: unmeasured`" —
 * which is an exact statement about the manifest rather than a claim about the
 * product, and it resolves against the manifest itself. The one table that does
 * speak per capability is the platform table, and every row of it carries its
 * manifest id, which is what §2.3 asks for.
 *
 * A count also has no selection step. There is no arrangement of these tables
 * in which a weaker row is quietly left out, because nothing is chosen.
 *
 * THREE THINGS AN EDITOR MUST NOT DO HERE
 * ---------------------------------------
 *   1. Do not drop a claim term because no row reaches it. All eleven ADR 0033
 *      §6 terms render, including the two at zero. A term shown only where
 *      something carries it disappears exactly when its absence is the fact
 *      worth publishing — and "no manifest row reaches Approval required" is
 *      the single most consequential sentence on this page about that term.
 *   2. Do not translate a manifest field value. `unmeasured`,
 *      `shipped_crates_io_only` and the row ids render verbatim in every
 *      locale, because the drift check reads the English build only and a
 *      translated copy of a T2 value is a second copy nothing compares. The
 *      eleven §6 TERM names are the exception: the site already publishes a
 *      zh-Hant glossary for them on five other routes, so they go through
 *      `<Translate>` and their English default is what the check binds.
 *   3. Do not add a compliance, SLA, region, DPA/BAA or data-residency
 *      statement. None is approved, and the section that says so is content on
 *      this page rather than a disclaimer under it.
 */

// ---------------------------------------------------------------------------
// Page identity — AC5. Owner, version, last verified, canonical links.
// ---------------------------------------------------------------------------

/*
 * The page's own version, and it is the page's, not the product's.
 *
 * Separate from `PROVENANCE.fixVersion` on purpose: that is the release the
 * manifest survey was filed against, and conflating "when this page last
 * changed" with "which release the evidence describes" is how a stale page
 * reads as a current one.
 */
const PAGE_VERSION = '1.0.0';
const PAGE_TICKET = 'AAASM-5588';
const PAGE_OWNER = 'Pioneer';

/*
 * When the page was last checked against its sources by a human.
 *
 * A separate fact from `PROVENANCE.evidenceDate`, which is when the manifest
 * survey was taken. Both are published, because a reader needs to know that the
 * page is current AND that the evidence behind it may not be.
 */
const LAST_VERIFIED = '2026-08-14';

const UTM =
  'utm_source=product_site&utm_medium=docs_link&utm_campaign=agent_assembly_launch';
const hub = (page: string): string => `${DOCS_URL}/${page}?${UTM}`;

const REPO = 'https://github.com/ai-agent-assembly/agent-assembly';
const CAPABILITY_MANIFEST = `${REPO}/blob/HEAD/governance/capability-manifest.yaml`;
const ADR_0033 = `${REPO}/blob/HEAD/docs/src/adr/0033-canonical-governance-and-enforcement-architecture.md`;
const CLAIM_VOCABULARY = `${REPO}/blob/HEAD/docs/src/development/claim-vocabulary.md`;
const ADVISORIES = `${REPO}/security/advisories`;
const ARENA_REPO = 'https://github.com/ai-agent-assembly/arena';
const SECURITY_MODEL = hub('security-model.html');
const ROLE_NARRATIVES = hub('role-narratives.html');

/** A cross-hostname destination. Carries UTM per HORO-47 §5.2 and opens away. */
function Out({
  to,
  children,
  className,
}: {
  readonly to: string;
  readonly children: ReactNode;
  readonly className?: string;
}): ReactNode {
  return (
    <TrackedLink
      className={className}
      eventName="cta_view_docs_click"
      ctaLocation="body"
      targetProduct="docs"
      alsoFire={['docs_click']}
      to={to}
      linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
    >
      {children}
    </TrackedLink>
  );
}

/** A value quoted verbatim from the manifest. Never translated — see the header. */
function Manifest({value}: {readonly value: string}): ReactNode {
  return <span className={styles.mono}>{value}</span>;
}

// ---------------------------------------------------------------------------
// The eleven ADR 0033 §6 terms
// ---------------------------------------------------------------------------

/*
 * Term name and evidence requirement, per ADR 0033 §6's own table.
 *
 * The `Means` column of §6 is compressed into one line per term; the `Evidence
 * required` column is quoted. Compression is allowed here and broadening is not
 * — every line below is at or below its §6 row, never above it — and the term
 * NAME is what the drift check binds, so a rewrite of the gloss cannot change
 * which term a reader is being shown.
 *
 * Keyed by the manifest's own `coverage` token so the map cannot fall out of
 * step with the generated data: `TERMS` is `as const`, so a token added or
 * renamed upstream fails the build here rather than rendering a blank cell.
 */
type TermToken = (typeof TERMS)[number]['token'];

const TERM_NAME: Record<TermToken, ReactNode> = {
  observed: <Translate id="trust.term.observed">Observed</Translate>,
  detected: <Translate id="trust.term.detected">Detected</Translate>,
  evaluated: <Translate id="trust.term.evaluated">Evaluated</Translate>,
  denied_before_execution: (
    <Translate id="trust.term.denied">Denied before execution</Translate>
  ),
  redacted: <Translate id="trust.term.redacted">Redacted</Translate>,
  approval_required: (
    <Translate id="trust.term.approval">Approval required</Translate>
  ),
  degraded: <Translate id="trust.term.degraded">Degraded</Translate>,
  unmeasured: <Translate id="trust.term.unmeasured">Unmeasured</Translate>,
  experimental: (
    <Translate id="trust.term.experimental">Experimental</Translate>
  ),
  planned: <Translate id="trust.term.planned">Planned</Translate>,
  unsupported: <Translate id="trust.term.unsupported">Unsupported</Translate>,
};

const TERM_MEANS: Record<TermToken, ReactNode> = {
  observed: (
    <Translate id="trust.means.observed">
      An event reached the evidence pipeline. It never shows that the action was
      stopped.
    </Translate>
  ),
  detected: (
    <Translate id="trust.means.detected">
      A pattern of interest was found in observed material, with the detector
      named. A finding entails no decision.
    </Translate>
  ),
  evaluated: (
    <Translate id="trust.means.evaluated">
      The control plane produced a decision for this action. Reaching a refusal
      additionally needs a caller that waits for the answer and honours it.
    </Translate>
  ),
  denied_before_execution: (
    <Translate id="trust.means.denied">
      The action did not take effect, and the decision preceded the effect. The
      term names the component that refused, not the one that decided.
    </Translate>
  ),
  redacted: (
    <Translate id="trust.means.redacted">
      The action proceeded with content removed, and the record names the
      fields. Where the redactor sits in the pipeline is the bound.
    </Translate>
  ),
  approval_required: (
    <Translate id="trust.means.approval">
      The action was held pending a human decision, evidenced by a pending
      approval record.
    </Translate>
  ),
  degraded: (
    <Translate id="trust.means.degraded">
      A planned control is configured but unavailable, so the achieved level is
      below the planned level. It carries both levels or it is not this term.
    </Translate>
  ),
  unmeasured: (
    <Translate id="trust.means.unmeasured">
      No control inspected this action or payload; nothing is known about it. It
      is scoped to the action or payload — a connection-level observation may
      still exist for the same traffic.
    </Translate>
  ),
  experimental: (
    <Translate id="trust.means.experimental">
      Implemented but not validated for production use, with the missing
      validation named.
    </Translate>
  ),
  planned: (
    <Translate id="trust.means.planned">
      Decided but not implemented. It carries a ticket reference and no
      capability claim.
    </Translate>
  ),
  unsupported: (
    <Translate id="trust.means.unsupported">
      Not available on this platform or configuration, with no plan asserted.
      Unsupported for one element is not Unsupported for the product.
    </Translate>
  ),
};

/** The count beside a term. A zero is rendered louder, not quieter. */
function Count({rows}: {readonly rows: number}): ReactNode {
  return (
    <span className={`${styles.count} ${rows === 0 ? styles.zero : ''}`}>
      {rows}
    </span>
  );
}

export default function Trust(): ReactNode {
  return (
    <Layout
      title={translate({
        id: 'trust.meta.title',
        message: 'Trust, evidence and known limitations — Agent Assembly',
      })}
      description={translate({
        id: 'trust.meta.description',
        message:
          'What Agent Assembly measures, what it prevents, on which platforms, and what sits outside the boundary — generated from the capability manifest and checked against it.',
      })}
    >
      <div className={narrative.wrap}>
        <div className={narrative.kicker}>
          <Translate id="trust.kicker">Trust and evidence</Translate>
        </div>
        <h1 className={narrative.title}>
          <Translate id="trust.title">
            What is measured, what is prevented, and what is neither
          </Translate>
        </h1>
        <p className={narrative.lede}>
          <Translate id="trust.lede">
            This page exists so you can settle the protection boundary without
            reading the source. Every number on it is generated from the
            capability manifest — the survey that records, row by row, what was
            checked and what was found — and a check in this repository fails if
            this page and that manifest stop agreeing.
          </Translate>
        </p>

        {/*
         * AC5 — owner, version, last-verified date and canonical links, at the
         * top rather than in a footer. A reader deciding how much weight to put
         * on the tables below needs to know how old they are before reading
         * them.
         */}
        <dl className={styles.meta}>
          <div className={styles.metaPair}>
            <dt className={styles.metaLabel}>
              <Translate id="trust.meta.owner">Owner</Translate>
            </dt>
            <dd className={styles.metaValue}>
              {PAGE_OWNER} · <Manifest value={PAGE_TICKET} />
            </dd>
          </div>
          <div className={styles.metaPair}>
            <dt className={styles.metaLabel}>
              <Translate id="trust.meta.version">Page version</Translate>
            </dt>
            <dd className={styles.metaValue}>
              <Manifest value={PAGE_VERSION} />
            </dd>
          </div>
          <div className={styles.metaPair}>
            <dt className={styles.metaLabel}>
              <Translate id="trust.meta.verified">Last verified</Translate>
            </dt>
            <dd className={styles.metaValue}>
              <Manifest value={LAST_VERIFIED} />
            </dd>
          </div>
          <div className={styles.metaPair}>
            <dt className={styles.metaLabel}>
              <Translate id="trust.meta.source">Source of truth</Translate>
            </dt>
            <dd className={styles.metaValue}>
              <Out to={CAPABILITY_MANIFEST} className={narrative.link}>
                <Translate id="trust.meta.sourceLink">
                  capability-manifest.yaml
                </Translate>
              </Out>{' '}
              <Manifest value={`v${PROVENANCE.manifestVersion}`} />
            </dd>
          </div>
        </dl>

        {/* ---------------------------------------------------------------
         * Evidence freshness. Before the tables, not after them.
         * --------------------------------------------------------------- */}
        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="trust.fresh.eyebrow">Evidence freshness</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="trust.fresh.title">
              How old these numbers are, and what they describe
            </Translate>
          </h2>
          <p className={narrative.p}>
            <Translate
              id="trust.fresh.body"
              values={{
                rows: TOTALS.rows,
                date: <Manifest value={PROVENANCE.evidenceDate} />,
                tree: <Manifest value={PROVENANCE.evidenceTree.slice(0, 12)} />,
              }}
            >
              {
                'Every figure below comes from one survey of {rows} capability rows, taken on {date} against the tree {tree}.'
              }
            </Translate>
          </p>
          <p className={styles.freshness}>
            <strong className={styles.freshnessTitle}>
              <Translate id="trust.fresh.calloutTitle">
                The evidence describes the development branch, not a release.
              </Translate>
            </strong>
            <Translate
              id="trust.fresh.callout"
              values={{
                tree: <Manifest value={PROVENANCE.evidenceTree.slice(0, 9)} />,
              }}
            >
              {
                'The surveyed tree {tree} is an ancestor of no released tag — it sits 2,788 commits ahead of v0.0.1-rc.6 — so the manifest records that every row is Unmeasured for any released reference until it is re-derived at that tag. Read this page as describing the development branch. If you are evaluating a published build, the honest answer for any row is that it has not been measured there.'
              }
            </Translate>
          </p>
          <p className={narrative.p}>
            <Translate
              id="trust.fresh.gaps"
              values={{
                gap: <Count rows={TOTALS.gapOnly} />,
                rows: TOTALS.rows,
                located: <Count rows={TOTALS.withLocatedTest} />,
                unlocated: <Count rows={TOTALS.withUnlocatedTest} />,
              }}
            >
              {
                'Of those {rows} rows, {gap} carry no test at all — their evidence is recorded as a gap. {located} carry at least one test the manifest can point to by path and {unlocated} name a test suite without one; those two sets overlap by a single row, so they do not add up to the remainder. A gap row is published here as a gap, which is what the manifest requires of any surface that renders it.'
              }
            </Translate>
          </p>
        </section>

        {/* ---------------------------------------------------------------
         * The claim vocabulary. All eleven terms, including the two zeroes.
         * --------------------------------------------------------------- */}
        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="trust.terms.eyebrow">How to read a state</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="trust.terms.title">
              The eleven states a capability can be in
            </Translate>
          </h2>
          <p className={narrative.p}>
            <Translate
              id="trust.terms.lead"
              values={{
                adr: (
                  <Out to={ADR_0033} className={narrative.link}>
                    <Translate id="trust.terms.adrLink">ADR 0033 §6</Translate>
                  </Out>
                ),
              }}
            >
              {
                'A governance claim is incomplete without its timing and its posture, so {adr} defines exactly eleven terms and requires every surface to pick one of them rather than an undifferentiated verb like "protects" or "enforces". All eleven are listed here, with the number of manifest rows that reach each. Two are reached by no row at all, and those two rows are the ones worth reading first.'
              }
            </Translate>
          </p>
          <div className={narrative.tableWrap}>
            <table className={narrative.table}>
              <thead>
                <tr>
                  <th scope="col">
                    <Translate id="trust.terms.colTerm">Claim term</Translate>
                  </th>
                  <th scope="col">
                    <Translate id="trust.terms.colRows">
                      Manifest rows
                    </Translate>
                  </th>
                  <th scope="col">
                    <Translate id="trust.terms.colMeans">
                      What it means, and where it stops
                    </Translate>
                  </th>
                </tr>
              </thead>
              <tbody>
                {TERMS.map((t) => (
                  <tr key={t.token}>
                    <th scope="row">
                      <span className={narrative.termBadge}>
                        {TERM_NAME[t.token]}
                      </span>
                    </th>
                    <td>
                      <Count rows={t.rows} />
                    </td>
                    <td>{TERM_MEANS[t.token]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={narrative.p}>
            <Translate id="trust.terms.zeroes">
              No manifest row reaches Approval required. The hold itself exists
              in the gateway path and fails closed on timeout, but no shipped
              operator surface can answer it, so a request that waits for a
              person is refused rather than reviewed — tracked as AAASM-5657. No
              row carries Planned either: Planned is decided-but-not-implemented
              and carries a ticket rather than a capability, so it describes
              roadmap items and not survey results.
            </Translate>
          </p>
        </section>

        {/* ---------------------------------------------------------------
         * Distribution by area.
         * --------------------------------------------------------------- */}
        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="trust.areas.eyebrow">Coverage</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="trust.areas.title">
              What the survey found, area by area
            </Translate>
          </h2>
          <p className={narrative.p}>
            <Translate id="trust.areas.lead">
              Each area below is every manifest row in it, with no row omitted
              and none chosen — so the mix of states in a row of this table is
              the mix in the survey. Read the distribution, not the strongest
              term in it: an area that reaches a refusal on three rows and is
              unmeasured on six is not a governed area with a caveat.
            </Translate>
          </p>
          <div className={narrative.tableWrap}>
            <table className={narrative.table}>
              <thead>
                <tr>
                  <th scope="col">
                    <Translate id="trust.areas.colArea">Area</Translate>
                  </th>
                  <th scope="col">
                    <Translate id="trust.areas.colRows">Rows</Translate>
                  </th>
                  <th scope="col">
                    <Translate id="trust.areas.colIds">Manifest ids</Translate>
                  </th>
                  <th scope="col">
                    <Translate id="trust.areas.colDist">
                      How those rows are classified
                    </Translate>
                  </th>
                </tr>
              </thead>
              <tbody>
                {DOMAINS.map((d) => (
                  <tr key={d.domain}>
                    <th scope="row">
                      <Manifest value={d.domain} />
                    </th>
                    <td>
                      <Count rows={d.rows} />
                    </td>
                    <td>
                      <Manifest value={d.ids} />
                    </td>
                    <td>
                      <ul className={styles.dist}>
                        {d.terms.map((t) => (
                          <li key={t.token} className={styles.distItem}>
                            <span className={styles.distCount}>{t.rows}</span>
                            {TERM_NAME[t.token]}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------------------------------------------------------------
         * Platform separation — the one per-capability table, ids carried.
         * --------------------------------------------------------------- */}
        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="trust.platform.eyebrow">Platforms</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="trust.platform.title">
              Host-level controls, separated by platform
            </Translate>
          </h2>
          <p className={narrative.p}>
            <Translate id="trust.platform.lead">
              Host-level interception is the part of this product that differs
              most by platform, so it is not summarised into one answer. These
              are the manifest&rsquo;s own four platform rows. Reachability and
              default state are printed beside each one because a support table
              without them asserts that something is available when nothing
              ships it.
            </Translate>
          </p>
          <div className={narrative.tableWrap}>
            <table className={narrative.table}>
              <thead>
                <tr>
                  <th scope="col">
                    <Translate id="trust.platform.colId">
                      Manifest row
                    </Translate>
                  </th>
                  <th scope="col">
                    <Translate id="trust.platform.colCap">Capability</Translate>
                  </th>
                  <th scope="col">
                    <Translate id="trust.platform.colState">State</Translate>
                  </th>
                  <th scope="col">
                    <Translate id="trust.platform.colReach">
                      How you get it
                    </Translate>
                  </th>
                  <th scope="col">
                    <Translate id="trust.platform.colDefault">
                      Default
                    </Translate>
                  </th>
                </tr>
              </thead>
              <tbody>
                {PLATFORMS.map((p) => (
                  <tr key={p.id}>
                    <th scope="row">
                      <Manifest value={p.id} />
                    </th>
                    <td>
                      <Manifest value={p.capability} />
                    </td>
                    <td>
                      <span className={narrative.termBadge}>
                        {TERM_NAME[p.coverage]}
                      </span>
                    </td>
                    <td>
                      <Manifest value={p.reachability} />
                    </td>
                    <td>
                      <Manifest value={p.defaultState} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={narrative.p}>
            <Translate id="trust.platform.note">
              Two readings of this table are wrong and both are common. Windows
              has no local mediation of any kind, so its row is not a weaker
              version of the others — there is no mechanism to configure. And a
              row marked Unsupported for host-level interception says nothing
              about transport mediation on that platform: on macOS the proxy is
              reachable, through cargo install only, while host-level
              interception does not exist there at all.
            </Translate>
          </p>
        </section>

        {/* ---------------------------------------------------------------
         * Audit. Append-only and tamper-evident are different claims.
         * --------------------------------------------------------------- */}
        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="trust.audit.eyebrow">Audit</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="trust.audit.title">
              What the audit chain proves, and what it does not
            </Translate>
          </h2>
          {/*
           * The distinction this section exists for. `tamper-evident`,
           * `append-only` and `immutable` are three different claims and the
           * product makes exactly one of them. "immutable audit" is a banned
           * absolute — ADR 0033 forbidden design 7, never waivable — and the
           * repository's claim gate fails the build on it, so the wording below
           * is the approved framing from the docs hub rather than a fresh one.
           */}
          <p className={narrative.p}>
            <Translate id="trust.audit.evident">
              The per-session log is hash-chained: each entry carries an unkeyed
              SHA-256 digest over its own fields plus the previous
              entry&rsquo;s, and aasm audit verify-chain re-walks it. That makes
              careless alteration detectable. It is tamper-evident, and it is
              neither tamper-proof nor immutable — the digest is unkeyed, so it
              is not a signature and anyone able to rewrite the sink can
              recompute it.
            </Translate>
          </p>
          <p className={narrative.p}>
            <Translate id="trust.audit.appendOnly">
              Append-only is a separate claim, and a weaker one here: the log is
              append-only by convention rather than by constraint, because
              retention pruning deletes rows. The chain also covers the JSONL
              sink only — the database mirror stores no chain metadata.
            </Translate>
          </p>
          <ul className={narrative.limitList}>
            <li>
              <Translate id="trust.audit.limit1">
                Emission is best-effort. The chain head advances before the
                entry is sent, and a full channel drops it while the call still
                reports success — so a dropped entry is indistinguishable from a
                deleted one, and an emptied log verifies clean.
              </Translate>
            </li>
            <li>
              <Translate id="trust.audit.limit2">
                Whether a given decision durably reaches the chain is not
                established by any manifest row. The one row on the subject
                covers what happens when the write fails, and it carries
                unmeasured, fail_open and an evidence gap.
              </Translate>
            </li>
            <li>
              <Translate id="trust.audit.limit3">
                An audit event shows that something was observed. It never shows
                that the action was stopped.
              </Translate>
            </li>
          </ul>
        </section>

        {/* ---------------------------------------------------------------
         * Outside the boundary.
         * --------------------------------------------------------------- */}
        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="trust.outside.eyebrow">
              Outside the boundary
            </Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="trust.outside.title">
              What this page does not claim
            </Translate>
          </h2>
          <ul className={narrative.limitList}>
            <li>
              <Translate id="trust.outside.compliance">
                No compliance position, service-level agreement, hosting region,
                DPA or BAA is offered anywhere on this site. None is approved,
                so nothing here should be read as one — including by omission.
              </Translate>
            </li>
            <li>
              <Translate id="trust.outside.maturity">
                The open-source runtime is pre-1.0 and released as a pre-release
                series. The managed service is planned — decided, not built — so
                nothing on this site is a commitment to an availability date, a
                region, an SLA or a compliance position.
              </Translate>
            </li>
            <li>
              <Translate id="trust.outside.path">
                Governance applies to the paths you route through Agent
                Assembly. An agent launched outside those paths is not a weakly
                governed agent; it is an ungoverned one, and the manifest
                records that an unmanaged launch is not detectable.
              </Translate>
            </li>
            <li>
              <Translate id="trust.outside.unmeasured">
                Where a state is unmeasured it is printed as unmeasured. It is
                not softened into a supported state, and it is not left out —
                missing evidence lowers a state and never raises it.
              </Translate>
            </li>
          </ul>
        </section>

        {/* ---------------------------------------------------------------
         * Where to check it yourself.
         * --------------------------------------------------------------- */}
        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="trust.check.eyebrow">Check it yourself</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="trust.check.title">
              The sources this page is derived from
            </Translate>
          </h2>
          <ul className={narrative.list}>
            {/*
             * First in the list, and the only same-hostname entry.
             *
             * Everything else here is a document a reader must take on its own
             * terms. This one is a run: it is the single item on this page
             * whose claim was settled by watching for an effect rather than by
             * reading an assertion, so it is what an evaluator should open
             * first. AAASM-5589.
             */}
            <li>
              <Link to="/denied-action-proof" className={narrative.link}>
                <Translate id="trust.check.denied">
                  The denied-action proof
                </Translate>
              </Link>{' '}
              <Translate id="trust.check.deniedNote">
                — one recorded run in which a refused tool call left no trace of
                the file its body writes, checked afterwards by a separate
                process, with the two control runs that make that absence a
                measurement. One tool, one path, one version.
              </Translate>
            </li>
            <li>
              <Out to={CAPABILITY_MANIFEST} className={narrative.link}>
                <Translate id="trust.check.manifest">
                  The capability manifest
                </Translate>
              </Out>{' '}
              <Translate id="trust.check.manifestNote">
                — every row behind every number on this page, with its evidence,
                its known bypasses and the boundary it holds within.
              </Translate>
            </li>
            <li>
              <Out to={ADR_0033} className={narrative.link}>
                <Translate id="trust.check.adr">
                  ADR 0033 — governance and enforcement architecture
                </Translate>
              </Out>{' '}
              <Translate id="trust.check.adrNote">
                — the claim vocabulary, the platform matrix and the designs the
                product forbids itself.
              </Translate>
            </li>
            <li>
              <Out to={CLAIM_VOCABULARY} className={narrative.link}>
                <Translate id="trust.check.vocab">
                  The claim vocabulary and prohibited absolutes
                </Translate>
              </Out>{' '}
              <Translate id="trust.check.vocabNote">
                — the wording each term licenses per surface, and the phrases no
                surface may publish.
              </Translate>
            </li>
            <li>
              <Out to={SECURITY_MODEL} className={narrative.link}>
                <Translate id="trust.check.security">
                  The security model
                </Translate>
              </Out>{' '}
              <Translate id="trust.check.securityNote">
                — the threat model these controls are answering.
              </Translate>
            </li>
            <li>
              <Out to={ROLE_NARRATIVES} className={narrative.link}>
                <Translate id="trust.check.register">
                  The shared claim register
                </Translate>
              </Out>{' '}
              <Translate id="trust.check.registerNote">
                — sixteen numbered claims, each with the term it reaches and the
                bound that limits it. The role briefs on this site quote it.
              </Translate>
            </li>
            <li>
              <Out to={ARENA_REPO} className={narrative.link}>
                <Translate id="trust.check.arena">Arena</Translate>
              </Out>{' '}
              <Translate id="trust.check.arenaNote">
                — adversarial trials run against the governance path, with a
                report per match.
              </Translate>
            </li>
            <li>
              <Out to={ADVISORIES} className={narrative.link}>
                <Translate id="trust.check.advisories">
                  Security advisories
                </Translate>
              </Out>{' '}
              <Translate id="trust.check.advisoriesNote">
                — published disclosures for the core repository.
              </Translate>
            </li>
          </ul>
        </section>

        <div className={narrative.ctaRow}>
          <Link className={narrative.btnPrimary} to="/roles">
            <Translate id="trust.cta.roles">
              Read the brief for your role →
            </Translate>
          </Link>
          <Link className={narrative.btnGhost} to="/how-it-works">
            <Translate id="trust.cta.how">How it works</Translate>
          </Link>
          <Link className={narrative.btnGhost} to="/product">
            <Translate id="trust.cta.product">What the product is</Translate>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
