import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import {TrackedLink} from '@site/src/components/Tracked';
import {DOCS_URL} from '@site/src/generated/site-urls';
import styles from './narrative.module.css';

/*
 * AAASM-5586 — `/product`, the evaluator's page.
 *
 * The site publishes one promise at four depths, and this route owns exactly
 * one of them. `product-promise.md` defines the ladder; the sitemap assigns the
 * rungs:
 *
 *   Level 1  one sentence            the hero here and on `/`
 *   Level 2  three steps             `/` — AAASM-5585's, untouched by this file
 *   Level 3  for an evaluator        THIS PAGE
 *   Level 4  technical handoff       `/how-it-works`
 *
 * So the test for anything added below is not "is it true" — it is "is it
 * Level 3". A mechanism name, a crate, a socket path or a §6 mapping table
 * belongs one route further in. A capability sentence with no bound belongs
 * nowhere.
 *
 * Every capability sentence is one of the sixteen entries in the shared claim
 * register (`role-narratives.md`, RC1–RC16), in the register's own wording, with
 * the register's own Bound beside it. This page is near the bottom of ADR 0034's
 * truth hierarchy: it may simplify what those sources say, never broaden it.
 * A paraphrase that reads better is a new claim with its own evidence burden.
 *
 * What this page deliberately does NOT do:
 *
 *   - It does not restate `/`'s default-posture table. One product truth, one
 *     owner per surface; a second copy drifts inside a release.
 *   - It does not draw the architecture. That is `/how-it-works`, which is where
 *     the shape can be given enough room to be correct.
 *   - It does not touch `/`. `/#architecture` and `/#security` are live links and
 *     a URL fragment is never sent to the server, so nothing can redirect one
 *     that moves — the sitemap lands that obligation here, and the way this
 *     ticket meets it is by leaving both anchors where they are.
 */

const GITHUB = 'https://github.com/ai-agent-assembly';

// Cross-hostname destinations carry UTM per HORO-47 §5.2. Same-hostname
// destinations (/how-it-works) MUST NOT — that would overwrite the visitor's
// session source in GA4.
const UTM_DOCS =
  'utm_source=product_site&utm_medium=docs_link&utm_campaign=agent_assembly_launch';

/** A Docs Hub page, with the UTM every cross-hostname link carries. */
function hub(page: string): string {
  return `${DOCS_URL}/${page}?${UTM_DOCS}`;
}

const DOCS = `${DOCS_URL}/?${UTM_DOCS}`;
// AAASM-5528 — the coverage / known-limitations page the path claims resolve to.
const LIMITATIONS_DOC = `${DOCS_URL}/core/latest/devtools/limitations.html?${UTM_DOCS}`;
const CLAIMS_DOC = hub('role-narratives.html');
const SECURITY_DOC = hub('security-model.html');
const POLICY_DOC = hub('policy-reference.html');
const OPEN_CORE_DOC = hub('open-core-boundary.html');
const HOW_IT_WORKS = '/how-it-works';

interface Decision {
  /** Stable list key. Not rendered — the visible strings are all translated. */
  readonly key: string;
  /** The ADR 0033 §6 term this claim reaches. Never omitted. */
  readonly term: ReactNode;
  readonly title: ReactNode;
  readonly text: ReactNode;
  /** The register's Bound. Part of the claim; a card without one is broader. */
  readonly bound: ReactNode;
}

/**
 * What a policy decides — one card per subject, each carrying the §6 term it
 * reaches and the bound that travels with it.
 *
 * This replaces the "Identity, Authority and Secret Isolation" bullet lists that
 * stood here. Those were bare capability assertions: a reader could not tell
 * which of them was a refusal, which was an observation, and which was neither.
 * Two were wrong rather than merely vague, and both are fixed here:
 *
 *   - "Per-team budgets and quotas" asserted an enforcement the register marks
 *     `Unmeasured` (RC13). Filed as AAASM-5700, and NOT resolved by making the
 *     two pages agree — the factual question, whether a declared cap is consulted
 *     in the decision path, is a measurement in `agent-assembly` and stays with
 *     that ticket. What this page does is stop asserting more than the evidence
 *     carries, which ADR 0034 permits in the narrowing direction without new
 *     measurement. The card below therefore states the policy surface (a cap can
 *     be declared) and the register's term for the enforcement (Unmeasured).
 *   - "Allow/deny policy + network egress control" left the always-on
 *     private-address guard invisible. Understating a shipped control is graded a
 *     defect in the same way overstating one is, so RC2 is stated in the same
 *     card as RC1 rather than dropped for brevity.
 */
