/**
 * Landing-page install block — HORO-42 scaffold.
 *
 * This block ships a real, working install command (the same shell
 * one-liner served from `static/install.sh`) plus a copy button that
 * fires `copy_install_command` (event taxonomy §2.2, Key Event per
 * §4). HORO-44 will replace this block with the fuller install
 * experience — multi-tab per-command-type UX, per-tab command_type
 * parameter, and richer follow-up CTAs.
 *
 * Constraint (HORO-42 ticket): the install command must be REAL —
 * no fake URL, no `TODO`. The URL below is served today by
 * Cloudflare Pages from `static/install.sh`.
 *
 * Seam for HORO-44:
 *  - Extract `COMMAND` into a config object keyed by `command_type`
 *    (`curl`, `brew`, `docker`) and pass the active key as an event
 *    param when firing `copy_install_command`.
 *  - Replace the single `<pre>` with a tabbed control.
 *  - Add a "Next step" outbound to the quickstart page firing
 *    `quickstart_click`.
 */

import React, {type ReactNode, useState} from 'react';
import {TrackedButton, TrackedLink} from '@site/src/components/Tracked';
import styles from './styles.module.css';

const COMMAND = 'curl -fsSL https://agent-assembly.com/install.sh | sh';

const DOCS_QUICKSTART =
  'https://docs.agent-assembly.com/?utm_source=product_site&utm_medium=docs_link&utm_campaign=oss_install';

async function copyToClipboard(text: string): Promise<boolean> {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.clipboard === 'undefined'
  ) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function InstallBlock(): ReactNode {
  const [copied, setCopied] = useState(false);

  const handleCopy = (): void => {
    void copyToClipboard(COMMAND).then((ok) => {
      if (ok) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  return (
    <section
      id="install"
      className={`${styles.section} ${styles.installSection}`}
    >
      <div className={styles.inner}>
        <div className={styles.eyebrow}>Install the OSS runtime</div>
        <h2 className={styles.h2}>Start self-hosting in one command</h2>
        <p className={styles.lead}>
          Installs the <code>aasm</code> CLI on macOS and Linux. Review the
          script first if you prefer — it&rsquo;s served from{' '}
          <code>agent-assembly.com/install.sh</code>.
        </p>
        <div
          className={`${styles.terminal} ${styles.installTerminal}`}
          aria-label="Install command"
        >
          <div className={styles.terminalBar}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
            <TrackedButton
              className={styles.copyBtn}
              eventName="copy_install_command"
              eventParams={{command_type: 'curl'}}
              onClick={handleCopy}
              ariaLabel="Copy install command"
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </TrackedButton>
          </div>
          <pre className={styles.terminalBody}>
            <code>{COMMAND}</code>
          </pre>
        </div>
        <div className={`${styles.ctaRow} ${styles.installCtaRow}`}>
          <TrackedLink
            className={styles.btnGhost}
            eventName="cta_view_docs_click"
            ctaLocation="install_block"
            targetProduct="docs"
            to={DOCS_QUICKSTART}
            alsoFire={['docs_click']}
            linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
          >
            Continue in the docs →
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
