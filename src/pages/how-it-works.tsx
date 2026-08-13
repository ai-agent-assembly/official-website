import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Translate, {translate} from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import {TrackedLink} from '@site/src/components/Tracked';
import {DOCS_URL} from '@site/src/generated/site-urls';
import styles from './narrative.module.css';

/*
 * AAASM-5586 — `/how-it-works`, the technical handoff.
 *
 * This is Level 4 of `product-promise.md`'s progressive-disclosure ladder, and
 * the deepest rung the product website is allowed to hold: the sitemap bars this
 * layer from reference material, a policy schema, a threat model and an API
 * surface. So the job of this page is to hand a reader the shape and then hand
 * them the canonical sources — not to reproduce them.
 *
 * The page exists because the shape was published wrong for a long time, and the
 * defect was structural rather than verbal. ADR 0033 supersedes a fixed ordered
 * pipeline of SDK, then proxy, then kernel probes, on the reasoning that an
 * ordered chain whose members cover for each other has NO WAY TO EXPRESS AN
 * ABSENT MEMBER. Six roles replace it. A deployment instantiates some subset of
 * them; an absent role is a reportable state, never a silent hand-off to
 * another; and each role's authority is its own.
 *
 * Two consequences for anyone editing this file:
 *
 *   1. The diagram is a field, not a stack, and the CSS comment on `.field`
 *      records the three layout rules that keep it one. Numbering the roles,
 *      ordering them by strength, or drawing a connector between two of them
 *      reintroduces the forbidden design through layout alone — no sentence has
 *      to change for the page to become wrong again.
 *   2. eBPF appears in exactly one section, the platform one, described as one
 *      Linux mechanism that today predominantly observes. It is not a tier, it
 *      is not cross-platform, and it takes part in no allow or deny decision.
 *
 * The mechanism table is `product-promise.md` Level 4's, and the term in the
 * right-hand column is ADR 0033 §6's — copied off the evidence, never chosen to
 * suit the sentence.
 */

// Cross-hostname destinations carry UTM per HORO-47 §5.2; same-hostname ones
// (/product) must not, or the visitor's session source is overwritten in GA4.
const UTM_DOCS =
  'utm_source=product_site&utm_medium=docs_link&utm_campaign=agent_assembly_launch';

function hub(page: string): string {
  return `${DOCS_URL}/${page}?${UTM_DOCS}`;
}

/**
 * The canonical architecture record. Everything on this page is downstream of
 * it, so the page links to it by name rather than summarising it as anonymous
 * "our documentation".
 */
const ADR_0033 = `${DOCS_URL}/core/latest/adr/0033-canonical-governance-and-enforcement-architecture.html?${UTM_DOCS}`;
const LIMITATIONS_DOC = `${DOCS_URL}/core/latest/devtools/limitations.html?${UTM_DOCS}`;
const SECURITY_DOC = hub('security-model.html');
const CLAIMS_DOC = hub('role-narratives.html');
const CORE_DOCS = `${DOCS_URL}/core/?${UTM_DOCS}`;
const PRODUCT = '/product';

interface Role {
  readonly key: string;
  readonly name: ReactNode;
  readonly what: ReactNode;
  readonly today: ReactNode;
}

/**
 * The six roles, in ADR 0033 §1's order.
 *
 * That order is the ADR's numbering, kept so a reader can cross-reference — it
 * is NOT a ranking and NOT a sequence, which is why nothing here renders an
 * ordinal and why the control plane, first in the ADR, is the one role that
 * cannot stop anything on its own.
 */