function decisions(): readonly Decision[] {
  return [
    {
      key: 'destinations',
      term: (
        <Translate id="product.decides.destinations.term">
          Denied before execution
        </Translate>
      ),
      title: (
        <Translate id="product.decides.destinations.title">
          Which network destinations it may reach
        </Translate>
      ),
      text: (
        <Translate id="product.decides.destinations.text">
          A connection made on a path you routed through Agent Assembly is
          checked against the destination list you configured and refused before
          the proxy dials it. One destination rule is on by default and no
          configuration relaxes it: requests to loopback, private, link-local
          and related address space are refused, including where a public
          hostname resolves into them.
        </Translate>
      ),
      bound: (
        <Translate id="product.decides.destinations.bound">
          Your own lists are empty until you write them, and the refusal is the
          proxy’s own local configuration rather than a control-plane decision.
          The proxy is a released artifact on Linux and a cargo install on
          macOS; on Windows there is no local mediation, so there is nothing in
          front of the connection to refuse it.
        </Translate>
      ),
    },
    {
      key: 'tools',
      term: (
        <Translate id="product.decides.tools.term">
          Denied before execution
        </Translate>
      ),
      title: (
        <Translate id="product.decides.tools.title">
          Which tool calls may leave the machine
        </Translate>
      ),
      text: (
        <Translate id="product.decides.tools.text">
          An MCP tool call can be checked against your policy by the control
          plane and refused before the proxy forwards it.
        </Translate>
      ),
      bound: (
        <Translate id="product.decides.tools.bound">
          This is the one refusal in the product that the control plane itself
          decides ahead of the network, and it is off until an operator turns it
          on. It reaches MCP sent as an ordinary HTTP POST on an intercepted
          host with a gateway endpoint configured. Tool servers you run over
          standard input and output — the most common setup — over server-sent
          events, or over WebSocket have no interception mechanism.
        </Translate>
      ),
    },
    {
      key: 'sdk',
      term: <Translate id="product.decides.sdk.term">Evaluated</Translate>,
      title: (
        <Translate id="product.decides.sdk.title">
          Which tools your own agent code may call
        </Translate>
      ),
      text: (
        <Translate id="product.decides.sdk.text">
          A tool call through a wrapped framework seam is checked before the
          tool body runs.
        </Translate>
      ),
      bound: (
        <Translate id="product.decides.sdk.bound">
          The SDK is advisory by design — a defence-in-depth posture, not the
          authoritative gate, and an agent that does not call it is not asking.
          Python raises before the body and fails closed; Go fails closed but
          needs the wrap to be requested explicitly; the Node SDK’s default mode
          routes the check through a client that allows everything, so no
          refusal is produced there at all. Asking for enforcement without a
          check-capable mode is refused loudly at start-up rather than silently
          allowed.
        </Translate>
      ),
    },
    {
      key: 'credentials',
      term: <Translate id="product.decides.creds.term">Redacted</Translate>,
      title: (
        <Translate id="product.decides.creds.title">
          Whether a recognised credential leaves with the request
        </Translate>
      ),
      text: (
        <Translate id="product.decides.creds.text">
          On the model-provider hosts Agent Assembly inspects, a recognised
          credential is removed from the request before it is forwarded.
        </Translate>
      ),
      bound: (
        <Translate id="product.decides.creds.bound">
          Three built-in hosts, because payload inspection is limited to
          model-provider hosts by default. The default action is redact and
          forward, not refuse — blocking on a detected credential is something
          you opt into. Recall is bounded by the pattern set, and model
          responses on that path are not scanned.
        </Translate>
      ),
    },
    {
      key: 'spend',
      term: <Translate id="product.decides.spend.term">Unmeasured</Translate>,
      title: (
        <Translate id="product.decides.spend.title">
          How much it may spend
        </Translate>
      ),
      text: (
        <Translate id="product.decides.spend.text">
          A policy can declare a spend cap, per agent or across a team.
        </Translate>
      ),
      bound: (
        <Translate id="product.decides.spend.bound">
          Whether a declared cap is checked in the decision path is not
          established by any evidence row, so the honest term for the
          enforcement is Unmeasured — the claim above is about what a policy can
          declare, not about what stops a call. A cap exists only where a policy
          declares one, an undeclared budget is uncapped, and a budget store
          that cannot be read resets the cap silently.
        </Translate>
      ),
    },
    {
      key: 'hold',
      term: (
        <Translate id="product.decides.hold.term">Approval required</Translate>
      ),
      title: (
        <Translate id="product.decides.hold.title">
          Which actions are held rather than answered
        </Translate>
      ),
      text: (
        <Translate id="product.decides.hold.text">
          A policy rule can hold an action instead of answering it. The hold is
          real and it fails closed: the check blocks, and a timeout resolves to
          a refusal.
        </Translate>
      ),
      bound: (
        <Translate id="product.decides.hold.bound">
          Stated here as an unfinished capability, because that is what it is.
          No shipped operator surface can answer the queue the hold blocks on,
          so in practice it blocks and then refuses at the timeout with no
          person involved. Do not plan on human review yet — tracked as
          AAASM-5657.
        </Translate>
      ),
    },
  ];
}

