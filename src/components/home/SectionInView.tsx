/**
 * SectionInView — fire a named `dataLayer` event when a section
 * reaches ≥50 % viewport visibility for ≥1 second.
 *
 * Wraps the security-model and architecture sections on the landing
 * page so we can distinguish scroll-through visitors from real
 * engagement, per event taxonomy §2.1 (`architecture_view`,
 * `security_model_view`) and §5.2's product-site binding.
 *
 * IntersectionObserver is preferred over GTM's scroll-depth trigger
 * because it is scoped to the actual DOM element rather than the
 * whole page (event taxonomy §5.2 rule).
 *
 * The event fires **once per page visit**. Rapid intersection toggles
 * (scroll bouncing above and below the threshold) do not re-fire the
 * event; that guards against inflated counts from users scanning.
 */

import React, {
  type ElementType,
  type ReactNode,
  useEffect,
  useRef,
} from 'react';
import {trackEvent} from '@site/src/analytics/trackEvent';

interface SectionInViewProps {
  readonly eventName: string;
  readonly children: ReactNode;
  /**
   * Which HTML element to render. Defaults to `<section>`; the
   * landing page uses `<section>` for both instrumented blocks.
   */
  readonly as?: ElementType;
  readonly className?: string;
  readonly id?: string;
  /** Fraction of the element that must be visible (0..1). */
  readonly threshold?: number;
  /** Milliseconds the threshold must be sustained before firing. */
  readonly dwellMs?: number;
}

export function SectionInView({
  eventName,
  children,
  as: Tag = 'section',
  className,
  id,
  threshold = 0.5,
  dwellMs = 1000,
}: SectionInViewProps): ReactNode {
  const ref = useRef<HTMLElement | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      return;
    }

    let timer: number | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (firedRef.current) {
            return;
          }
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            if (timer === null) {
              timer = window.setTimeout(() => {
                if (!firedRef.current) {
                  firedRef.current = true;
                  trackEvent(eventName, {section_id: id ?? ''});
                }
              }, dwellMs);
            }
          } else if (timer !== null) {
            window.clearTimeout(timer);
            timer = null;
          }
        }
      },
      {threshold},
    );

    observer.observe(el);
    return () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      observer.disconnect();
    };
  }, [eventName, id, threshold, dwellMs]);

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