function roles(): readonly Role[] {
  return [
    {
      key: 'plane',
      name: (
        <Translate id="hiw.role.plane.name">Governance control plane</Translate>
      ),
      what: (
        <Translate id="hiw.role.plane.what">
          The authority that holds policy, identity, budgets, approvals and
          audit, and answers decision requests. It holds no traffic of its own.
        </Translate>
      ),
      today: (
        <Translate id="hiw.role.plane.today">
          Runs anywhere. Its refusal stops an action only where something in
          front of that action waits for the answer.
        </Translate>
      ),
    },
    {
      key: 'checkpoint',
      name: (
        <Translate id="hiw.role.checkpoint.name">
          Managed execution checkpoints
        </Translate>
      ),
      what: (
        <Translate id="hiw.role.checkpoint.what">
          Points on a routed path where an action is presented for a decision
          before it runs — a policy check from an SDK, a managed launch, or a
          tool handed to the sandbox.
        </Translate>
      ),
      today: (
        <Translate id="hiw.role.checkpoint.today">
          Runs anywhere, and is reachable only where the agent opts in. A
          process that does not make the call is not asking.
        </Translate>
      ),
    },
    {
      key: 'mediation',
      name: (
        <Translate id="hiw.role.mediation.name">
          Protocol and transport mediation
        </Translate>
      ),
      what: (
        <Translate id="hiw.role.mediation.what">
          A mediator placed on the wire that can refuse, redact or rewrite a
          request before it leaves the machine. This is where refusal before the
          action is strongest, because it sits outside the agent’s process.
        </Translate>
      ),
      today: (
        <Translate id="hiw.role.mediation.today">
          macOS and Linux. There is no Windows build path, so on Windows this
          role is absent rather than degraded.
        </Translate>
      ),
    },
    {
      key: 'host',
      name: (
        <Translate id="hiw.role.host.name">
          Platform-specific host-level adapters
        </Translate>
      ),
      what: (
        <Translate id="hiw.role.host.what">
          Operating-system-level mediation of processes, files and encrypted
          traffic. Each platform needs its own mechanism, and a platform without
          one has none — this is the role that is most often simply missing.
        </Translate>
      ),
      today: (
        <Translate id="hiw.role.host.today">
          Linux has one and it observes. macOS and Windows have no adapter; see
          the platform section, which states what macOS has instead.
        </Translate>
      ),
    },
    {
      key: 'credentials',
      name: (
        <Translate id="hiw.role.credentials.name">
          Credential and capability boundary
        </Translate>
      ),
      what: (
        <Translate id="hiw.role.credentials.what">
          What a component is allowed to ask for, and how a credential or a
          capability is bound to an identity — including the scanning and
          redaction applied to outbound requests.
        </Translate>
      ),
      today: (
        <Translate id="hiw.role.credentials.today">
          Runs anywhere. An agent presents an identity and a possession proof,
          and that identity is asserted rather than established.
        </Translate>
      ),
    },
    {
      key: 'evidence',
      name: (
        <Translate id="hiw.role.evidence.name">
          Evidence and protection-state pipeline
        </Translate>
      ),
      what: (
        <Translate id="hiw.role.evidence.what">
          How a claim is substantiated, downgraded and reported — including
          reporting that a role was configured and unavailable, or absent
          altogether. This is the role that makes the other five legible.
        </Translate>
      ),
      today: (
        <Translate id="hiw.role.evidence.today">
          Runs anywhere. Writing is best-effort, so it records what got through
          rather than a ledger of what happened.
        </Translate>
      ),
    },
  ];
}

interface MechanismRow {
  readonly key: string;
  readonly mechanism: ReactNode;
  /**
   * The ADR 0033 §6 term, rendered as a badge rather than as bold inside the
   * sentence. That is not only a visual choice: `<Translate>` accepts a plain
   * string and nothing else, so a term emphasised inside the prose would have
   * to leave the message catalogue — and a term that is not in the catalogue is
   * a term zh-Hant never receives.
   */
  readonly term: ReactNode;
  readonly note: ReactNode;
}

/**
 * `product-promise.md` Level 4's mechanism table.
 *
 * This is the page's answer to the hardest question an evaluator asks — the
 * difference between something being seen, something being judged, and something
 * being stopped. The right-hand column is the highest ADR 0033 §6 term the
 * mechanism can legitimately reach TODAY. Raising a cell is a claim change and
 * needs the evidence to move first.
 */