interface Applied {
  readonly key: string;
  readonly title: ReactNode;
  readonly text: ReactNode;
  readonly bound: ReactNode;
}

/**
 * Where the decision is applied — `product-promise.md` Level 3, verbatim in
 * substance.
 *
 * The lead sentence carries more weight than the cards do. Level 3's own
 * instruction is *"resist the urge to number them: they are not an ordered
 * chain, one does not cover for another, and an absent one is a reportable state
 * rather than a silent hand-off to the next"* — so these are rendered as three
 * peers with no ordinal, no arrow between them and no visual hierarchy implying
 * that one sits beneath another. Adding "1 · 2 · 3" here would reintroduce
 * ADR 0033 forbidden design 1 through layout alone.
 */
function applied(): readonly Applied[] {
  return [
    {
      key: 'proxy',
      title: (
        <Translate id="product.applied.proxy.title">
          The sidecar proxy
        </Translate>
      ),
      text: (
        <Translate id="product.applied.proxy.text">
          The strongest of the three. It refuses at connection time, re-checks
          the host inside the tunnel, blocks or removes recognised credentials,
          and adjudicates MCP tool calls — each of those returns before it dials
          upstream. This is refusal that happens before the action, out of the
          agent’s own process.
        </Translate>
      ),
      bound: (
        <Translate id="product.applied.proxy.bound">
          A released artifact on Linux; on macOS it is a cargo install. On
          Windows there is no local mediation of any kind.
        </Translate>
      ),
    },
    {
      key: 'checkpoint',
      title: (
        <Translate id="product.applied.checkpoint.title">
          The SDK checkpoint
        </Translate>
      ),
      text: (
        <Translate id="product.applied.checkpoint.text">
          It wraps your framework’s tool seam and raises before the wrapped tool
          body runs, which is the earliest point inside your own code that a
          decision can be applied.
        </Translate>
      ),
      bound: (
        <Translate id="product.applied.checkpoint.bound">
          Deliberately advisory: a defence-in-depth posture rather than the
          authoritative gate. An agent that does not call it is not asking, and
          a framework nobody has adapted is outside the wrapper.
        </Translate>
      ),
    },
    {
      key: 'host',
      title: (
        <Translate id="product.applied.host.title">
          Operating-system-level controls
        </Translate>
      ),
      text: (
        <Translate id="product.applied.host.text">
          Platform-specific, and where they exist today they mostly observe. On
          Linux, kernel probes report TLS plaintext, process execution and file
          activity, and no such signal takes part in any allow or deny decision.
        </Translate>
      ),
      bound: (
        <Translate id="product.applied.host.bound">
          macOS has no equivalent adapter — and is simultaneously the only
          platform on which the host-enforcement rung is reachable at all,
          through an opt-in, authorized settings write. Both halves are true and
          both are required. That rung is recorded as unearned at the published
          v0.0.1-rc.6 tag, because the evidence it rests on postdates that tag.
          Windows has neither.
        </Translate>
      ),
    },
  ];
}

/**
 * What it does not do — Level 3's closing paragraph, split into the five limits
 * an evaluator hits first.
 *
 * This section is on the page for a stated reason and the reason is in the copy:
 * a reader who discovers an overstated claim after provisioning is a worse
 * outcome than one who reads an accurate limit up front. It is not a disclaimer
 * appended to a sales page; it is the part of the page an evaluator is looking
 * for, which is why it is styled as content rather than as fine print.
 */
