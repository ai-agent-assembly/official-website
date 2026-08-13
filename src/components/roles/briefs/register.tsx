import React from 'react';
import Translate, {translate} from '@docusaurus/Translate';
import {TrackedLink} from '@site/src/components/Tracked';
import type {Claim} from '../types';
import {ROLE_NARRATIVES, RISK_SCENARIOS} from './shared';

/*
 * AAASM-5587 — the shared claim register, as the four role surfaces render it.
 *
 * `role-narratives.md` on the Docs Hub owns this register and gives sixteen
 * entries, and all sixteen are here. Ten are cited as intervention claims and
 * render as cards; the other six — RC7, RC8, RC9, RC12, RC14, RC16 — are cited
 * only inside a Limitations section and render there, through the same shared
 * objects, so that every register sentence anywhere on these four pages carries
 * the term that says how far it reaches and the bound that limits it.
 *
 * WHY THIS IS ONE MODULE AND NOT FOUR COPIES
 * ------------------------------------------
 * The register exists because role pages are the classic place where one
 * product acquires four product truths: four audiences, four authors, and the
 * security page ends up describing a stronger product than the engineering
 * page, without either author intending it. The hub page's remedy is that every
 * capability sentence in all four briefs is drawn from one numbered register,
 * and a brief may cite an entry or stay silent — it may not restate one at a
 * different strength.
 *
 * Writing each entry once, here, makes that a property of the code rather than
 * of review. Two pages citing RC1 cannot disagree about RC1, because there is
 * only one RC1 to cite. A brief that needed a weaker form of an entry would
 * have to change it for every page at once, which is exactly the friction the
 * register is for.
 *
 * WHAT MAY AND MAY NOT BE EDITED HERE
 * -----------------------------------
 * The text and the bound are quoted from the register VERBATIM — a paraphrase
 * is a new claim and carries its own evidence burden, and 5584's implementer
 * contract is explicit that "if a layout needs something shorter than the
 * register gives, that is a layout problem". ADR 0034 puts this site below the
 * hub in the one-product-truth hierarchy: a surface may simplify what the
 * register says and may never broaden it, and shortening a bound is the most
 * common way to broaden one by accident.
 *
 * Verbatim includes the parts that are inconvenient to render:
 *
 *   - Identifiers stay as the register writes them — `llm_only`, `WrapTools`,
 *     `aasm run --no-proxy`, `cargo install aa-proxy`. An earlier pass rendered
 *     each in plain language, which reads better and is a different sentence.
 *   - Manifest field names stay too. RC6 and RC13 cite three fields each, and
 *     the field an abridgement drops is `evidence: gap` — the difference
 *     between "measured and found wanting" and "not measured at all".
 *   - The register's own cross-references stay, rendered as links rather than
 *     deleted. They sit inside the Bound column, so cutting one to fit a card
 *     is the same edit as cutting any other part of a bound.
 *
 * `scripts/check-register-drift.py` diffs what this file renders against the
 * register itself. Run it after editing anything below.
 *
 * The `term` is copied off the entry, which copies it off the manifest rows'
 * own `coverage` field. It is never chosen to suit a sentence. Where an entry
 * carries several terms — RC5, RC11 — they are per path, not per audience, and
 * the register names which path takes which.
 */

/*
 * The register's own cross-references, rendered as links rather than dropped.
 *
 * Two bounds — RC6's and RC13's — end by pointing at the register's "two gaps"
 * section, and RC13's cites Risk scenarios' T3 mid-sentence. Those pointers are
 * inside the Bound column, so removing them to fit a card would be the same
 * edit as removing any other part of a bound. Rendering them as links keeps the
 * wording intact AND gives the reader the route to the evidence, which is the
 * thing a "see X" is for.
 */
function docsLink(href: string, label: string): React.ReactNode {
  return (
    <TrackedLink
      eventName="cta_view_docs_click"
      ctaLocation="body"
      targetProduct="docs"
      alsoFire={['docs_click']}
      to={href}
      linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
    >
      {label}
    </TrackedLink>
  );
}