function mechanisms(): readonly MechanismRow[] {
  return [
    {
      key: 'proxy',
      mechanism: (
        <Translate id="hiw.mech.proxy.name">
          The proxy — connection-time refusal, in-tunnel host re-check,
          credential block, MCP tool-call adjudication
        </Translate>
      ),
      term: (
        <Translate id="hiw.mech.proxy.term">Denied before execution</Translate>
      ),
      note: (
        <Translate id="hiw.mech.proxy.note">
          For traffic that is routed through it and inspected.
        </Translate>
      ),
    },
    {
      key: 'gateway',
      mechanism: (
        <Translate id="hiw.mech.gateway.name">
          The control plane’s action check
        </Translate>
      ),
      term: <Translate id="hiw.mech.gateway.term">Evaluated</Translate>,
      note: (
        <Translate id="hiw.mech.gateway.note">
          It reaches refusal before the action only through a caller that waits
          on the answer, and today that set has two members: the MCP path, and
          an SDK shim that honours the answer.
        </Translate>
      ),
    },
    {
      key: 'runtime',
      mechanism: (
        <Translate id="hiw.mech.runtime.name">
          The runtime policy checkpoint
        </Translate>
      ),
      term: <Translate id="hiw.mech.runtime.term">Evaluated</Translate>,
      note: (
        <Translate id="hiw.mech.runtime.note">
          It reaches refusal before the action only if the SDK shim honours the
          answer.
        </Translate>
      ),
    },
    {
      key: 'scanner',
      mechanism: (
        <Translate id="hiw.mech.scanner.name">The runtime scanner</Translate>
      ),
      term: <Translate id="hiw.mech.scanner.term">Redacted</Translate>,
      note: (
        <Translate id="hiw.mech.scanner.note">
          It runs after the action and returns counters, not a verdict.
        </Translate>
      ),
    },
    {
      key: 'sdk',
      mechanism: <Translate id="hiw.mech.sdk.name">The SDK client</Translate>,
      term: <Translate id="hiw.mech.sdk.term">Evaluated — advisory</Translate>,
      note: (
        <Translate id="hiw.mech.sdk.note">
          It is not an enforcement point.
        </Translate>
      ),
    },
    {
      key: 'probes',
      mechanism: (
        <Translate id="hiw.mech.probes.name">
          Linux kernel probes for encrypted traffic, files and process execution
        </Translate>
      ),
      term: (
        <Translate id="hiw.mech.probes.term">Observed · Detected</Translate>
      ),
      note: (
        <Translate id="hiw.mech.probes.note">
          No such signal takes part in any allow or deny decision.
        </Translate>
      ),
    },
    {
      key: 'guard',
      mechanism: (
        <Translate id="hiw.mech.guard.name">The Linux syscall guard</Translate>
      ),
      term: <Translate id="hiw.mech.guard.term">Detected</Translate>,
      note: (
        <Translate id="hiw.mech.guard.note">
          Plus terminating the process afterwards. The offending call has
          already run by the time the process dies, so this is explicitly not
          refusal before the action.
        </Translate>
      ),
    },
    {
      key: 'sandbox',
      mechanism: (
        <Translate id="hiw.mech.sandbox.name">The WASM sandbox</Translate>
      ),
      term: (
        <Translate id="hiw.mech.sandbox.term">
          Denied before execution
        </Translate>
      ),
      note: (
        <Translate id="hiw.mech.sandbox.note">
          For tools handed to it — but it is not on an agent’s normal tool-call
          path, so it is not a general guarantee.
        </Translate>
      ),
    },
    {
      key: 'devtool',
      mechanism: (
        <Translate id="hiw.mech.devtool.name">
          Developer-tool configuration writes
        </Translate>
      ),
      term: (
        <Translate id="hiw.mech.devtool.term">Not a data-path claim</Translate>
      ),
      note: (
        <Translate id="hiw.mech.devtool.note">
          Writing a tool’s own settings file is tool governance: it takes effect
          only if the tool honours those keys. Any prevention these integrations
          deliver is the proxy’s, borrowed through the launch environment they
          inject.
        </Translate>
      ),
    },
  ];
}

interface Platform {
  readonly key: string;
  readonly name: ReactNode;
  readonly text: ReactNode;
  readonly bound: ReactNode;
}

