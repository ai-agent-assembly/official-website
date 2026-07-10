/**
 * Closed-vocabulary types for the Cloud Early Access form.
 *
 * These enums come verbatim from the event taxonomy §3.5 (the only
 * parameters permitted on the `cloud_early_access_submit` event).
 * Values outside these unions must not reach GA4 — the type system
 * enforces this at every call site.
 *
 * Identity fields (email, name, free-text, github_url) are collected
 * by the form for the form-backend channel ONLY and are declared in
 * `EarlyAccessFormValues` below. They MUST NOT be forwarded to any
 * `trackEvent` / `dataLayer.push` call. See event taxonomy §3.5 and
 * §9.6.
 */

/** Self-selected role — event taxonomy §3.5 closed vocabulary. */
export type Role =
  'developer' | 'platform_engineer' | 'security_engineer' | 'founder' | 'other';

/** Self-selected team/company size — event taxonomy §3.5. */
export type TeamSize = 'solo' | 'startup' | 'team' | 'enterprise' | 'other';

/** Preferred deployment posture — event taxonomy §3.5. */
export type Deployment = 'oss' | 'self_hosted' | 'saas' | 'not_sure';

/**
 * Ordered option list for each enum, used to render `<select>` /
 * radio choices. Each tuple is `[value, human_label]` — labels are
 * NOT emitted to GA4 and are free to be human-readable.
 */
export const ROLE_OPTIONS: ReadonlyArray<readonly [Role, string]> = [
  ['developer', 'Developer / engineer'],
  ['platform_engineer', 'Platform engineer'],
  ['security_engineer', 'Security engineer'],
  ['founder', 'Founder / technical leader'],
  ['other', 'Other'],
];

export const TEAM_SIZE_OPTIONS: ReadonlyArray<readonly [TeamSize, string]> = [
  ['solo', 'Just me'],
  ['startup', 'Startup (2–20)'],
  ['team', 'Team inside a larger org (20–500)'],
  ['enterprise', 'Enterprise (500+)'],
  ['other', 'Other'],
];

export const DEPLOYMENT_OPTIONS: ReadonlyArray<readonly [Deployment, string]> =
  [
    ['oss', 'OSS / self-run today'],
    ['self_hosted', 'Managed self-hosting (VPC or private cloud)'],
    ['saas', 'Managed SaaS (once GA)'],
    ['not_sure', 'Not sure yet'],
  ];

/**
 * All values captured by the form.
 *
 * The three §3.5 fields (`role`, `teamSize`, `deployment`) are the
 * ONLY values that may leave via GA4.
 *
 * The identity fields (`email`, `name`, `whatToGovern`, `githubUrl`)
 * are for the form-backend channel — currently a `mailto:` scaffold
 * (see `EarlyAccessForm.tsx`).
 */
export interface EarlyAccessFormValues {
  // §3.5 GA4-safe closed-vocabulary fields.
  readonly role: Role | '';
  readonly teamSize: TeamSize | '';
  readonly deployment: Deployment | '';

  // Identity — form-backend ONLY. Never emit to GA4.
  readonly email: string;
  readonly name: string;
  readonly whatToGovern: string;
  readonly githubUrl: string;
}