const TwoGapsLink = () =>
  docsLink(
    `${ROLE_NARRATIVES}#two-gaps-this-page-found-in-the-manifest`,
    translate({id: 'roles.register.twoGaps', message: 'the two gaps'}),
  );

const RiskScenariosLink = () =>
  docsLink(
    RISK_SCENARIOS,
    translate({id: 'roles.register.riskScenarios', message: 'Risk scenarios'}),
  );

export const RC1: Claim = {
  rc: 'RC1',
  term: <Translate id="roles.rc1.term">Denied before execution</Translate>,
  text: (
    <Translate id="roles.rc1.text">
      A connection made on a path you routed through Agent Assembly is checked
      against the destination list you configured and refused before the proxy
      dials it.
    </Translate>
  ),
  bound: (
    <Translate id="roles.rc1.bound">
      The refusal is the proxy’s own local egress configuration, not a
      control-plane decision. The destination lists are empty by default — this
      refusal exists because an operator configured it. Linux release artifact;
      on macOS cargo install aa-proxy is the only route; on Windows there is no
      local mediation. If the proxy is not in front of the connection, the
      connection is simply made.
    </Translate>
  ),
};

export const RC2: Claim = {
  rc: 'RC2',
  term: <Translate id="roles.rc2.term">Denied before execution</Translate>,
  text: (
    <Translate id="roles.rc2.text">
      Requests to loopback, private, link-local and related address space are
      refused, including where a public hostname resolves into them.
    </Translate>
  ),
  bound: (
    <Translate id="roles.rc2.bound">
      On by default, fails closed, and no configuration relaxes it. It ranges
      over address space, not over an arbitrary public destination — it does not
      deliver RC1 and must not be credited with doing so.
    </Translate>
  ),
};

export const RC3: Claim = {
  rc: 'RC3',
  term: <Translate id="roles.rc3.term">Redacted</Translate>,
  text: (
    <Translate id="roles.rc3.text">
      On the model-provider hosts Agent Assembly inspects, a recognised
      credential is removed from the request before it is forwarded.
    </Translate>
  ),
  bound: (
    <Translate id="roles.rc3.bound">
      Three built-in hosts, because llm_only defaults on. The default action is
      redact and forward, not refuse. Recall is bounded by the pattern set —
      there is no Stripe detector. Model responses on that path are not scanned.
    </Translate>
  ),
};

export const RC4: Claim = {
  rc: 'RC4',
  term: <Translate id="roles.rc4.term">Denied before execution</Translate>,
  text: (
    <Translate id="roles.rc4.text">
      An MCP tool call can be checked against your policy by the control plane
      and refused before the proxy forwards it.
    </Translate>
  ),
  bound: (
    <Translate id="roles.rc4.bound">
      The only gateway-bound pre-dial refusal in the product, and it is off by
      default. It reaches MCP sent as an ordinary HTTP/1.1 POST on an
      intercepted non-LLM host with a gateway endpoint configured. Tool servers
      over stdio — the most common setup — SSE and WebSocket have no
      interception mechanism; Streamable HTTP is recorded as functionally broken
      rather than merely uncovered.
    </Translate>
  ),
};

/*
 * RC5's term is three terms, and the slashes are load-bearing.
 *
 * "Denied before execution (Python, Go) · Evaluated (Node) · Unmeasured (Node
 * default mode)" is per language and per mode, not a range to pick the middle
 * of. Rendering only the strongest would tell a Node reader they have a refusal
 * they do not have — and Node's default mode routing the check through an
 * allow-all no-op client is, per the Engineering brief, the single most
 * important sentence on any Node integration page.
 */
