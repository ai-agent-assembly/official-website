/**
 * Shared analytics helper for the Agent Assembly product site.
 *
 * Emits GA4-bound `dataLayer` events per the event taxonomy (HORO-45).
 * Auto-fills the required parameters from Section 3.1 (`hostname`,
 * `page_path`, `page_title`, `surface`) so callers only pass the
 * event-specific parameters (Section 3.2 CTA fields, Section 3.3
 * install-block fields, etc.).
 *
 * Site-wide invariant: every event fired from this bundle carries
 * `surface = 'product_site'`. Docs / Horonomy have their own surfaces.
 *
 * Consent posture: this helper only pushes to `window.dataLayer`. The
 * GTM container is the consent gate — with Consent Mode v2 configured
 * (analytics_storage default-denied), GA4 receives no hits until the
 * visitor grants consent. Same-hostname internal navigation is not
 * tagged with UTM at the URL level (HORO-47 §5.2); UTM lives on
 * cross-hostname links only and is captured by GA4 as session source.
 *
 * This module is imported by HORO-42's landing components AND is a
 * shared surface for HORO-43 (early-access) and HORO-44 (install
 * block). Keep the exported API small and stable.
 */

/**
 * Allowed values for `cta_location` from the event taxonomy §3.2.
 * A closed vocabulary — new values require a spec update, not a code
 * fix. Passing anything else is a review-time error.
 */
export type CtaLocation =
  | 'hero'
  | 'nav'
  | 'body'
  | 'install_block'
  | 'footer'
  | 'thank_you'
  | 'side_rail';

/**
 * Coarse target-product parameter from the event taxonomy §3.2.
 */
export type TargetProduct =
  'agent_assembly' | 'horonomy' | 'docs' | 'github' | 'early_access';

/**
 * The shape every code-emitted dataLayer event carries. Auto-populated
 * from `window.location` and `document.title` at fire time — callers
 * only supply the event-specific overrides.
 */
export interface TrackEventParams {
  readonly [key: string]: string | undefined;
}

/**
 * Standard parameters attached to every event (event taxonomy §3.1).
 * `surface` is fixed to `product_site` for this bundle.
 */
interface StandardParams {
  readonly hostname: string;
  readonly page_path: string;
  readonly page_title: string;
  readonly surface: 'product_site';
}

interface DataLayerPayload extends StandardParams {
  readonly event: string;
  readonly [key: string]: string | undefined;
}

declare global {
  interface Window {
    dataLayer?: DataLayerPayload[];
  }
}

/**
 * Read the standard params from the current document at call time.
 * Values are safe defaults during SSR (Docusaurus static build) — the
 * event will only actually fire in the browser where `window` exists.
 */
function readStandardParams(): StandardParams {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      hostname: '',
      page_path: '',
      page_title: '',
      surface: 'product_site',
    };
  }
  return {
    hostname: window.location.hostname,
    // Strip query + fragment — parameter dictionary §3.1 rule.
    page_path: window.location.pathname,
    page_title: document.title,
    surface: 'product_site',
  };
}

/**
 * Fire a named event to the GTM dataLayer.
 *
 * Behavior:
 * - No-op on the server / during SSR (guarded by `typeof window`).
 * - Auto-fills `hostname`, `page_path`, `page_title`, `surface` from
 *   the current document. Callers can override any of these but must
 *   not carry PII (see event taxonomy §9).
 * - The GTM container decides whether the event actually reaches GA4
 *   based on the visitor's consent state.
 *
 * @param name  snake_case GA4 event name (taxonomy §2)
 * @param params event-specific parameters (taxonomy §3.2–§3.5)
 */
export function trackEvent(name: string, params: TrackEventParams = {}): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dataLayer = window.dataLayer ?? [];
  const payload: DataLayerPayload = {
    event: name,
    ...readStandardParams(),
    ...params,
  };
  window.dataLayer.push(payload);
}

/**
 * Convenience for CTA click events — enforces the §3.2 CTA-bound
 * parameter shape at the type level so callers cannot forget
 * `cta_location`, `link_url`, `link_domain`, or `target_product`.
 */
export interface CtaClickParams {
  readonly cta_location: CtaLocation;
  readonly link_url: string;
  readonly target_product: TargetProduct;
  /** Optional extra params (e.g. `command_type` for install events). */
  readonly extra?: TrackEventParams;
}

export function trackCtaClick(name: string, params: CtaClickParams): void {
  let link_domain = '';
  try {
    link_domain = new URL(params.link_url).hostname;
  } catch {
    // Relative URL (same-hostname link). Fall back to the current
    // hostname so reports still segment correctly.
    if (typeof window !== 'undefined') {
      link_domain = window.location.hostname;
    }
  }
  trackEvent(name, {
    cta_location: params.cta_location,
    link_url: params.link_url,
    link_domain,
    target_product: params.target_product,
    ...(params.extra ?? {}),
  });
}
