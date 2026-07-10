/**
 * Landing-page next-step section — HORO-44.
 *
 * Sits below the install block and gives the developer three named
 * outbound paths: docs, examples repo, and core repo. A small SDK-chip
 * row lets a visitor jump straight to per-language docs — each chip
 * fires `sdk_page_view` with the `sdk` param (event taxonomy §3.4) and
 * its dedicated `sdk_<lang>_click` alias (event taxonomy §2.2, HORO-44
 * ticket description).
 *
 * All outbound links are cross-hostname, so every href carries UTM per
 * HORO-47 §2 (source/medium/campaign/content) with `utm_campaign=oss_install`.
 * Same-hostname install-block scroll anchors carry NO UTM.
 */

import React, {type ReactNode} from 'react';
import {TrackedLink} from '@site/src/components/Tracked';
import styles from './styles.module.css';

interface NextStepCardConfig {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly eventName: string;
  readonly alsoFire?: readonly string[];
  readonly targetProduct: 'docs' | 'github';
}

const CARDS: readonly NextStepCardConfig[] = [
  {
    eyebrow: 'Docs',
    title: 'Installation guide →',
    description:
      'Full install matrix, requirements, and running your first governed agent.',
    href:
      'https://docs.agent-assembly.com/installation?' +
      'utm_source=product_site&utm_medium=referral' +
      '&utm_campaign=oss_install&utm_content=install_docs',
    eventName: 'install_docs_click',
    alsoFire: ['docs_click'],
    targetProduct: 'docs',
  },
  {
    eyebrow: 'Quickstart',
    title: 'Run your first governed agent →',
    description: 'Wire an agent through the gateway in under five minutes.',
    href:
      'https://docs.agent-assembly.com/quickstart?' +
      'utm_source=product_site&utm_medium=referral' +
      '&utm_campaign=oss_install&utm_content=quickstart',
    eventName: 'quickstart_click',
    alsoFire: ['docs_click'],
    targetProduct: 'docs',
  },
  {
    eyebrow: 'Examples',
    title: 'Framework integration examples →',
    description: 'LangChain, LlamaIndex, and CrewAI wired through the runtime.',
    href:
      'https://github.com/ai-agent-assembly/agent-assembly-examples?' +
      'utm_source=product_site&utm_medium=referral' +
      '&utm_campaign=oss_install&utm_content=examples_repo',
    eventName: 'examples_repo_click',
    targetProduct: 'github',
  },
  {
    eyebrow: 'Source',
    title: 'Core repo →',
    description:
      'Read the runtime source, open issues, and follow release notes.',
    href:
      'https://github.com/ai-agent-assembly/agent-assembly?' +
      'utm_source=product_site&utm_medium=referral' +
      '&utm_campaign=oss_install&utm_content=core_repo',
    eventName: 'github_core_repo_click',
    targetProduct: 'github',
  },
];

interface SdkChipConfig {
  readonly sdk: 'python' | 'node' | 'go';
  readonly label: string;
  readonly href: string;
  readonly clickEvent: string;
}

const SDK_CHIPS: readonly SdkChipConfig[] = [
  {
    sdk: 'python',
    label: 'Python SDK',
    href:
      'https://docs.agent-assembly.com/python-sdk?' +
      'utm_source=product_site&utm_medium=referral' +
      '&utm_campaign=oss_install&utm_content=sdk_python',
    clickEvent: 'sdk_python_click',
  },
  {
    sdk: 'node',
    label: 'Node SDK',
    href:
      'https://docs.agent-assembly.com/node-sdk?' +
      'utm_source=product_site&utm_medium=referral' +
      '&utm_campaign=oss_install&utm_content=sdk_node',
    clickEvent: 'sdk_node_click',
  },
  {
    sdk: 'go',
    label: 'Go SDK',
    href:
      'https://docs.agent-assembly.com/go-sdk?' +
      'utm_source=product_site&utm_medium=referral' +
      '&utm_campaign=oss_install&utm_content=sdk_go',
    clickEvent: 'sdk_go_click',
  },
];

export function NextSteps(): ReactNode {
  return (
    <section
      id="next-steps"
      className={`${styles.section} ${styles.installSection}`}
    >
      <div className={styles.inner}>
        <div className={styles.eyebrow}>Next steps</div>
        <h2 className={styles.h2}>Once the CLI is on your path</h2>
        <p className={styles.lead}>
          Four common next moves after install — pick whichever matches how you
          learn. Each link fires a named event so we can tell which surface
          converts, without tracking identity.
        </p>

        <div className={styles.nextSteps}>
          {CARDS.map((card) => (
            <TrackedLink
              key={card.eventName}
              className={styles.nextStepCard}
              eventName={card.eventName}
              ctaLocation="install_block"
              targetProduct={card.targetProduct}
              alsoFire={card.alsoFire}
              to={card.href}
              linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
            >
              <div className={styles.nextStepEyebrow}>{card.eyebrow}</div>
              <div className={styles.nextStepTitle}>{card.title}</div>
              <div className={styles.nextStepDesc}>{card.description}</div>
            </TrackedLink>
          ))}
        </div>

        <div className={styles.sdkChips}>
          <span className={styles.sdkChipsLabel}>
            Or jump straight to an SDK:
          </span>
          {SDK_CHIPS.map((chip) => (
            <TrackedLink
              key={chip.sdk}
              className={styles.sdkChip}
              eventName="sdk_page_view"
              eventExtra={{sdk: chip.sdk}}
              ctaLocation="install_block"
              targetProduct="docs"
              alsoFire={[chip.clickEvent]}
              to={chip.href}
              linkProps={{rel: 'noopener noreferrer', target: '_blank'}}
            >
              {chip.label}
            </TrackedLink>
          ))}
        </div>
      </div>
    </section>
  );
}
