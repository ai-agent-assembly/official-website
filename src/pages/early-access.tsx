import React, {type ReactNode, useEffect} from 'react';
import Layout from '@theme/Layout';
import {TrackedLink} from '@site/src/components/Tracked';
import {trackEvent} from '@site/src/analytics/trackEvent';
import styles from '@site/src/components/home/styles.module.css';

/**
 * Placeholder route for the Cloud Early Access page.
 *
 * HORO-42 scaffolds this route only so the landing hero's "Request
 * Cloud Early Access" CTA has a valid same-hostname target and the
 * build passes without a broken-link warning. HORO-43 owns the real
 * form (fields, submit event, thank-you route).
 *
 * The page must be transparent about early-access status right now —
 * no "Coming soon" fake-door language (IA plan §4.6). Copy states
 * plainly that Cloud is a design-partner program and points the
 * developer path at the OSS install today.
 */
export default function EarlyAccess(): ReactNode {
  useEffect(() => {
    trackEvent('cloud_early_access_page_view');
  }, []);

  return (
    <Layout
      title="Cloud Early Access — Agent Assembly"
      description="Cloud is in early access as a design-partner program. Agent Assembly Cloud is not generally available. The OSS runtime is available today."
    >
      <main>
        <section className={`${styles.section} ${styles.center}`}>
          <div className={styles.inner}>
            <div className={styles.eyebrow}>Cloud early access</div>
            <h1 className={styles.h2}>
              Cloud is a design-partner program, not generally available.
            </h1>
            <p className={styles.lead}>
              The managed control plane is in early access with a small number
              of design partners. If you want to run governance across many
              teams and consolidate audit and policy in one place, tell us what
              you&rsquo;re trying to govern. In the meantime, the OSS runtime is
              available today.
            </p>
            <p className={styles.lead}>
              <em>
                Form coming in HORO-43. This page exists so the hero CTA has a
                real destination today.
              </em>
            </p>
            <div
              className={styles.ctaRow}
              style={{justifyContent: 'center', marginTop: '1.5rem'}}
            >
              <TrackedLink
                className={styles.btnPrimary}
                eventName="cta_start_self_hosting_click"
                ctaLocation="body"
                targetProduct="agent_assembly"
                to="/#install"
              >
                Start self-hosting instead →
              </TrackedLink>
              <TrackedLink
                className={styles.btnGhost}
                eventName="cta_view_github_click"
                ctaLocation="body"
                targetProduct="github"
                to="https://github.com/ai-agent-assembly/agent-assembly?utm_source=product_site&utm_medium=referral&utm_campaign=early_access"
                alsoFire={['github_core_repo_click']}
                linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
              >
                View on GitHub
              </TrackedLink>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
