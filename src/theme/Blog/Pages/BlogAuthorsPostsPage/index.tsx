import React, {type ReactNode} from 'react';
import BlogAuthorsPostsPage from '@theme-original/Blog/Pages/BlogAuthorsPostsPage';
import type BlogAuthorsPostsPageType from '@theme/Blog/Pages/BlogAuthorsPostsPage';
import type {WrapperProps} from '@docusaurus/types';
import Head from '@docusaurus/Head';
import {translate} from '@docusaurus/Translate';

/*
 * AAASM-5590 — give each per-author route (`/blog/authors/<key>`) a description.
 *
 * See `src/theme/BlogTagsListPage/index.tsx` for why this is a wrapper and why
 * it uses `@docusaurus/Head`.
 *
 * The author's own `description` from `blog/authors.yml` is preferred when one
 * is set, because a hand-written sentence about a person beats a generated one
 * and it is the same string the page renders in its header — metadata and body
 * then say the same thing by construction. `authors.yml` sets none today, so
 * the generated fallback is what currently ships; the branch is here so that
 * adding one to the YAML is enough, with no second place to update.
 */
type Props = WrapperProps<typeof BlogAuthorsPostsPageType>;

export default function BlogAuthorsPostsPageWrapper(props: Props): ReactNode {
  const {author} = props;
  const description =
    author.description ??
    translate(
      {
        id: 'blog.authors.posts.meta.description',
        message: 'Posts published by {name} on the Agent Assembly blog.',
        description: 'The meta description for a single blog author page',
      },
      {name: author.name ?? author.key},
    );

  return (
    <>
      <Head>
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
      </Head>
      <BlogAuthorsPostsPage {...props} />
    </>
  );
}
