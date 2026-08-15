import React, {type ReactNode} from 'react';
import BlogTagsListPage from '@theme-original/BlogTagsListPage';
import type BlogTagsListPageType from '@theme/BlogTagsListPage';
import type {WrapperProps} from '@docusaurus/types';
import Head from '@docusaurus/Head';
import {translate} from '@docusaurus/Translate';

/*
 * AAASM-5590 — give `/blog/tags` a description of its own.
 *
 * The theme renders `<PageMetadata title>` and no description, so this page
 * shipped without one, and a search engine was free to synthesise it from
 * whatever text it found. Three listing routes were in that state; this is one.
 *
 * A wrapper rather than an ejected copy: the only thing wrong with the upstream
 * component is an absent description, and wrapping leaves the rest of it on the
 * upgrade path. The tags are emitted additively — the original renders no
 * `description` meta, so there is nothing here to override.
 *
 * `@docusaurus/Head` rather than theme-common's `PageMetadata`: `theme-common`
 * is a transitive dependency that pnpm's strict layout does not expose to this
 * package, and adding it to `package.json` to reach a two-line helper would put
 * a new direct dependency in the tree for no gain. `Head` is core.
 *
 * The sentence describes the page and claims nothing about the product. A meta
 * description has no room to carry a bound beside a capability claim, which is
 * why the narrative routes carry the self-bounding product promise verbatim and
 * why an index page like this one carries no capability sentence. It also
 * avoids naming the current tag set, which would drift the moment a tag is added.
 *
 * `translate()` rather than a bare string: a bare const ships the English
 * sentence on the zh-Hant route, which is the failure this site already carries
 * on the blog and should not be extended to a page being fixed.
 */
type Props = WrapperProps<typeof BlogTagsListPageType>;

export default function BlogTagsListPageWrapper(props: Props): ReactNode {
  const description = translate({
    id: 'blog.tags.list.meta.description',
    message: 'Browse Agent Assembly blog posts by topic.',
    description: 'The meta description for the blog tags index page',
  });

  return (
    <>
      <Head>
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
      </Head>
      <BlogTagsListPage {...props} />
    </>
  );
}
