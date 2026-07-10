/**
 * Cloud Early Access form component.
 *
 * Two-channel separation (event taxonomy §3.5 and §9):
 *
 *   1. GA4 channel — code-emitted `cloud_early_access_submit` event
 *      via `trackEvent`. Carries ONLY the closed-vocabulary
 *      `role` / `team_size` / `deployment` params (plus the §3.1
 *      auto-fills). No email, no name, no free text.
 *
 *   2. Form-backend channel — a `mailto:` handoff scaffold delivers
 *      identity fields to the founders. This is the honest bootstrap
 *      until a real backend is picked (see TODO below). The identity
 *      values never touch `dataLayer`.
 *
 * The form fires the GA4 event BEFORE opening the mail client so a
 * measurement lands even if the visitor bails at the confirmation
 * step in their mail app. Per event taxonomy §5.2, form-submit events
 * are code-emitted (GTM cannot detect submission success from the DOM).
 *
 * Copy discipline (IA plan §4.6): the form never implies Cloud is GA
 * or that "signing up" grants access. It is a design-partner request.
 */

import React, {type ReactNode, useId, useState} from 'react';
import {trackEvent} from '@site/src/analytics/trackEvent';
import styles from './styles.module.css';
import {
  DEPLOYMENT_OPTIONS,
  ROLE_OPTIONS,
  TEAM_SIZE_OPTIONS,
  type Deployment,
  type EarlyAccessFormValues,
  type Role,
  type TeamSize,
} from './types';

// TODO(HORO-43): replace mailto with real form-backend once selected.
// The mailto: handoff is a genuine delivery channel (email arrives at
// hello@agent-assembly.com); it is not a fake door. When we pick a
// real backend (Formspree / Netlify Forms / equivalent), swap the
// submit handler — the closed-vocabulary GA4 event stays as-is.
const FORM_BACKEND_EMAIL = 'hello@agent-assembly.com';

const EMPTY_FORM: EarlyAccessFormValues = {
  role: '',
  teamSize: '',
  deployment: '',
  email: '',
  name: '',
  whatToGovern: '',
  githubUrl: '',
};

interface EarlyAccessFormProps {
  /** Called after a successful submit — swaps the page to the thank-you view. */
  readonly onSubmitted: () => void;
}

