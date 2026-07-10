/**
 * Post-submit thank-you view for the Cloud Early Access flow.
 *
 * Renders inline after `cloud_early_access_submit` fires. Offers the
 * two next-step CTAs required by IA plan §4.6 ("routes to next steps
 * that are real today, not a Coming soon wall"):
 *
 *   1. "See OSS docs" → cross-hostname to docs.agent-assembly.com/quickstart
 *   2. "View on GitHub" → cross-hostname to the core repo
 *
 * Both links carry UTM per UTM conventions §10.5 (thank-you outreach):
 *   utm_source=email
 *   utm_medium=direct_outreach
 *   utm_campaign=early_access
 *
 * Same-hostname navigation to `/early-access/thank-you` would be a
 * plausible alternative, but an inline swap keeps state simpler and
 * avoids losing the submitted context to a Docusaurus route change.
 *
 * Events fired by clicks in this view (event taxonomy §2.3):
 *   - cloud_early_access_oss_docs_click  (OSS docs link)
 *   - cloud_early_access_github_click    (GitHub link)
 */

import React, {type ReactNode} from 'react';
import {TrackedLink} from '@site/src/components/Tracked';
import styles from './styles.module.css';
import homeStyles from '@site/src/components/home/styles.module.css';

const OSS_DOCS_URL =
  'https://docs.agent-assembly.com/quickstart' +
  '?utm_source=email&utm_medium=direct_outreach&utm_campaign=early_access';

const GITHUB_URL =
  'https://github.com/ai-agent-assembly/agent-assembly' +
  '?utm_source=email&utm_medium=direct_outreach&utm_campaign=early_access';

export function ThankYou(): ReactNode {
  return (
    <div className={styles.thankYou}>
      <h2 className={styles.thankYouTitle}>
        Thanks — we&rsquo;ll be in touch.
      </h2>
      <p className={styles.thankYouLead}>
        A founder will read your request personally and reply from a real inbox.
        Because Cloud is a design-partner program (not generally available), we
        onboard partners one at a time based on fit.
      </p>
      <p className={styles.thankYouLead}>
        While you&rsquo;re here, the OSS runtime is available today — you can
        run the governance boundary without waiting on us.
      </p>
      <div className={styles.nextSteps}>
        <TrackedLink
          className={homeStyles.btnPrimary}
          eventName="cloud_early_access_oss_docs_click"
          ctaLocation="thank_you"
          targetProduct="docs"
          to={OSS_DOCS_URL}
          linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
        >
          See OSS docs →
        </TrackedLink>
        <TrackedLink
          className={homeStyles.btnGhost}
          eventName="cloud_early_access_github_click"
          ctaLocation="thank_you"
          targetProduct="github"
          to={GITHUB_URL}
          linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
        >
          View on GitHub
        </TrackedLink>
      </div>
    </div>
  );
}
