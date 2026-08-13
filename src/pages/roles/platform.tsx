import React, {type ReactNode} from 'react';
import RolePage from '@site/src/components/roles/RolePage';
import {platformBrief} from '@site/src/components/roles/briefs/platform';

/*
 * AAASM-5587 — /roles/platform — Brief 2, Platform / SRE.
 *
 * The route is a thin wrapper on purpose. The brief is content and lives with
 * the other three, where the four can be read against each other; the layout is
 * shared so no role page can quietly lose a section. What is left here is the
 * one thing that is genuinely per-route: which brief this URL serves.
 */
export default function PlatformRolePage(): ReactNode {
  return <RolePage brief={platformBrief} />;
}
