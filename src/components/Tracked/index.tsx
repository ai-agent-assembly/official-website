/**
 * Shared tracked-link / tracked-button React components for the
 * Agent Assembly product site.
 *
 * These wrap Docusaurus `<Link>` and emit a `dataLayer` event on click
 * via `src/analytics/trackEvent.ts`. They are the reusable building
 * block for:
 *
 *   - HORO-42 (this landing-page work)
 *   - HORO-43 (early-access page CTAs)
 *   - HORO-44 (install-block copy button + docs / GitHub follow-ups)
 *
 * Keep the API small and stable. Adding a prop means updating three
 * tickets' consumers, so extend deliberately.
 *
 * Design notes:
 *
 * - `<TrackedLink>` fires the named event with the CTA-bound parameter
 *   shape from event taxonomy §3.2 (`cta_location`, `link_url`,
 *   `link_domain`, `target_product`). The click still proceeds
 *   normally — the event push is synchronous but non-blocking.
 * - `<TrackedButton>` is a plain `<button>` for actions that are not a
 *   navigation (e.g. copy-to-clipboard). It calls a user-supplied
 *   `onClick` after firing the event so callers can compose behavior.
 * - Neither component sets `rel` / `target` — Docusaurus `<Link>`
 *   handles that for outbound links, and callers who need overrides
 *   can pass them through via `linkProps`.
 * - UTM: per HORO-47 §5.2, same-hostname CTAs on the landing page do
 *   NOT carry UTM. Cross-hostname consumers of this component are
 *   responsible for baking UTM into the `to` / `href` they pass in.
 */

import React, {type ReactNode, type ComponentProps} from 'react';
import Link from '@docusaurus/Link';
import {
  trackCtaClick,
  trackEvent,
  type CtaLocation,
  type TargetProduct,
  type TrackEventParams,
} from '@site/src/analytics/trackEvent';

type DocusaurusLinkProps = ComponentProps<typeof Link>;

interface TrackedLinkProps {
  /** GA4 event name (e.g. `cta_start_self_hosting_click`). */
  readonly eventName: string;
  /** On-page location (event taxonomy §3.2). */
  readonly ctaLocation: CtaLocation;
  /** Coarse target (event taxonomy §3.2). */
  readonly targetProduct: TargetProduct;
  /** Absolute or relative URL. Passed straight through to `<Link>`. */
  readonly to: string;
  /** Extra event params (e.g. `command_type=curl`). */
  readonly eventExtra?: TrackEventParams;
  /**
   * Additional GA4 events to fire on the same click. Use for cases
   * where one CTA satisfies more than one measurement contract — e.g.
   * the hero "View on GitHub" button satisfies both
   * `cta_view_github_click` (CTA taxonomy) and `github_core_repo_click`
   * (Key Event). Extra events share the CTA-bound parameters.
   */
  readonly alsoFire?: readonly string[];
  readonly className?: string;
  readonly children: ReactNode;
  /**
   * Optional pass-through props for the underlying `<Link>` — e.g.
   * `aria-label`, `rel`, `target`. Intentionally narrow so the
   * component stays predictable.
   */
  readonly linkProps?: Omit<
    DocusaurusLinkProps,
    'to' | 'href' | 'className' | 'onClick' | 'children'
  >;
}

/**
 * A Docusaurus `<Link>` that emits an event when clicked.
 *
 * Both `to` (internal) and external URLs work — `<Link>` auto-detects.
 */
export function TrackedLink({
  eventName,
  ctaLocation,
  targetProduct,
  to,
  eventExtra,
  alsoFire,
  className,
  children,
  linkProps,
}: TrackedLinkProps): ReactNode {
  const handleClick = (): void => {
    trackCtaClick(eventName, {
      cta_location: ctaLocation,
      link_url: to,
      target_product: targetProduct,
      extra: eventExtra,
    });
    if (alsoFire) {
      for (const name of alsoFire) {
        trackCtaClick(name, {
          cta_location: ctaLocation,
          link_url: to,
          target_product: targetProduct,
          extra: eventExtra,
        });
      }
    }
  };

  return (
    <Link {...linkProps} to={to} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

interface TrackedButtonProps {
  readonly eventName: string;
  /** Extra event params (e.g. `command_type=curl` for `copy_install_command`). */
  readonly eventParams?: TrackEventParams;
  readonly onClick?: () => void;
  readonly className?: string;
  readonly type?: 'button' | 'submit';
  readonly ariaLabel?: string;
  readonly children: ReactNode;
}

/**
 * A `<button>` that fires a named event on click and then invokes the
 * caller's `onClick`. Used for non-navigation actions such as
 * copy-to-clipboard (see HORO-44's install block).
 */
export function TrackedButton({
  eventName,
  eventParams,
  onClick,
  className,
  type = 'button',
  ariaLabel,
  children,
}: TrackedButtonProps): ReactNode {
  const handleClick = (): void => {
    trackEvent(eventName, eventParams);
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      className={className}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
