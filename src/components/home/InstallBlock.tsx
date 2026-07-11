/**
 * Landing-page install block — HORO-44 extension of the HORO-42 scaffold.
 *
 * Extends the single-command block into a tabbed picker over the
 * `command_type` closed vocabulary (event taxonomy §3.3): `curl`, `brew`,
 * `docker`, `source`. Each tab has its own copy button that fires
 * `copy_install_command` (Key Event per §4) with the matching
 * `command_type` param.
 *
 * The vocabulary is the source of truth (see `installCommands.ts`); the
 * UI is a thin projection so the event param cannot drift from the tab
 * the user actually clicked.
 *
 * Content rule (HORO-40 §2.2 / HORO-44 acceptance): every command shown
 * here must be REAL or explicitly TODO-gated. See `installCommands.ts`
 * for the per-tab gating rationale.
 */

import React, {type ReactNode, useState} from 'react';
import {TrackedButton, TrackedLink} from '@site/src/components/Tracked';
import styles from './styles.module.css';
import {
  INSTALL_COMMANDS,
  DEFAULT_INSTALL_COMMAND,
  type InstallCommandType,
} from './installCommands';
import {DOCS_URL} from '@site/src/generated/site-urls';

const DOCS_QUICKSTART =
  `${DOCS_URL}/?utm_source=product_site&utm_medium=docs_link&utm_campaign=oss_install`;

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
  const [active, setActive] = useState<InstallCommandType>(
    DEFAULT_INSTALL_COMMAND,
  );
  const [copied, setCopied] = useState(false);

  const current =
    INSTALL_COMMANDS.find((c) => c.id === active) ?? INSTALL_COMMANDS[0];

  const handleCopy = (): void => {
    void copyToClipboard(current.command).then((ok) => {
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
        <h2 className={styles.h2}>
          Start self-hosting the way you already work
        </h2>
        <p className={styles.lead}>
          Pick your install path. Each command is a real command — no
          placeholder URLs, and pre-launch tabs are labeled honestly.
        </p>

        <div
          className={styles.installTabs}
          role="tablist"
          aria-label="Install command variants"
        >
          {INSTALL_COMMANDS.map((cmd) => (
            <button
              key={cmd.id}
              role="tab"
              type="button"
              aria-selected={cmd.id === active}
              aria-controls={`install-panel-${cmd.id}`}
              id={`install-tab-${cmd.id}`}
              className={
                cmd.id === active
                  ? `${styles.installTab} ${styles.installTabActive}`
                  : styles.installTab
              }
              onClick={() => {
                setActive(cmd.id);
                setCopied(false);
              }}
            >
              {cmd.label}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`install-panel-${current.id}`}
          aria-labelledby={`install-tab-${current.id}`}
        >
          <p className={styles.installHint}>{current.hint}</p>
          <div
            className={`${styles.terminal} ${styles.installTerminal}`}
            aria-label={`${current.label} install command`}
          >
            <div className={styles.terminalBar}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
              <TrackedButton
                className={styles.copyBtn}
                eventName="copy_install_command"
                eventParams={{command_type: current.id}}
                onClick={handleCopy}
                ariaLabel={`Copy ${current.label} install command`}
              >
                {copied ? 'Copied ✓' : 'Copy'}
              </TrackedButton>
            </div>
            <pre className={styles.terminalBody}>
              <code>{current.command}</code>
            </pre>
          </div>
          {current.detailsUrl && current.detailsLabel ? (
            <div className={`${styles.ctaRow} ${styles.installCtaRow}`}>
              <TrackedLink
                className={styles.btnGhost}
                eventName="cta_view_docs_click"
                ctaLocation="install_block"
                targetProduct="github"
                to={current.detailsUrl}
                linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
              >
                {current.detailsLabel}
              </TrackedLink>
            </div>
          ) : null}
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
