import {DOCS_URL} from '@site/src/generated/site-urls';

/*
 * AAASM-5587 — the destinations the four briefs route to.
 *
 * Every one of these is a page a brief's Proof or Next field names. They are
 * collected here so that four role pages cannot end up pointing at four
 * different copies of the same evidence, and so that a moved page is one edit.
 *
 * Nothing here is a claim. A role page routes to evidence and does not restate
 * it — reference material, the policy schema, the threat model and the manifest
 * are all owned a level down, and reproducing any of them on this site would
 * create a second copy at a lower depth than the source.
 */

// Cross-hostname destinations carry UTM per HORO-47 §5.2. Same-hostname ones
// MUST NOT — that would overwrite the visitor's session source in GA4.
const UTM_DOCS =
  'utm_source=product_site&utm_medium=docs_link&utm_campaign=agent_assembly_launch';

/** A Docs Hub page, with the UTM every cross-hostname link carries. */
export function hub(page: string): string {
  return `${DOCS_URL}/${page}?${UTM_DOCS}`;
}

export const SECURITY_MODEL = hub('security-model.html');
export const RISK_SCENARIOS = hub('risk-scenarios.html');
export const PRODUCT_PROMISE = hub('product-promise.html');
export const COMPATIBILITY = hub('compatibility.html');
export const DOCKER_CONTAINERS = hub('docker-containers.html');
export const SELF_HOST_OBSERVABILITY = hub('self-host-observability.html');
export const SOURCE_OF_TRUTH = hub('source-of-truth.html');
export const TROUBLESHOOTING = hub('troubleshooting.html');
export const POLICY_REFERENCE = hub('policy-reference.html');
export const DOCUMENTATION = hub('documentation.html');
export const ROLE_NARRATIVES = hub('role-narratives.html');

// AAASM-5528 — the coverage / known-limitations page the path claims resolve to.
export const DEVTOOL_LIMITATIONS = `${DOCS_URL}/core/latest/devtools/limitations.html?${UTM_DOCS}`;

/*
 * Source-of-record links, in the repository rather than on the hub.
 *
 * The manifest is the 80-row evidence base every register entry resolves
 * against, so a reader who wants to check a sentence rather than read about it
 * needs the file itself. `blob/HEAD` rather than a pinned ref: the reader wants
 * the current row, and a pinned link goes stale silently.
 */
const REPO = 'https://github.com/ai-agent-assembly/agent-assembly/blob/HEAD';

export const CAPABILITY_MANIFEST = `${REPO}/governance/capability-manifest.yaml`;
export const CLAIM_VOCABULARY = `${REPO}/docs/src/development/claim-vocabulary.md`;
export const REPO_LIMITATIONS = `${REPO}/docs/src/devtools/limitations.md`;
export const ADR_0033 = `${REPO}/docs/src/adr/0033-canonical-governance-and-enforcement-architecture.md`;
