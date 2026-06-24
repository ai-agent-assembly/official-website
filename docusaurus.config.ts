import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Agent Assembly — official product website (agent-assembly.com).
// Single-product marketing site: custom homepage + product page + blog.
// Technical docs live on docs.agent-assembly.com; the SaaS console on app.agent-assembly.com.

const config: Config = {
  title: 'Agent Assembly',
  tagline: 'Define the boundaries of autonomous agents.',
  favicon: 'img/favicon.ico',

  future: {v4: true},

  url: 'https://agent-assembly.com',
  baseUrl: '/',

  organizationName: 'ai-agent-assembly',
  projectName: 'official-website',

  onBrokenLinks: 'warn',
  markdown: {hooks: {onBrokenMarkdownLinks: 'warn'}},

  i18n: {defaultLocale: 'en', locales: ['en']},

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: {
          routeBasePath: 'blog',
          blogTitle: 'Agent Assembly Blog',
          blogDescription:
            'Build notes, engineering write-ups, security notes, and product stories from the team building the runtime boundary for AI agents.',
          showReadingTime: true,
          blogSidebarTitle: 'Recent posts',
          blogSidebarCount: 10,
          feedOptions: {type: ['rss', 'atom'], xslt: true},
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {customCss: './src/css/custom.css'},
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {defaultMode: 'dark', respectPrefersColorScheme: true},
    navbar: {
      title: 'Agent Assembly',
      logo: {alt: 'Agent Assembly', src: 'img/logo.svg'},
      items: [
        {to: '/product', label: 'Product', position: 'left'},
        {href: 'https://docs.agent-assembly.com', label: 'Docs', position: 'left'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {href: 'https://github.com/ai-agent-assembly', label: 'GitHub', position: 'right'},
        {href: 'https://app.agent-assembly.com', label: 'Cloud Console', position: 'right'},
        {
          to: 'https://docs.agent-assembly.com/getting-started',
          html: '<span class="navbar-cta">Get started</span>',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Product',
          items: [
            {label: 'Overview', to: '/product'},
            {label: 'Get started', href: 'https://docs.agent-assembly.com/getting-started'},
            {label: 'Cloud Console', href: 'https://app.agent-assembly.com'},
          ],
        },
        {
          title: 'Resources',
          items: [
            {label: 'Documentation', href: 'https://docs.agent-assembly.com'},
            {label: 'Blog', to: '/blog'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'GitHub', href: 'https://github.com/ai-agent-assembly'},
            {label: 'Discussions', href: 'https://github.com/ai-agent-assembly/agent-assembly/discussions'},
            {label: 'Security', href: 'https://github.com/ai-agent-assembly/.github/blob/master/SECURITY.md'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Agent Assembly.`,
    },
    prism: {theme: prismThemes.github, darkTheme: prismThemes.dracula},
  } satisfies Preset.ThemeConfig,
};

export default config;