export function EarlyAccessForm({onSubmitted}: EarlyAccessFormProps): ReactNode {
  const [values, setValues] = useState<EarlyAccessFormValues>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const roleId = useId();
  const teamSizeId = useId();
  const deploymentId = useId();
  const emailId = useId();
  const nameId = useId();
  const whatId = useId();
  const githubId = useId();

  const isValid =
    values.role !== '' &&
    values.teamSize !== '' &&
    values.deployment !== '' &&
    values.email.trim() !== '' &&
    values.name.trim() !== '' &&
    values.whatToGovern.trim() !== '';

  function update<K extends keyof EarlyAccessFormValues>(
    key: K,
    value: EarlyAccessFormValues[K],
  ): void {
    setValues((prev) => ({...prev, [key]: value}));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!isValid || submitting) {
      return;
    }
    setSubmitting(true);

    // GA4 channel — CLOSED VOCABULARY ONLY. Do not add email/name/text.
    trackEvent('cloud_early_access_submit', {
      role: values.role as Role,
      team_size: values.teamSize as TeamSize,
      deployment: values.deployment as Deployment,
    });

    // Form-backend channel — identity payload goes via mailto scaffold.
    // See TODO(HORO-43) above.
    const mailBody = [
      `Role: ${values.role}`,
      `Team size: ${values.teamSize}`,
      `Preferred deployment: ${values.deployment}`,
      '',
      `Name / project: ${values.name}`,
      `Email: ${values.email}`,
      values.githubUrl.trim() !== ''
        ? `GitHub / company URL: ${values.githubUrl}`
        : '',
      '',
      'What are you trying to govern?',
      values.whatToGovern,
    ]
      .filter((line) => line !== null)
      .join('\n');

    const mailto =
      `mailto:${FORM_BACKEND_EMAIL}` +
      `?subject=${encodeURIComponent('Cloud Early Access request')}` +
      `&body=${encodeURIComponent(mailBody)}`;

    // Open the visitor's mail client. Guard for SSR safety.
    if (typeof window !== 'undefined') {
      window.location.href = mailto;
    }

    // Move to the thank-you view regardless of whether the mail
    // client opens — the GA4 event has fired and we do not want to
    // leave the visitor stranded on the form.
    onSubmitted();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.fieldRow}>
        <label htmlFor={roleId} className={styles.label}>
          Your role
          <span aria-hidden="true" className={styles.required}>
            {' '}
            *
          </span>
        </label>
        <select
          id={roleId}
          className={styles.control}
          required
          value={values.role}
          onChange={(e) => update('role', e.target.value as Role)}
        >
          <option value="" disabled>
            Select one
          </option>
          {ROLE_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fieldRow}>
        <label htmlFor={teamSizeId} className={styles.label}>
          Team size
          <span aria-hidden="true" className={styles.required}>
            {' '}
            *
          </span>
        </label>
        <select
          id={teamSizeId}
          className={styles.control}
          required
          value={values.teamSize}
          onChange={(e) => update('teamSize', e.target.value as TeamSize)}
        >
          <option value="" disabled>
            Select one
          </option>
          {TEAM_SIZE_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fieldRow}>
        <label htmlFor={deploymentId} className={styles.label}>
          Preferred deployment
          <span aria-hidden="true" className={styles.required}>
            {' '}
            *
          </span>
        </label>
        <select
          id={deploymentId}
          className={styles.control}
          required
          value={values.deployment}
          onChange={(e) => update('deployment', e.target.value as Deployment)}
        >
          <option value="" disabled>
            Select one
          </option>
          {DEPLOYMENT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className={styles.hint}>
          Cloud (SaaS) is a design-partner program today, not generally
          available. The OSS runtime is available now.
        </p>
      </div>

      <div className={styles.fieldRow}>
        <label htmlFor={nameId} className={styles.label}>
          Name or project
          <span aria-hidden="true" className={styles.required}>
            {' '}
            *
          </span>
        </label>
        <input
          id={nameId}
          className={styles.control}
          type="text"
          required
          autoComplete="name"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
        />
      </div>

      <div className={styles.fieldRow}>
        <label htmlFor={emailId} className={styles.label}>
          Email
          <span aria-hidden="true" className={styles.required}>
            {' '}
            *
          </span>
        </label>
        <input
          id={emailId}
          className={styles.control}
          type="email"
          required
          autoComplete="email"
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
        />
      </div>

      <div className={styles.fieldRow}>
        <label htmlFor={whatId} className={styles.label}>
          What are you trying to govern?
          <span aria-hidden="true" className={styles.required}>
            {' '}
            *
          </span>
        </label>
        <textarea
          id={whatId}
          className={styles.control}
          required
          rows={4}
          placeholder="A few sentences on the agents, tools, or workflows you want under governance."
          value={values.whatToGovern}
          onChange={(e) => update('whatToGovern', e.target.value)}
        />
      </div>

      <div className={styles.fieldRow}>
        <label htmlFor={githubId} className={styles.label}>
          GitHub or company URL (optional)
        </label>
        <input
          id={githubId}
          className={styles.control}
          type="url"
          autoComplete="url"
          placeholder="https://github.com/…"
          value={values.githubUrl}
          onChange={(e) => update('githubUrl', e.target.value)}
        />
      </div>

      <div className={styles.submitRow}>
        <button
          type="submit"
          className={styles.submit}
          disabled={!isValid || submitting}
        >
          Request early access
        </button>
        <p className={styles.hint}>
          We&rsquo;ll reply from a person, not a marketing queue. No SaaS
          signup — this is a design-partner conversation.
        </p>
      </div>
    </form>
  );
}