/**
 * The per-platform section — and the only place on this site where eBPF is
 * explained, because it is one Linux mechanism rather than a tier of the
 * architecture.
 *
 * The macOS cell needs both of its halves or it is wrong in one direction or the
 * other. It has no host-level interception adapter, and saying so is required.
 * It is also the only platform on which the host-enforcement rung is reachable
 * at all. A summariser reliably drops the second half; ADR 0033 §5.3 ends its
 * macOS row with the instruction not to, and that instruction is honoured here.
 */
function platforms(): readonly Platform[] {
  return [
    {
      key: 'linux',
      name: <Translate id="hiw.platform.linux.name">Linux</Translate>,
      text: (
        <Translate id="hiw.platform.linux.text">
          Transport mediation is a released artifact. Host-level adapting is
          done with eBPF: kernel probes report plaintext from encrypted
          connections, process execution and file activity. One program in that
          set enforces rather than reports — an opt-in syscall guard that
          terminates a confined process.
        </Translate>
      ),
      bound: (
        <Translate id="hiw.platform.linux.bound">
          No eBPF signal takes part in any allow or deny decision. The guard
          terminates the process after the offending call has already run, which
          is detection followed by a kill, not refusal before the action; it is
          off unless a specific process is named. File-activity probes are
          x86_64 only, and the privileged loader daemon that owns every kernel
          operation is published to the crate registry rather than in the
          release downloads.
        </Translate>
      ),
    },
    {
      key: 'macos',
      name: <Translate id="hiw.platform.macos.name">macOS</Translate>,
      text: (
        <Translate id="hiw.platform.macos.text">
          Transport mediation works and is the route to most of what this site
          describes; it is installed from source rather than from the release
          downloads. There is no operating-system-level interception adapter,
          and building one is an explicit non-goal.
        </Translate>
      ),
      bound: (
        <Translate id="hiw.platform.macos.bound">
          Do not read that as no host enforcement on macOS. It is the one
          platform on which the host-enforcement rung is reachable at all,
          through an opt-in, authorized settings write for the managed Claude
          Code launch. Two things bound that hard. What the write establishes is
          that the file says the right thing; whether the tool honours those
          keys while it runs is unmeasured. And the rung is recorded as unearned
          at the published v0.0.1-rc.6 tag — the evidence it rests on postdates
          that tag.
        </Translate>
      ),
    },
    {
      key: 'windows',
      name: <Translate id="hiw.platform.windows.name">Windows</Translate>,
      text: (
        <Translate id="hiw.platform.windows.text">
          There is no local mediation of any kind. Transport mediation has no
          Windows build path, and no host-level adapter exists.
        </Translate>
      ),
      bound: (
        <Translate id="hiw.platform.windows.bound">
          The control plane, the CLI and the SDKs run there, so a policy check
          from your own code still reaches a decision. What is missing is
          anything on the wire to apply it to traffic your code did not make.
        </Translate>
      ),
    },
  ];
}

/**
 * The ways an action ends up outside the boundary — ADR 0033 §4's table, in
 * plain language.
 *
 * Published as a list rather than summarised as "some things are not covered",
 * because the enumeration is the honest part: each row is a measured condition,
 * and a reader can check their own deployment against it.
 */
function outside(): readonly string[] {
  return [
    translate({
      id: 'hiw.outside.nocall',
      message:
        'The agent never calls the checkpoint. The call is voluntary; a process that does not make it is not asking, and nothing about it is known.',
    }),
    translate({
      id: 'hiw.outside.notHonoured',
      message:
        'The answer is not honoured. The SDK evaluates and returns a decision; refusing to execute lives in the language shim around it, not in the client.',
    }),
    translate({
      id: 'hiw.outside.notRouted',
      message:
        'Traffic never reaches the mediator. Proxy settings are injected by a managed launch — an ambient value, a removed one, or a session started by hand changes what is covered.',
    }),
    translate({
      id: 'hiw.outside.noLaunch',
      message:
        'The tool has no managed launch to offer. One shipped integration cannot build a governed launch command at all, and another is capped at observation, so neither injects anything to route.',
    }),
    translate({
      id: 'hiw.outside.notInspected',
      message:
        'The destination is mediated but not inspected. Payload inspection is limited to model-provider hosts by default, so another host is tunnelled with its connection observed and its payload not.',
    }),
    translate({
      id: 'hiw.outside.unhooked',
      message:
        'The encryption library is not one the probes hook. They attach to OpenSSL symbols, which Go’s own TLS stack and Node’s statically linked one do not expose.',
    }),
    translate({
      id: 'hiw.outside.noAdapter',
      message:
        'The platform has no host-level adapter — macOS and Windows, as above.',
    }),
  ];
}