function limits(): readonly string[] {
  return [
    translate({
      id: 'product.notdo.route',
      message:
        'It does not govern an agent you did not route. Routing is something you do, per agent and per launch, and a session started outside a managed launch is simply outside all of this — it is not detectable from the inside.',
    }),
    translate({
      id: 'product.notdo.payload',
      message:
        'It does not inspect payloads to hosts it is not intercepting. Three built-in model-provider hosts are inspected by default; any other host is tunnelled, which means the connection is observed and the payload is not.',
    }),
    translate({
      id: 'product.notdo.process',
      message:
        'It does not keep a credential out of the agent’s own process. What it does is scan outbound requests on the inspected hosts and remove recognised credentials before forwarding them.',
    }),
    translate({
      id: 'product.notdo.audit',
      message:
        'Its audit chain is tamper-evident, not signed. It is an unkeyed digest over the log file, so anyone able to rewrite that file can recompute it — and verification checks the links between the entries that are present, so a log deleted and recreated verifies clean.',
    }),
    translate({
      id: 'product.notdo.platform',
      message:
        'It has nothing to offer on Windows, where there is no local mediation at all. UDP, QUIC and HTTP/3 are outside the transport set on the platforms it does support.',
    }),
  ];
}

interface Check {
  /** Stable render key. Was `title`, which stopped being a string when the
   *  copy moved to `<Translate>` elements. */
  readonly key: string;
  readonly title: ReactNode;
  readonly text: ReactNode;
  readonly linkLabel: ReactNode;
  readonly href: string;
  readonly targetProduct: 'docs' | 'github';
}

/**
 * Proof means a claim a reader can reach the evidence for, not a confident sentence.
 *
 * The copy is held as `<Translate>` elements, the form the other 71 translated
 * strings on this page already use, rather than as `translate()` calls. Both
 * extract the same id and message, so this is a form choice, not a content one —
 * but the call form made this block a 69-line token-for-token duplicate of the
 * homepage's proof section (`src/components/home/index.tsx`), which publishes the
 * same four subjects at Level 2 with its own shorter copy. That parallel is
 * deliberate and required: ADR 0034 puts `/product` at or below `/`, so the two
 * pages carry the same proof subjects on purpose. Deduplicating it for real would
 * mean a shared component in `src/components/home/**`, which AAASM-5594's
 * partition table assigns to AAASM-5585 and puts out of this ticket's reach.
 */
