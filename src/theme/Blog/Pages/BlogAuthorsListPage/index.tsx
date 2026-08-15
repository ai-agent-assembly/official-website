import React, {type ReactNode} from 'react';
import BlogAuthorsListPage from '@theme-original/Blog/Pages/BlogAuthorsListPage';
import type BlogAuthorsListPageType from '@theme/Blog/Pages/BlogAuthorsListPage';
import type {WrapperProps} from '@docusaurus/types';
import Head from '@docusaurus/Head';
import {translate} from '@docusaurus/Translate';

/*
 * AAASM-5590 — give `/blog/authors` a description of its own.
 *
 * See `src/theme/BlogTagsListPage/index.tsx` for why this is a wrapper, why it
 * uses `@docusaurus/Head`, and why the sentence stays descriptive: same
 * absent-description defect, same reasons.
 *
 * The sentence says what the page shows — a list of authors, each with a post
 * count, which is exactly what the theme's `Author` component renders here.
 */
type Props = WrapperProps<typeof BlogAuthorsListPageType>;

export default function BlogAuthorsListPageWrapper(props: Props): ReactNode {
  const description = translate({
    id: 'blog.authors.list.meta.description',
    message:
      'The authors who write the Agent Assembly blog, with the number of posts each has published.',
    description: 'The meta description for the blog authors index page',
  });

  return (
    <>
      <Head>
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
      </Head>
      <BlogAuthorsListPage {...props} />
    </>
  );
}
