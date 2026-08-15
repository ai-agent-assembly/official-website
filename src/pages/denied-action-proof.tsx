import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import {TrackedLink} from '@site/src/components/Tracked';
import {
  PROVENANCE,
  SCENARIO,
  ROWS,
  DECISION,
  OBSERVER,
  RETURNED,
  TOTALS,
} from '@site/src/generated/denied-action-proof';
import narrative from './narrative.module.css';
import styles from './denied-action-proof.module.css';

/**
 * `/denied-action-proof` — one recorded run in which a policy denial kept a
 * tool body from taking effect, with the effect checked from outside.
 *
 * WHY THIS PAGE IS NOT A DEMO
 * ---------------------------
 * A `DENIED` badge is a label a page draws for itself, and a recording of one
 * is a label with production values. Neither is evidence, because neither is
 * capable of coming out the other way: the component that reports the refusal
 * is also the component being asked whether the refusal worked.
 *
 * So the scenario is built around an effect that exists outside every component
 * involved in the decision — a file the tool body writes — and the page
 * publishes what a SEPARATE OPERATING-SYSTEM PROCESS saw in that directory
 * afterwards. That process imports no product code, cannot reach the policy
 * engine or the adapter, and never sees the tool's return value.
 *
 * THE TWO CONTROLS ARE NOT DECORATION
 * -----------------------------------
 * One run showing an absent file settles nothing: a harness that never writes
 * anything produces the same listing, and so does a policy no component ever
 * consulted. `allowed` moves the policy and holds the enforcement point fixed;
 * `enforcement_removed` moves the enforcement point and holds the policy fixed.
 * The absence in `denied` is a measurement because those two came out the other
 * way. An editor removing a row from that table removes the reason to believe
 * the first one.
 *
 * FOUR THINGS AN EDITOR MUST NOT DO HERE
 * --------------------------------------
 *   1. Do not restate the run as a property of the product. This page reports
 *      what one tool call did on one path, on one machine, at one version. The
 *      sentence "the product prevents X" is not licensed by it and ADR 0034
 *      forbids a downstream layer from broadening what an upstream one showed.
 *   2. Do not translate a recorded value. `write_incident_report`, `deny`,
 *      `absent` and the module path of the component that refused render
 *      verbatim in every locale — `scripts/denied-action-proof.py check` reads
 *      the English build only.
 *   3. Do not upgrade the claim term. `Denied before execution` is carried here
 *      by the post-condition, not by the verdict. If a change ever leaves the
 *      side effect unchecked, the true term becomes `Evaluated` and this page
 *      must say `Evaluated`.
 *   4. Do not describe the decision as a gateway's. It came from an in-process
 *      interceptor in the SDK's fail-closed posture, and that is published as a
 *      limit rather than smoothed over.
 */

// ---------------------------------------------------------------------------
// Page identity. Owner, version, last verified, and the file this page renders.
// ---------------------------------------------------------------------------

/** The page's own version — not the SDK's, which is `PROVENANCE.sdk`. */
const PAGE_VERSION = '1.0.0';
const PAGE_OWNER = 'Pioneer';

/** When a human last checked this page against the recording it renders. */
const LAST_VERIFIED = '2026-08-14';

const SITE_REPO = 'https://github.com/ai-agent-assembly/official-website';
const CORE_REPO = 'https://github.com/ai-agent-assembly/agent-assembly';
const RECORDING_FILE = `${SITE_REPO}/blob/HEAD/metadata/denied-action-proof.json`;
const CAPTURE_SCRIPT = `${SITE_REPO}/blob/HEAD/scripts/denied-action-capture.py`;
const ADR_0033 = `${CORE_REPO}/blob/HEAD/docs/src/adr/0033-canonical-governance-and-enforcement-architecture.md`;
const PYTHON_SDK = 'https://github.com/ai-agent-assembly/python-sdk';
const SDK_RELEASE = `https://pypi.org/project/agent-assembly/${PROVENANCE.sdk}/`;

/** A cross-hostname destination. Opens away and carries the campaign tag. */
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

/** A value quoted verbatim from the recording. Never translated. */
function Recorded({value}: {readonly value: string}): ReactNode {
  return <span className={styles.mono}>{value}</span>;
}

/**
 * What the observer saw. `absent` is the finding, so it is the one emphasised.
 */