function checks(): readonly Check[] {
  return [
    {
      key: 'chain',
      title: (
        <Translate id="product.proof.chain.title">
          Verify the audit chain yourself
        </Translate>
      ),
      text: (
        <Translate id="product.proof.chain.text">
          aasm audit verify-chain ships in the open-source build. It proves the
          integrity of the entries that are present, not that the log is whole —
          and emission is best-effort, so a decision can be made and its record
          lost.
        </Translate>
      ),
      linkLabel: (
        <Translate id="product.proof.chain.link">
          What verification does and does not establish →
        </Translate>
      ),
      href: SECURITY_DOC,
      targetProduct: 'docs',
    },
    {
      key: 'policy',
      title: (
        <Translate id="product.proof.policy.title">
          Read the rule that produced the decision
        </Translate>
      ),
      text: (
        <Translate id="product.proof.policy.text">
          Policy is versioned YAML or JSON you review through the Git workflow
          you already use. The field reference is published, so a rule described
          on this site is a rule you can look up.
        </Translate>
      ),
      linkLabel: (
        <Translate id="product.proof.policy.link">
          Policy field reference →
        </Translate>
      ),
      href: POLICY_DOC,
      targetProduct: 'docs',
    },
    {
      key: 'register',
      title: (
        <Translate id="product.proof.register.title">
          Trace any sentence above to its bound
        </Translate>
      ),
      text: (
        <Translate id="product.proof.register.text">
          Each capability sentence on this page is one of sixteen entries in a
          shared claim register, quoted rather than paraphrased. Every entry
          carries the term it reaches, the bound that travels with it, and the
          evidence rows behind it — including the two subjects the register
          records as unmeasured.
        </Translate>
      ),
      linkLabel: (
        <Translate id="product.proof.register.link">
          The claim register →
        </Translate>
      ),
      href: CLAIMS_DOC,
      targetProduct: 'docs',
    },
    {
      key: 'source',
      title: (
        <Translate id="product.proof.source.title">
          Read the runtime that makes the decision
        </Translate>
      ),
      text: (
        <Translate id="product.proof.source.text">
          The gateway, proxy, CLI and SDKs are Apache-2.0 on GitHub, with the
          tests that pin each behaviour described here. What is open source and
          what is not is stated rather than implied.
        </Translate>
      ),
      linkLabel: (
        <Translate id="product.proof.source.link">
          The open-core boundary →
        </Translate>
      ),
      href: OPEN_CORE_DOC,
      targetProduct: 'docs',
    },
  ];
}

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
        {/* Level 3's opening line: the whole product in one evaluator sentence. */}
        <p className={styles.lede}>
          <Translate id="product.lede">
            In one sentence: Agent Assembly is a decision point you place in
            front of an AI agent’s actions, plus the evidence trail that shows
            what it decided.
          </Translate>
        </p>

        <section className={styles.block}>
          <div className={styles.eyebrow}>
            <Translate id="product.why.eyebrow">The gap</Translate>
          </div>
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
          <p className={styles.p}>
            <Translate id="product.why.gap">
              The result is a team that can describe what an agent is supposed
              to do and cannot show what it is allowed to do. Logs and traces
              answer that question afterwards, which is the wrong moment: by the
              time a request appears in a trace, the request has been sent.
            </Translate>
          </p>
        </section>

        <section className={styles.block}>
          <div className={styles.eyebrow}>
            <Translate id="product.decides.eyebrow">What it decides</Translate>
          </div>
          <h2 className={styles.blockTitle}>
            <Translate id="product.decides.title">
              Six questions a policy answers — and how far each answer reaches
            </Translate>
          </h2>
          <p className={styles.p}>
            <Translate id="product.decides.lead">
              Policy is versioned YAML or JSON you review through the Git
              workflow you already use. Each card below carries the term for
              what the product actually did to the action, and the bound that
              travels with it. They do not all reach the same distance, and the
              ones that reach least far say so rather than borrowing the
              confidence of the rest.
            </Translate>
          </p>
          <div className={styles.cardGrid}>
            {decisions().map((d) => (
              <div key={d.key} className={styles.card}>
                <span className={styles.termBadge}>{d.term}</span>
                <h3 className={styles.cardTitle}>{d.title}</h3>
                <p className={styles.cardText}>{d.text}</p>
                <p className={styles.cardBound}>
                  <span className={styles.boundLabel}>
                    <Translate id="product.boundLabel">
                      Where this stops.
                    </Translate>
                  </span>{' '}
                  {d.bound}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.block}>
          <div className={styles.eyebrow}>
            <Translate id="product.applied.eyebrow">
              Where the decision is applied
            </Translate>
          </div>
          <h2 className={styles.blockTitle}>
            <Translate id="product.applied.title">
              Three places, with genuinely different authority
            </Translate>
          </h2>
          <p className={styles.p}>
            <Translate id="product.applied.lead">
              They are not an ordered chain. One does not cover for another, and
              a component you have not deployed is reported as absent rather
              than quietly picked up by the next one. That inference — the
              checkpoint did not see it, so something underneath must have — is
              the specific error this product’s architecture exists to stop.
            </Translate>
          </p>
          <div className={styles.grid3}>
            {applied().map((a) => (
              <div key={a.key} className={styles.card}>
                <h3 className={styles.cardTitle}>{a.title}</h3>
                <p className={styles.cardText}>{a.text}</p>
                <p className={styles.cardBound}>{a.bound}</p>
              </div>
            ))}
          </div>
          <p className={styles.boundNote}>
            <strong>
              <Translate id="product.applied.planeLabel">
                And the control plane?
              </Translate>
            </strong>{' '}
            <Translate id="product.applied.plane">
              It holds your policy, budgets, approvals and audit — and it holds
              no traffic. Its answer stops an action only where one of the three
              above is waiting in front of that action for it. This is why
              routing comes first: a decision with nothing in front of the
              action is a record, not a refusal.
            </Translate>
          </p>
          <p className={styles.sectionFoot}>
            <Link className={styles.link} to={HOW_IT_WORKS}>
              <Translate id="product.applied.howItWorks">
                The six roles, and which of them can actually stop something →
              </Translate>
            </Link>
          </p>
          {/*
           * AAASM-5528: the prose above stops short of the full coverage
           * matrix, so it must resolve to the source-backed limitations page
           * rather than telling the reader to go find it. Do not drop this link.
           */}
          <p className={styles.sectionFoot}>
            <TrackedLink
              className={styles.link}
              eventName="cta_view_docs_click"
              ctaLocation="body"
              targetProduct="docs"
              alsoFire={['docs_click']}
              to={LIMITATIONS_DOC}
              linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
            >
              <Translate id="product.path.limitations">
                What is covered on each path, and what is not →
              </Translate>
            </TrackedLink>
          </p>
        </section>

        <section className={styles.block}>
          <div className={styles.eyebrow}>
            <Translate id="product.notdo.eyebrow">The boundary</Translate>
          </div>
          <h2 className={styles.blockTitle}>
            <Translate id="product.notdo.title">What it does not do</Translate>
          </h2>
          <p className={styles.p}>
            <Translate id="product.notdo.lead">
              These are on the page for a reason we would rather state than have
              you find: an evaluator who discovers an overstated claim after
              provisioning is a worse outcome than one who reads an accurate
              limit up front.
            </Translate>
          </p>
          <ul className={styles.limitList}>
            {limits().map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p className={styles.boundNote}>
            <strong>
              <Translate id="product.notdo.maturityLabel">Maturity.</Translate>
            </strong>{' '}
            <Translate id="product.notdo.maturity">
              The open-source runtime is pre-1.0 and released as a pre-release
              series. The managed service is planned — decided, not built — so
              nothing on this page is a commitment to an availability date, a
              region, a service-level agreement or a compliance position.
            </Translate>
          </p>
        </section>

        <section className={styles.block}>
          <div className={styles.eyebrow}>
            <Translate id="product.proof.eyebrow">Proof</Translate>
          </div>
          <h2 className={styles.blockTitle}>
            <Translate id="product.proof.title">
              Four things you can check without taking our word for it
            </Translate>
          </h2>
          <div className={styles.grid2}>
            {checks().map((c) => (
              <div key={c.key} className={styles.card}>
                <h3 className={styles.cardTitle}>{c.title}</h3>
                <p className={styles.cardText}>{c.text}</p>
                <TrackedLink
                  className={styles.link}
                  eventName="cta_view_docs_click"
                  ctaLocation="body"
                  targetProduct={c.targetProduct}
                  alsoFire={['docs_click']}
                  to={c.href}
                  linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
                >
                  {c.linkLabel}
                </TrackedLink>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.block}>
          <div className={styles.eyebrow}>
            <Translate id="product.oss.eyebrow">How you run it</Translate>
          </div>
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
              {/*
               * Both platform-bound components carry their platform. An
               * unqualified entry here would contradict the section above —
               * which states that OS-level interception is platform-specific
               * and that macOS and Windows have no equivalent adapter — and
               * would re-imply the cross-platform final tier of fd-2.
               *
               * The proxy is Unix-only: ADR 0033 §1 E3, and §5.3 records
               * aa-proxy as Unsupported on Windows with no build path. Listing
               * it unqualified tells a Windows reader they can self-host a
               * stack containing a component that does not build for them.
               */}
              <p className={styles.p}>
                <Translate id="product.oss.core.stack">
                  Self-host a limited-function stack from the Apache-2.0 crates
                  for local evaluation and development — gateway, CLI and SDKs
                  on any platform; the proxy on macOS and Linux; the eBPF probes
                  on Linux. No cost.
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
          <TrackedLink
            className={styles.btnPrimary}
            eventName="cta_view_docs_click"
            ctaLocation="footer"
            targetProduct="docs"
            alsoFire={['docs_click']}
            to={DOCS}
            linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
          >
            <Translate id="product.cta.getStarted">Get started →</Translate>
          </TrackedLink>
          <Link className={styles.btnGhost} to={HOW_IT_WORKS}>
            <Translate id="product.cta.howItWorks">How it works</Translate>
          </Link>
          <TrackedLink
            className={styles.btnGhost}
            eventName="cta_view_github_click"
            ctaLocation="footer"
            targetProduct="github"
            to={GITHUB}
            linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
          >
            <Translate id="product.cta.github">GitHub</Translate>
          </TrackedLink>
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