export const RC5: Claim = {
  rc: 'RC5',
  term: (
    <Translate id="roles.rc5.term">
      Denied before execution (Python, Go) · Evaluated (Node) · Unmeasured (Node
      default mode)
    </Translate>
  ),
  text: (
    <Translate id="roles.rc5.text">
      A tool call through a wrapped framework seam is checked before the tool
      body runs.
    </Translate>
  ),
  bound: (
    <Translate id="roles.rc5.bound">
      The SDK is advisory by design — a defence-in-depth posture, not the
      authoritative gate, and an agent that does not call it is not asking.
      Python raises before the body and fails closed. Go fails closed but
      requires an explicit WrapTools. Node’s default mode routes the check
      through an allow-all no-op client, so no refusal is produced there at all;
      asking for enforcement without a check-capable mode is refused loudly at
      init rather than silently allowed.
    </Translate>
  ),
};

export const RC6: Claim = {
  rc: 'RC6',
  term: <Translate id="roles.rc6.term">Unmeasured</Translate>,
  text: (
    <Translate id="roles.rc6.text">
      Whether a given decision’s record durably reaches the audit chain is not
      established. The verification tool is real — aasm audit verify-chain ships
      in the open-source build — but what it proves is the integrity of the
      entries that are present, not that any particular decision produced one.
    </Translate>
  ),
  bound: (
    <Translate id="roles.rc6.bound" values={{twoGaps: <TwoGapsLink />}}>
      {
        'The manifest\u2019s only row for this subject is the row for what happens when the write fails, and it carries coverage: unmeasured, failure_posture: fail_open and evidence: gap. So the honest term is the row\u2019s own. Everything else about the chain is a bound, not a capability: it is tamper-evident, not immutable and not signed \u2014 an unkeyed digest, so anyone able to rewrite the sink can recompute it. The chain head advances before the send and a full channel drops the entry while the call still returns, which makes a dropped entry indistinguishable from a deleted one. An emptied log verifies clean. The proxy writes no local record at all unless its audit path is configured. See {twoGaps}.'
      }
    </Translate>
  ),
};

export const RC10: Claim = {
  rc: 'RC10',
  term: <Translate id="roles.rc10.term">Degraded</Translate>,
  text: (
    <Translate id="roles.rc10.text">
      Where a control was planned and is unavailable, the product reports the
      planned level and the level actually achieved.
    </Translate>
  ),
  bound: (
    <Translate id="roles.rc10.bound">
      Degraded carries both levels or it is not this term. One row reaches it,
      for eBPF load or attach failure. The reporting half does not close: a
      degradation is emitted, typed, and rendered nowhere, and an unreadable
      eBPF policy file fails open silently, raising no degradation event at all.
    </Translate>
  ),
};

export const RC11: Claim = {
  rc: 'RC11',
  term: (
    <Translate id="roles.rc11.term">
      Denied before execution · Evaluated
    </Translate>
  ),
  text: (
    <Translate id="roles.rc11.text">
      Where the control plane is configured and becomes unreachable, the
      decision path refuses rather than allowing.
    </Translate>
  ),
  bound: (
    <Translate id="roles.rc11.bound">
      Fail-closed on the paths that have a gateway: the runtime denies on an
      unreachable gateway, the proxy refuses to start, and the gateway aborts on
      a policy that fails to load. The inverse is not symmetric — a runtime with
      no gateway configured falls through to a local evaluation whose terminal
      default is allow. Configured-then-broken fails closed; never-configured
      fails open.
    </Translate>
  ),
};

export const RC13: Claim = {
  rc: 'RC13',
  term: <Translate id="roles.rc13.term">Unmeasured</Translate>,
  text: (
    <Translate id="roles.rc13.text">
      Whether a declared spend cap is checked in the decision path is not
      established by any manifest row.
    </Translate>
  ),
  bound: (
    <Translate
      id="roles.rc13.bound"
      values={{twoGaps: <TwoGapsLink />, riskScenarios: <RiskScenariosLink />}}
    >
      {
        'Same shape as RC6, and the same remedy. The manifest\u2019s only budget row is the one for a store that is unreadable or corrupt, carrying coverage: unmeasured, failure_posture: fail_open_silent and evidence: gap \u2014 its gap reason records a positive control showing the budget path never queries the control-plane store. {riskScenarios}\u2019s T3 reaches Evaluated and states in the same table that it has no positive row; this register does not restate T3\u2019s term over a row that does not carry it. What is bounded regardless: a cap exists only where a policy declares one, an undeclared budget is uncapped, reaching Denied before execution needs a caller that waits for the answer, and a corrupt store resets the cap to zero spend silently. See {twoGaps}.'
      }
    </Translate>
  ),
};

