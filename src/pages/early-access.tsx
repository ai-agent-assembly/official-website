import React, {type ReactNode, useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import {trackEvent} from '@site/src/analytics/trackEvent';
import {EarlyAccessForm} from '@site/src/components/EarlyAccess/EarlyAccessForm';
import {ThankYou} from '@site/src/components/EarlyAccess/ThankYou';
import styles from '@site/src/components/home/styles.module.css';

/**
 * Cloud Early Access page (HORO-43).
 *
 * The page copy states plainly that Cloud is a design-partner program and
 * NOT generally available (IA plan §4.6 — no fake doors). The form (see
 * `EarlyAccessForm`) collects the closed-vocabulary validation fields
 * required for `cloud_early_access_submit` (event taxonomy §3.5) plus the
 * identity fields the founders need to reply. Only §3.5 params are emitted
 * to GA4; email / name / free-text stay in the form-backend channel.
 *
 * After submit, the form calls back and this component swaps in the
 * `ThankYou` view, which offers two next-step CTAs (OSS docs, GitHub)
 * that route the visitor to something REAL today.
 */
export default function EarlyAccess(): ReactNode {
  const [submitted, setSubmitted] = useState(false);

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

            {submitted ? (
              <ThankYou />
            ) : (
              <EarlyAccessForm onSubmitted={() => setSubmitted(true)} />
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}
