import React from 'react';
import Translate from '@docusaurus/Translate';
import type {Claim} from '../types';

/*
 * AAASM-5587 — the shared claim register, as the four role surfaces render it.
 *
 * `role-narratives.md` on the Docs Hub owns this register and gives sixteen
 * entries; the ten below are the ones the four briefs cite as intervention
 * claims. The remaining six — RC7, RC8, RC9, RC12, RC14, RC16 — are cited only
 * inside a Limitations section, in the prose of the brief that cites them, and
 * so have no card here.
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
 * The text and the bound are quoted from the register, not paraphrased — a
 * paraphrase is a new claim and carries its own evidence burden. ADR 0034 puts
 * this site below the hub in the one-product-truth hierarchy: a surface may
 * simplify what the register says and may never broaden it, and shortening a
 * bound is the most common way to broaden one by accident.
 *
 * The `term` is copied off the entry, which copies it off the manifest rows'
 * own `coverage` field. It is never chosen to suit a sentence. Where an entry
 * carries several terms — RC5, RC11 — they are per path, not per audience, and
 * the register names which path takes which.
 */

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
      on macOS a cargo install of aa-proxy is the only route; on Windows there
      is no local mediation. If the proxy is not in front of the connection, the
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
      Three built-in hosts, because payload inspection is limited to
      model-provider hosts by default. The default action is redact and forward,
      not refuse. Recall is bounded by the pattern set — there is no Stripe
      detector. Model responses on that path are not scanned.
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
      requires an explicit call to wrap the tools. Node’s default mode routes
      the check through an allow-all no-op client, so no refusal is produced
      there at all; asking for enforcement without a check-capable mode is
      refused loudly at init rather than silently allowed.
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
    <Translate id="roles.rc6.bound">
      The manifest’s only row for this subject is the row for what happens when
      the write fails, and that row records the case as unmeasured and
      fail-open. Everything else about the chain is a bound, not a capability:
      it is tamper-evident, not immutable and not signed — an unkeyed digest, so
      anyone able to rewrite the sink can recompute it. The chain head advances
      before the send and a full channel drops the entry while the call still
      returns, which makes a dropped entry indistinguishable from a deleted one.
      An emptied log verifies clean. The proxy writes no local record at all
      unless its audit path is configured.
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
      for an eBPF load or attach failure. The reporting half does not close: a
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
    <Translate id="roles.rc13.bound">
      The manifest’s only budget row is the one for a store that is unreadable
      or corrupt, recorded as unmeasured and silently fail-open, and its gap
      reason records a positive control showing the budget path never queries
      the control-plane store. What is bounded regardless: a cap exists only
      where a policy declares one, an undeclared budget is uncapped, reaching a
      refusal needs a caller that waits for the answer, and a corrupt store
      resets the cap to zero spend silently.
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
      measured as failing the handshake silently. Running the launch with the
      no-proxy flag is an announced bypass. An unmanaged launch is a bypass and
      is not detectable.
    </Translate>
  ),
};