/*
 * RC15's term is "Denied before execution (via RC1)", and the parenthesis is
 * the whole claim. Writing a tool's own settings file is tool governance, not a
 * data-path claim; any prevention these adapters deliver is the proxy's,
 * borrowed through the launch environment. Dropping "via RC1" would credit the
 * launch adapter with a refusal it does not make.
 */
export const RC15: Claim = {
  rc: 'RC15',
  term: (
    <Translate id="roles.rc15.term">
      Denied before execution (via RC1)
    </Translate>
  ),
  text: (
    <Translate id="roles.rc15.text">
      Launching a tool through aasm run writes the proxy settings into the
      tool’s environment, which is what puts its outbound connections on the
      path.
    </Translate>
  ),
  bound: (
    <Translate id="roles.rc15.bound">
      Writing a tool’s own settings file is tool governance, not a data-path
      claim; any prevention these adapters deliver is the proxy’s, borrowed
      through the launch environment. Of the shipped adapters, Claude Code is
      the only one above Integrated and the only one with a launch evidence
      test. Copilot’s launch always fails by construction. Codex and Windsurf
      inject the proxy variable with no CA trust, which is the configuration
      measured as failing the handshake silently. aasm run --no-proxy is an
      announced bypass. An unmanaged launch is a bypass and is not detectable.
    </Translate>
  ),
};

/*
 * THE SIX ENTRIES THE BRIEFS CITE ONLY INSIDE A LIMITATIONS SECTION
 * -----------------------------------------------------------------
 * RC7, RC8, RC9, RC12, RC14 and RC16. They were hand-written prose in each
 * brief until the seam that produced showed up in review: the register's claim
 * SENTENCE for RC8 and RC16 had been pulled into a limitation without the term
 * that says how far it reaches, and RC14 had drifted into two versions — the
 * security page listing HTTP/2, gRPC, WebSocket and MCP-over-WebSocket as
 * outside the transport set, the platform page listing only UDP, QUIC and
 * HTTP/3. The operator got the shorter list. Nothing caught it, because the two
 * lists were two hand-written strings in two files.
 *
 * They live here now for the same reason the other ten do. An entry cited by
 * three pages is one object cited three times, so the three cannot disagree.
 *
 * RC9 carries an ADR 0030 protection state rather than an ADR 0033 §6 term, and
 * RC12's claim is the register's literal "No claim." Both are rendered as the
 * register writes them rather than normalised into the shape of the others.
 */

export const RC7: Claim = {
  rc: 'RC7',
  term: <Translate id="roles.rc7.term">Unmeasured</Translate>,
  text: (
    <Translate id="roles.rc7.text">
      Where nothing inspected an action, the record says nothing was inspected —
      not that it was allowed.
    </Translate>
  ),
  bound: (
    <Translate id="roles.rc7.bound">
      Scoped to the action or payload, never to the connection: a host the proxy
      does not intercept is still adjudicated at CONNECT, so its connection is
      Observed while its payload is Unmeasured. One live defect runs against
      this rule today — the CONNECT-level event still records an allow for
      traffic about to be tunnelled uninspected (AAASM-5637) — so state it as
      the rule and the open defect together, not as finished behaviour.
    </Translate>
  ),
};