function Observed({value}: {readonly value: string}): ReactNode {
  return (
    <span
      className={`${styles.mono} ${value === 'absent' ? styles.absent : styles.present}`}
    >
      {value}
    </span>
  );
}

/*
 * The ADR 0033 §6 claim term this run reaches.
 *
 * Keyed by the recording's own token so the map cannot fall out of step with
 * the generated data: `SCENARIO` is `as const`, so a term renamed upstream
 * fails the build here rather than rendering a blank badge.
 *
 * `Denied before execution` requires a refusal by a component sitting BEFORE
 * the effect. The verdict alone would only reach `Evaluated`; what carries the
 * stronger term is the post-condition below it.
 */
type ClaimTerm = typeof SCENARIO.claimTerm;

const TERM_NAME: Record<ClaimTerm, ReactNode> = {
  denied_before_execution: (
    <Translate id="proof.term.denied">Denied before execution</Translate>
  ),
};

export default function DeniedActionProof(): ReactNode {
  return (
    <Layout
      title={translate({
        id: 'proof.meta.title',
        message: 'A denied action, and the file it did not write',
      })}
      description={translate({
        id: 'proof.meta.description',
        message:
          'One recorded run in which a policy denial kept an agent tool body from taking effect — with the effect checked afterwards by a separate process that took no part in the decision.',
      })}
    >
      <main className={narrative.wrap}>
        <div className={narrative.kicker}>
          <Translate id="proof.kicker">Evidence</Translate>
        </div>
        <h1 className={narrative.title}>
          <Translate id="proof.title">
            A denied action, and the file it did not write
          </Translate>
        </h1>
        <p className={narrative.lede}>
          <Translate id="proof.lede">
            A DENIED badge is a label a page draws for itself, and a recording
            of one is the same label with production values. This page publishes
            a run instead: a real agent tool call, refused by the released SDK’s
            own enforcement point, with the effect the tool exists to produce
            read back afterwards by a program that took no part in the decision.
          </Translate>
        </p>

        <dl className={styles.meta}>
          <div className={styles.metaPair}>
            <dt className={styles.metaLabel}>
              <Translate id="proof.meta.owner">Owner</Translate>
            </dt>
            <dd className={styles.metaValue}>
              {PAGE_OWNER} · <Recorded value={PROVENANCE.ticket} />
            </dd>
          </div>
          <div className={styles.metaPair}>
            <dt className={styles.metaLabel}>
              <Translate id="proof.meta.version">Page version</Translate>
            </dt>
            <dd className={styles.metaValue}>
              <Recorded value={PAGE_VERSION} />
            </dd>
          </div>
          <div className={styles.metaPair}>
            <dt className={styles.metaLabel}>
              <Translate id="proof.meta.verified">Last verified</Translate>
            </dt>
            <dd className={styles.metaValue}>
              <Recorded value={LAST_VERIFIED} />
            </dd>
          </div>
          <div className={styles.metaPair}>
            <dt className={styles.metaLabel}>
              <Translate id="proof.meta.source">Source of truth</Translate>
            </dt>
            <dd className={styles.metaValue}>
              <Out to={RECORDING_FILE} className={narrative.link}>
                <Translate id="proof.meta.sourceLink">
                  denied-action-proof.json
                </Translate>
              </Out>
            </dd>
          </div>
        </dl>

        {/* ---------------------------------------------------------------
         * Scope, before the transcript rather than after it.
         * --------------------------------------------------------------- */}
        <div className={styles.scope}>
          <strong className={styles.scopeTitle}>
            <Translate id="proof.scope.title">
              This is one run, not a general statement
            </Translate>
          </strong>
          <Translate
            id="proof.scope.body"
            values={{
              sdk: <Recorded value={PROVENANCE.sdk} />,
              framework: <Recorded value={PROVENANCE.framework} />,
              python: <Recorded value={PROVENANCE.python} />,
              platform: <Recorded value={PROVENANCE.platform} />,
              date: <Recorded value={PROVENANCE.capturedOn} />,
            }}
          >
            {
              'One tool call, on one code path, recorded on {date} against Python SDK {sdk}, smolagents {framework}, Python {python}, on {platform}. What it shows holds for that run. It is not a statement about other tools, other frameworks, other paths or other machines, and nothing on this page should be read as one.'
            }
          </Translate>
        </div>

        {/* ---------------------------------------------------------------
         * The scenario.
         * --------------------------------------------------------------- */}
        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="proof.scenario.eyebrow">The scenario</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="proof.scenario.title">
              What was asked for, and on which path
            </Translate>
          </h2>
          <p className={narrative.p}>
            <Translate
              id="proof.scenario.body"
              values={{
                tool: <Recorded value={SCENARIO.tool} />,
                file: <Recorded value={SCENARIO.sideEffectFile} />,
                rule: <Recorded value={SCENARIO.policyRule} />,
              }}
            >
              {
                'An agent tool named {tool} writes a report file called {file} into a working directory. That file is the side effect — the thing the tool exists to produce, and the thing a reader can look for without trusting anyone. Policy refuses the tool under a rule named {rule}.'
              }
            </Translate>
          </p>
          <p className={narrative.p}>
            <Translate
              id="proof.scenario.path"
              values={{
                path: <Recorded value={SCENARIO.launchPath} />,
                point: <Recorded value={SCENARIO.enforcementPoint} />,
              }}
            >
              {
                'The call travels the framework’s ordinary tool-execution path, {path}. The component that refuses it is {point} — shipped in the SDK, not written for this page. It consults the decision first and returns a refusal to the caller in place of running the tool body.'
              }
            </Translate>
          </p>
          <p className={narrative.p}>
            <Translate
              id="proof.scenario.decisionSource"
              values={{source: <Recorded value={SCENARIO.decisionSource} />}}
            >
              {
                'The decision itself came from {source}, not from a running gateway. That is a real limit on what this run shows and it is stated here rather than left to be inferred: what was exercised is the path from a deny verdict to a body that did not run, not the production of the verdict.'
              }
            </Translate>
          </p>
        </section>

        {/* ---------------------------------------------------------------
         * The transcript.
         * --------------------------------------------------------------- */}
        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="proof.steps.eyebrow">The transcript</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="proof.steps.title">
              Four steps, in the order they happened
            </Translate>
          </h2>
          <ol className={styles.steps}>
            <li className={styles.step}>
              <strong className={styles.stepTitle}>
                <Translate id="proof.step1.title">
                  The tool call is made
                </Translate>
              </strong>
              <Translate id="proof.step1.body">
                The agent invokes the tool the way the framework invokes any
                tool. Nothing in the tool’s own code knows it is governed.
              </Translate>
            </li>
            <li className={styles.step}>
              <strong className={styles.stepTitle}>
                <Translate id="proof.step2.title">
                  A decision is produced, and it is produced first
                </Translate>
              </strong>
              <Translate id="proof.step2.body">
                The enforcement point asks for a verdict before it forwards the
                call. The record it acted on is below, field for field.
              </Translate>
            </li>
            <li className={styles.step}>
              <strong className={styles.stepTitle}>
                <Translate id="proof.step3.title">
                  The caller gets a refusal instead of a result
                </Translate>
              </strong>
              <Translate id="proof.step3.body">
                The tool body is not reached. What the caller receives is a
                refusal string, which by itself is still only a label.
              </Translate>
            </li>
            <li className={styles.step}>
              <strong className={styles.stepTitle}>
                <Translate id="proof.step4.title">
                  A different process looks in the directory
                </Translate>
              </strong>
              <Translate id="proof.step4.body">
                This is the step that makes the other three worth reading. The
                listing is taken by a program that took no part in the decision.
              </Translate>
            </li>
          </ol>

          <h3 className={narrative.blockTitle}>
            <Translate id="proof.decision.title">
              The decision the enforcement point acted on
            </Translate>
          </h3>
          <div className={narrative.tableWrap}>
            <table className={narrative.table}>
              <thead>
                <tr>
                  <th scope="col">
                    <Translate id="proof.decision.colField">
                      Decision field
                    </Translate>
                  </th>
                  <th scope="col">
                    <Translate id="proof.decision.colValue">
                      Recorded value
                    </Translate>
                  </th>
                </tr>
              </thead>
              <tbody>
                {DECISION.map((d) => (
                  <tr key={d.field}>
                    <th scope="row">
                      <Recorded value={d.field} />
                    </th>
                    <td>
                      <Recorded value={d.value} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={narrative.p}>
            <Translate id="proof.decision.caller">
              What the caller received in place of the tool’s result:
            </Translate>
          </p>
          <p className={styles.quote}>{RETURNED}</p>
          <p className={narrative.p}>
            <Translate id="proof.decision.audit">
              This record was captured by the interceptor this run supplied. On
              the SDK’s own shipped interceptor neither audit hook resolves, so
              a denied call leaves nothing durable behind — recording on that
              path is Planned, and this page shows a decision, not an audit
              trail.
            </Translate>
          </p>
        </section>

        {/* ---------------------------------------------------------------
         * The post-condition. The load-bearing section.
         * --------------------------------------------------------------- */}
        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="proof.post.eyebrow">The post-condition</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="proof.post.title">
              What a separate process saw in the directory
            </Translate>
          </h2>
          <p className={narrative.p}>
            <Translate id="proof.post.body">
              After the call returned, the directory was listed by a program
              launched as its own operating-system process. It imports three
              standard-library modules and nothing else, so it cannot consult
              the policy engine, the enforcement point, or the value the tool
              call returned. Its answer is an observation rather than a report.
            </Translate>
          </p>
          <p className={styles.quote}>{OBSERVER}</p>
          <div className={narrative.tableWrap}>
            <table className={narrative.table}>
              <thead>
                <tr>
                  <th scope="col">
                    <Translate id="proof.post.colRun">Run</Translate>
                  </th>
                  <th scope="col">
                    <Translate id="proof.post.colEnforce">
                      Enforcement
                    </Translate>
                  </th>
                  <th scope="col">
                    <Translate id="proof.post.colPolicy">Policy</Translate>
                  </th>
                  <th scope="col">
                    <Translate id="proof.post.colFile">
                      Report file afterwards
                    </Translate>
                  </th>
                  <th scope="col">
                    <Translate id="proof.post.colHolds">
                      Post-condition
                    </Translate>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.id}>
                    <th scope="row">
                      <Recorded value={r.id} />
                    </th>
                    <td>
                      <Recorded value={r.enforcement} />
                    </td>
                    <td>
                      <Recorded value={r.policy} />
                    </td>
                    <td>
                      <Observed value={r.reportFile} />
                    </td>
                    <td>
                      <Recorded value={r.postCondition} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={narrative.p}>
            <Translate
              id="proof.post.controls"
              values={{held: TOTALS.postConditionsHeld, runs: TOTALS.arms}}
            >
              {
                'The first row alone would settle nothing — a harness that writes nothing produces the same listing, and so does a policy no component ever consulted. The second row moves the policy and holds the enforcement point fixed; the third removes the enforcement point and holds the policy fixed. Both wrote the file. {held} of {runs} runs ended as their design predicted, and the absence in the first row is a measurement because the other two came out the other way.'
              }
            </Translate>
          </p>
          <p className={narrative.p}>
            <Translate
              id="proof.post.term"
              values={{
                term: (
                  <span className={narrative.termBadge}>
                    {TERM_NAME[SCENARIO.claimTerm]}
                  </span>
                ),
                adr: (
                  <Out to={ADR_0033} className={narrative.link}>
                    <Translate id="proof.post.adrLink">ADR 0033 §6</Translate>
                  </Out>
                ),
              }}
            >
              {
                'In the claim vocabulary {adr} defines, this run reaches {term}. The verdict on its own would reach only Evaluated; what carries the stronger term is the row above, because that term asks for a refusal by a component sitting before the effect and for the effect to be shown missing. Were the side effect ever left unchecked, the honest term would drop back to Evaluated.'
              }
            </Translate>
          </p>
        </section>

        {/* ---------------------------------------------------------------
         * What the run does not show. Content, not a disclaimer.
         * --------------------------------------------------------------- */}
        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="proof.limits.eyebrow">Known exclusions</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="proof.limits.title">
              What this run does not show
            </Translate>
          </h2>
          <ul className={narrative.limitList}>
            <li>
              <Translate id="proof.limits.one">
                One tool, one framework adapter, one SDK build, one machine. A
                second tool on the same path was not run, and a reader should
                not carry this result to one.
              </Translate>
            </li>
            <li>
              <Translate id="proof.limits.gateway">
                The verdict came from an in-process interceptor, so the run
                exercised the path from a deny verdict to a body that did not
                run — not a gateway producing that verdict, and not the network
                between them.
              </Translate>
            </li>
            <li>
              <Translate id="proof.limits.route">
                The enforcement point sits on the framework’s tool-execution
                entry. A tool body reached by some other route in the same
                process is outside what this run measured, and the run says
                nothing either way about it.
              </Translate>
            </li>
            <li>
              <Translate id="proof.limits.audit">
                No durable evidence record was written. The decision shown above
                was captured in memory by this run’s own interceptor; SDK-side
                recording is Planned.
              </Translate>
            </li>
            <li>
              <Translate id="proof.limits.platform">
                Other operating systems, other Python versions and the other
                language SDKs were not exercised here. Their status is neither
                confirmed nor denied by this page.
              </Translate>
            </li>
          </ul>
        </section>

        {/* ---------------------------------------------------------------
         * Reproduce it.
         * --------------------------------------------------------------- */}
        <section className={narrative.block}>
          <div className={narrative.eyebrow}>
            <Translate id="proof.repro.eyebrow">Reproduce it</Translate>
          </div>
          <h2 className={narrative.blockTitle}>
            <Translate id="proof.repro.title">
              Run it yourself, then try to break it
            </Translate>
          </h2>
          <p className={narrative.p}>
            <Translate
              id="proof.repro.body"
              values={{
                release: (
                  <Out to={SDK_RELEASE} className={narrative.link}>
                    <Recorded value={PROVENANCE.sdk} />
                  </Out>
                ),
                script: (
                  <Out to={CAPTURE_SCRIPT} className={narrative.link}>
                    <Translate id="proof.repro.scriptLink">
                      denied-action-capture.py
                    </Translate>
                  </Out>
                ),
              }}
            >
              {
                'Everything above came out of {script}, run against the published SDK {release} installed from PyPI by the second command below. The run itself reaches no gateway, needs no credentials and opens no network connection. It writes the recording this page renders.'
              }
            </Translate>
          </p>
          <p className={styles.quote}>
            {[
              'uv venv --python 3.12 .proofenv',
              "VIRTUAL_ENV=.proofenv uv pip install 'agent-assembly==" +
                PROVENANCE.sdk +
                "' 'smolagents==" +
                PROVENANCE.framework +
                "'",
              '.proofenv/bin/python scripts/denied-action-capture.py',
            ].join('\n')}
          </p>
          <p className={narrative.p}>
            <Translate id="proof.repro.falsify">
              Then sever the enforcement path and watch the check go red. The
              same script runs the denied call with the enforcement point
              uninstalled; the report file appears, the post-condition fails and
              the command exits non-zero. A check that cannot fail is not a
              check, so this one is shown failing before it is offered as
              passing.
            </Translate>
          </p>
          <p className={styles.quote}>
            {
              '.proofenv/bin/python scripts/denied-action-capture.py --sever-enforcement'
            }
          </p>
          <p className={narrative.p}>
            <Translate
              id="proof.repro.method"
              values={{
                sdkRepo: (
                  <Out to={PYTHON_SDK} className={narrative.link}>
                    <Translate id="proof.repro.sdkRepoLink">
                      the Python SDK repository
                    </Translate>
                  </Out>
                ),
                ticket: <Recorded value={PROVENANCE.methodTicket} />,
              }}
            >
              {
                'The method — assert the effect is missing before asserting the error, and pair the run with a control that removes the governance — comes from the negative-control suites in {sdkRepo} and its Go and Node siblings, tracked under {ticket}. Those suites stand a test double in for the component that decides, which is the right call for a unit test and means what they establish is not reproducible from an installed package. This page runs the same method against a published build, so you can run it from a release.'
              }
            </Translate>
          </p>
        </section>

        <div className={narrative.ctaRow}>
          <Link className={narrative.btnPrimary} to="/trust">
            <Translate id="proof.cta.trust">
              What else is measured, and what is not →
            </Translate>
          </Link>
          <Link className={narrative.btnGhost} to="/how-it-works">
            <Translate id="proof.cta.how">How it works</Translate>
          </Link>
          <Link className={narrative.btnGhost} to="/roles">
            <Translate id="proof.cta.roles">
              Read the brief for your role
            </Translate>
          </Link>
        </div>
      </main>
    </Layout>
  );
}
