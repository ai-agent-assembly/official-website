import type {RoleBrief} from '../types';
import {securityBrief} from './security';
import {platformBrief} from './platform';
import {engineeringBrief} from './engineering';
import {productQaBrief} from './productQa';

/*
 * AAASM-5587 — the four evaluator routes, in one place and in one order.
 *
 * The switcher on every role page and the chooser at `/roles` both render from
 * this list, so the surfaces cannot disagree about what the set of roles is. A
 * page that kept its own list of neighbours would be free to omit one, and the
 * reader on that page would never learn the omitted role exists.
 *
 * The order is `role-narratives.md`'s brief order — Security, Platform,
 * Engineering, Product/QA. It is not a ranking; it is the order the briefs are
 * published in on the hub, kept so a reader moving between the two meets the
 * four in the same sequence on both.
 */

/** The shared prefix all four role surfaces sit under. */
export const ROLES_PREFIX = '/roles';

export function rolePath(slug: string): string {
  return `${ROLES_PREFIX}/${slug}`;
}

export const ROLE_BRIEFS: readonly RoleBrief[] = [
  securityBrief,
  platformBrief,
  engineeringBrief,
  productQaBrief,
];