export const RC8: Claim = {
  rc: 'RC8',
  term: <Translate id="roles.rc8.term">Observed · Detected</Translate>,
  text: (
    <Translate id="roles.rc8.text">
      On Linux, kernel probes report TLS plaintext, process execution and file
      activity.
    </Translate>
  ),
  bound: (
    <Translate id="roles.rc8.bound">
      No eBPF signal participates in any allow or deny decision. The one
      enforcing program is an opt-in syscall guard that terminates a confined
      process after the offending syscall has already run, which is Detected,
      not Denied before execution. File-I/O probes are x86_64 only. The
      privileged loader daemon that owns every kernel operation reaches
      crates.io only — it is absent from the GitHub Release assets, the Homebrew
      tap and the install script.
    </Translate>
  ),
};

export const RC9: Claim = {
  rc: 'RC9',
  term: (
    <Translate id="roles.rc9.term">— (ADR 0030 protection state)</Translate>
  ),
  text: (
    <Translate id="roles.rc9.text">
      The managed launch for Claude Code on macOS is the one path that reaches
      ADR 0030’s HostEnforced rung.
    </Translate>
  ),
  bound: (
    <Translate id="roles.rc9.bound">
      ADR 0030 §4.1 makes HostEnforced the only state that claims bypass
      resistance, and exactly one manifest row carries it. Two things bound it
      hard. The rung rests on reading back a root-owned managed-settings file,
      and whether the tool honours those keys at runtime is unmeasured. And the
      manifest records the rung as unearned at the published v0.0.1-rc.6 tag —
      the evidence it rests on postdates the tag. macOS host-level interception
      itself is integrated, scoped to tool governance only: claim the file,
      never the enforcement.
    </Translate>
  ),
};

/*
 * RC12's bound ends with an instruction to whoever is writing the page — "Do
 * not write 'held for human review', 'approval workflow', or any wording
 * implying a reviewer acts." That sentence is not rendered, and the omission is
 * deliberate rather than an abridgement of the bound.
 *
 * It is addressed to an author, not to a reader, and it is the one sentence in
 * the register whose verbatim rendering would publish the three phrasings the
 * product refuses to publish. The register can hold them because its own
 * rejected-wording section sits inside a `claim-gate:ignore` block; a role page
 * has no such exemption and should not acquire one. Everything in the bound
 * that tells a reader what they do and do not get is rendered.
 */
export const RC12: Claim = {
  rc: 'RC12',
  term: <Translate id="roles.rc12.term">Approval required</Translate>,
  text: <Translate id="roles.rc12.text">No claim.</Translate>,
  bound: (
    <Translate id="roles.rc12.bound">
      No manifest row reaches this term. The hold itself is real in the gateway
      path and fails closed on timeout, but no shipped operator surface can
      answer it, and inside the MCP tunnel a pending decision is downgraded to a
      refusal, so a human cannot be reached there either. AAASM-5657.
    </Translate>
  ),
};

export const RC14: Claim = {
  rc: 'RC14',
  term: <Translate id="roles.rc14.term">Unsupported</Translate>,
  text: (
    <Translate id="roles.rc14.text">
      Named transports and platforms are not available, and the matrix says
      which.
    </Translate>
  ),
  bound: (
    <Translate id="roles.rc14.bound">
      Windows has no local mediation of any kind. UDP, QUIC and HTTP/3 are
      outside the transport set; so are HTTP/2, gRPC and WebSocket over an
      intercepted host, and MCP over WebSocket. Unsupported for one element is
      not Unsupported for the product.
    </Translate>
  ),
};

export const RC16: Claim = {
  rc: 'RC16',
  term: <Translate id="roles.rc16.term">Evaluated</Translate>,
  text: (
    <Translate id="roles.rc16.text">
      An agent registers with an Ed25519 did:key identity and a possession
      proof, and delegation lineage is derived server-side.
    </Translate>
  ),
  bound: (
    <Translate id="roles.rc16.bound">
      The agent plane is reachable without authentication by design, as a
      bootstrap path: an unauthenticated caller that can reach it can register
      and can submit policy queries. Those queries are evaluated with tenancy
      neutralised rather than with the caller’s own, so the exposure is that the
      plane accepts the call. Org scoping is applied per call site rather than
      at the storage layer. Do not describe the agent plane as authenticated.
    </Translate>
  ),
};
