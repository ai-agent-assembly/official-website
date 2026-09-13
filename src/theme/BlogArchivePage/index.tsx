import React, {type ReactNode} from 'react';
import BlogArchivePage from '@theme-original/BlogArchivePage';
import type BlogArchivePageType from '@theme/BlogArchivePage';
import type {WrapperProps} from '@docusaurus/types';

export default function BlogArchivePageWrapper(
  props: WrapperProps<typeof BlogArchivePageType>,
): ReactNode {
  return (
    <div className="aa-archive-surface">
      <BlogArchivePage {...props} />
    </div>
  );
}