export default function HowItWorks(): ReactNode {
  return (
    <Layout
      title={translate({
        id: 'hiw.meta.title',
        message: 'How it works — Agent Assembly',
      })}
      /*
       * A description is a metadata surface: a claim placed here travels
       * without its bound, into a search result and a chat unfurl. So this one
       * makes no coverage claim at all — it describes the shape of the
       * architecture and the question the page answers, both of which are
       * self-bounding.
       */
      description={translate({
        id: 'hiw.meta.description',
        message:
          'Agent Assembly’s architecture is six roles rather than an ordered pipeline: what each role is, which of them can refuse an action before it runs, and where the platform changes the answer.',
      })}
    >
      <div className={styles.wrap}>
        <div className={styles.kicker}>
          <Translate id="hiw.kicker">How it works</Translate>
        </div>
        <h1 className={styles.title}>
          <Translate id="hiw.title">
            Six roles — and only some of them can stop anything.
          </Translate>
        </h1>
        <p className={styles.intro}>
          <Translate id="hiw.intro">
            Agent Assembly is not a fixed pipeline. Its architecture is a set of
            roles, and a deployment instantiates the ones you actually put in
            place. This page names the six, says which of them can refuse an
            action before it runs, and shows where the platform changes the
            answer.
          </Translate>
        </p>
        <p className={styles.lede}>
          <Translate id="hiw.lede">
            The one thing to carry away: a role you have not deployed is
            reported as absent. There is nothing underneath it that picks up
            what it would have done.
          </Translate>
        </p>

        <section className={styles.block} id="shape">
          <div className={styles.eyebrow}>
            <Translate id="hiw.shape.eyebrow">The shape</Translate>
          </div>
          <h2 className={styles.blockTitle}>
            <Translate id="hiw.shape.title">
              A field of roles, not a stack of tiers
            </Translate>
          </h2>
          <p className={styles.p}>
            <Translate id="hiw.shape.body">
              Two rules give the picture its shape, and they are the reason it
              is drawn this way. First, a role may be absent, and its absence is
              something the product reports rather than something another role
              quietly covers. Second, a role’s authority belongs to that role:
              the control plane decides but holds no traffic, transport
              mediation holds traffic and can refuse it, and today the Linux
              host adapter mostly watches. Nothing in the model makes them
              interchangeable.
            </Translate>
          </p>

          {/*
           * The diagram. See the `.field` comment in narrative.module.css for
           * the three layout rules that keep it from becoming the pipeline it
           * replaced — the most important being that no connector runs between
           * the routed-path roles.
           *
           * The caption and the two group labels are the only devices that stop
           * an fd-1 reading, so BOTH must be true at every viewport width. They
           * were not: the caption said "on the left" and "on the right", and the
           * grid collapses to one column at 800px, so on every phone and on a
           * tablet in portrait there is no left or right — and the control plane
           * landed fourth, directly under the three routed-path roles, which is
           * exactly the "layer below that picks up what an absent one would have
           * done" fd-3 forbids.
           *
           * The fix is textual rather than positional on purpose. Reordering the
           * boxes with CSS `order` would leave the DOM sequence — the one a
           * screen reader follows — disagreeing with the visual one. So the
           * control plane carries a label that contrasts with the routed-path
           * group's ("Not on any path" against "On a path you routed"), and the
           * caption names the boxes instead of pointing at them. Both survive
           * the collapse. Do not reintroduce a spatial word here.
           */}
          <figure className={styles.field}>
            <div className={styles.fieldPath}>
              <p className={styles.fieldLabel}>
                <Translate id="hiw.field.pathLabel">
                  On a path you routed
                </Translate>
              </p>
              <div className={styles.roleChip}>
                <p className={styles.roleChipName}>
                  <Translate id="hiw.field.checkpoint">
                    Managed execution checkpoints
                  </Translate>
                </p>
                <p className={styles.roleChipNote}>
                  <Translate id="hiw.field.checkpointNote">
                    Decide before the action runs · ask the control plane
                  </Translate>
                </p>
              </div>
              <div className={styles.roleChip}>
                <p className={styles.roleChipName}>
                  <Translate id="hiw.field.mediation">
                    Protocol and transport mediation
                  </Translate>
                </p>
                <p className={styles.roleChipNote}>
                  <Translate id="hiw.field.mediationNote">
                    Decides before the request leaves the machine · refuses on
                    its own configuration, and asks the control plane for tool
                    calls
                  </Translate>
                </p>
              </div>
              <div className={styles.roleChip}>
                <p className={styles.roleChipName}>
                  <Translate id="hiw.field.host">
                    Platform-specific host-level adapters
                  </Translate>
                </p>
                <p className={styles.roleChipNote}>
                  <Translate id="hiw.field.hostNote">
                    Platform-dependent and often absent · report to the evidence
                    pipeline, decide nothing
                  </Translate>
                </p>
              </div>
            </div>
            <div className={styles.fieldPlane}>
              <p className={styles.fieldLabel}>
                <Translate id="hiw.field.planeLabel">Not on any path</Translate>
              </p>
              <p className={styles.planeName}>
                <Translate id="hiw.field.plane">
                  Governance control plane
                </Translate>
              </p>
              <p className={styles.planeNote}>
                <Translate id="hiw.field.planeNote">
                  Policy · identity · budgets · approvals · audit. Answers
                  decision requests, and holds no traffic.
                </Translate>
              </p>
            </div>
            <div className={styles.fieldSpan}>
              <div className={styles.roleChip}>
                <p className={styles.roleChipName}>
                  <Translate id="hiw.field.credentials">
                    Credential and capability boundary
                  </Translate>
                </p>
                <p className={styles.roleChipNote}>
                  <Translate id="hiw.field.credentialsNote">
                    Runs across the others · what each may ask for, and how a
                    credential is bound to an identity
                  </Translate>
                </p>
              </div>
              <div className={styles.roleChip}>
                <p className={styles.roleChipName}>
                  <Translate id="hiw.field.evidence">
                    Evidence and protection-state pipeline
                  </Translate>
                </p>
                <p className={styles.roleChipNote}>
                  <Translate id="hiw.field.evidenceNote">
                    Runs across the others · records what was decided, and
                    reports what was absent
                  </Translate>
                </p>
              </div>
            </div>
            <div className={styles.fieldOutside}>
              <p className={styles.fieldOutsideName}>
                <Translate id="hiw.field.outside">
                  Outside the path you routed
                </Translate>
              </p>
              <p className={styles.roleChipNote}>
                <Translate id="hiw.field.outsideNote">
                  An unmanaged launch · traffic that never reached a mediator ·
                  an encryption library nothing hooks · a platform with no
                  adapter. Not decided — and the record says so.
                </Translate>
              </p>
            </div>
            <figcaption className={styles.fieldLegend}>
              <Translate id="hiw.field.legend">
                Read the picture for what it does not contain. Nothing connects
                the three roles on the routed path to one another, and they are
                listed in no order: none hands work to another, none is a
                fallback for another, and one you have not deployed leaves a
                hole that gets reported rather than filled. The governance
                control plane is not on any path — it decides and holds no
                traffic, so its answer stops an action only where one of the
                routed-path roles is already waiting in front of that action.
              </Translate>
            </figcaption>
          </figure>
        </section>

        <section className={styles.block} id="roles">
          <div className={styles.eyebrow}>
            <Translate id="hiw.roles.eyebrow">The six roles</Translate>
          </div>
          <h2 className={styles.blockTitle}>
            <Translate id="hiw.roles.title">
              What each one is, and what you get today
            </Translate>
          </h2>
          <div className={styles.cardGrid}>
            {roles().map((r) => (
              <div key={r.key} className={styles.card}>
                <h3 className={styles.cardTitle}>{r.name}</h3>
                <p className={styles.cardText}>{r.what}</p>
                <p className={styles.cardBound}>
                  <span className={styles.boundLabel}>
                    <Translate id="hiw.roles.todayLabel">Today.</Translate>
                  </span>{' '}
                  {r.today}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.block} id="reach">
          <div className={styles.eyebrow}>
            <Translate id="hiw.mech.eyebrow">
              Seen, judged, or stopped
            </Translate>
          </div>
          <h2 className={styles.blockTitle}>
            <Translate id="hiw.mech.title">
              Which mechanism can actually stop something
            </Translate>
          </h2>
          <p className={styles.p}>
            <Translate id="hiw.mech.lead">
              Three different things get called protection, and telling them
              apart is most of an evaluation. Observed means an event reached
              the record. Evaluated means a decision was produced for the
              action. Denied before execution means the action did not take
              effect and the decision came first. Only the third is prevention —
              and the table below says which mechanism reaches it.
            </Translate>
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">
                    <Translate id="hiw.mech.colMechanism">Mechanism</Translate>
                  </th>
                  <th scope="col">
                    <Translate id="hiw.mech.colReach">
                      Highest it reaches today
                    </Translate>
                  </th>
                </tr>
              </thead>
              <tbody>
                {mechanisms().map((m) => (
                  <tr key={m.key}>
                    <th scope="row">{m.mechanism}</th>
                    <td>
                      <span className={styles.termBadge}>{m.term}</span>{' '}
                      {m.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.boundNote}>
            <strong>
              <Translate id="hiw.mech.eventLabel">
                One inference this table exists to block.
              </Translate>
            </strong>{' '}
            <Translate id="hiw.mech.event">
              An audit event proves that something was observed. It never proves
              the action was stopped. A record and a refusal are different
              outcomes, and a page that treats one as evidence of the other is
              the failure this whole architecture was rewritten to prevent.
            </Translate>
          </p>
        </section>

        <section className={styles.block} id="platforms">
          <div className={styles.eyebrow}>
            <Translate id="hiw.platform.eyebrow">Platforms</Translate>
          </div>
          <h2 className={styles.blockTitle}>
            <Translate id="hiw.platform.title">
              Where the platform changes the answer
            </Translate>
          </h2>
          <p className={styles.p}>
            <Translate id="hiw.platform.lead">
              Host-level adapting is the one role that is genuinely
              platform-specific, and it is where a picture drawn for one
              operating system misleads a reader running another. Each platform
              needs its own mechanism, and where a platform has none, it has
              none.
            </Translate>
          </p>
          <div className={styles.grid3}>
            {platforms().map((p) => (
              <div key={p.key} className={styles.card}>
                <h3 className={styles.cardTitle}>{p.name}</h3>
                <p className={styles.cardText}>{p.text}</p>
                <p className={styles.cardBound}>{p.bound}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.block} id="boundary">
          <div className={styles.eyebrow}>
            <Translate id="hiw.outside.eyebrow">The boundary</Translate>
          </div>
          <h2 className={styles.blockTitle}>
            <Translate id="hiw.outside.title">
              When an action is outside all of this
            </Translate>
          </h2>
          <p className={styles.p}>
            <Translate id="hiw.outside.lead">
              An action is on the governed path when, before it takes effect, it
              is presented to something that is configured to decide and to
              honour the answer. It is outside the boundary when any link in
              that chain is missing. These are the ways that happens today, each
              one measured rather than imagined.
            </Translate>
          </p>
          <ul className={styles.limitList}>
            {outside().map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
          <p className={styles.boundNote}>
            <strong>
              <Translate id="hiw.outside.ruleLabel">
                What gets recorded instead.
              </Translate>
            </strong>{' '}
            <Translate id="hiw.outside.rule">
              For anything outside the boundary, nothing is known about the
              action, so the rule is that it is not reported as allowed and not
              as clean: the record says the action or its payload was not
              inspected. Read that as scoped to the action rather than to the
              connection carrying it — a host the proxy does not inspect is
              still adjudicated when the connection is made, so the connection
              is observed while the payload is not. One live defect runs against
              this rule today: the connection-level event still records an allow
              for traffic that is about to be tunnelled uninspected, tracked as
              AAASM-5637. Take the rule and the open defect together rather than
              as finished behaviour. And a quiet log is evidence about the
              observer, never about the agent.
            </Translate>
          </p>
        </section>

        <section className={styles.block} id="deeper">
          <div className={styles.eyebrow}>
            <Translate id="hiw.deeper.eyebrow">Go deeper</Translate>
          </div>
          <h2 className={styles.blockTitle}>
            <Translate id="hiw.deeper.title">
              This page stops here on purpose
            </Translate>
          </h2>
          <p className={styles.p}>
            <Translate id="hiw.deeper.lead">
              Below this depth the answers live in the engineering record, where
              they are versioned with the code they describe. Each link goes to
              the source this page derives from — none of it is restated here,
              because a second copy drifts from the first inside one release.
            </Translate>
          </p>
          <div className={styles.grid2}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <Translate id="hiw.deeper.adr.title">
                  The architecture decision record
                </Translate>
              </h3>
              <p className={styles.cardText}>
                <Translate id="hiw.deeper.adr.text">
                  The canonical account of the six roles, the per-platform
                  matrix and the vocabulary this page uses, with a source
                  citation on each row.
                </Translate>
              </p>
              <TrackedLink
                className={styles.link}
                eventName="cta_view_docs_click"
                ctaLocation="body"
                targetProduct="docs"
                alsoFire={['docs_click']}
                to={ADR_0033}
                linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
              >
                <Translate id="hiw.deeper.adr.link">
                  Read the decision record →
                </Translate>
              </TrackedLink>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <Translate id="hiw.deeper.security.title">
                  The trust boundary
                </Translate>
              </h3>
              <p className={styles.cardText}>
                <Translate id="hiw.deeper.security.text">
                  The threat model, the failure posture of each control
                  including the ones that fail open, and the enumerated ways
                  around the boundary.
                </Translate>
              </p>
              <TrackedLink
                className={styles.link}
                eventName="cta_view_docs_click"
                ctaLocation="body"
                targetProduct="docs"
                alsoFire={['docs_click']}
                to={SECURITY_DOC}
                linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
              >
                <Translate id="hiw.deeper.security.link">
                  Read the security model →
                </Translate>
              </TrackedLink>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <Translate id="hiw.deeper.limits.title">
                  Limits, per integration
                </Translate>
              </h3>
              <p className={styles.cardText}>
                <Translate id="hiw.deeper.limits.text">
                  What each developer-tool integration covers and what it does
                  not, including the two that cannot put a tool on the path at
                  all.
                </Translate>
              </p>
              <TrackedLink
                className={styles.link}
                eventName="cta_view_docs_click"
                ctaLocation="body"
                targetProduct="docs"
                alsoFire={['docs_click']}
                to={LIMITATIONS_DOC}
                linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
              >
                <Translate id="hiw.deeper.limits.link">
                  Read the known limits →
                </Translate>
              </TrackedLink>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <Translate id="hiw.deeper.claims.title">
                  Every claim, with its evidence
                </Translate>
              </h3>
              <p className={styles.cardText}>
                <Translate id="hiw.deeper.claims.text">
                  The shared register this page and the rest of the site quote
                  from — each entry with the term it reaches, its bound, and the
                  evidence rows behind it.
                </Translate>
              </p>
              <TrackedLink
                className={styles.link}
                eventName="cta_view_docs_click"
                ctaLocation="body"
                targetProduct="docs"
                alsoFire={['docs_click']}
                to={CLAIMS_DOC}
                linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
              >
                <Translate id="hiw.deeper.claims.link">
                  Read the claim register →
                </Translate>
              </TrackedLink>
            </div>
          </div>
        </section>

        <div className={styles.ctaRow}>
          <Link className={styles.btnPrimary} to={PRODUCT}>
            <Translate id="hiw.cta.product">
              ← What the product decides
            </Translate>
          </Link>
          <TrackedLink
            className={styles.btnGhost}
            eventName="cta_view_docs_click"
            ctaLocation="footer"
            targetProduct="docs"
            alsoFire={['docs_click']}
            to={CORE_DOCS}
            linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
          >
            <Translate id="hiw.cta.coreDocs">Core &amp; gateway docs</Translate>
          </TrackedLink>
        </div>
      </div>
    </Layout>
  );
}
