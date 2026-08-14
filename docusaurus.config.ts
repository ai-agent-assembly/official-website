import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {DOCS_URL, MARKETING_URL} from './src/generated/site-urls';

// Agent Assembly — official product website (agent-assembly.com).
// Single-product marketing site: custom homepage + product page + blog.
// Technical docs live on docs.agent-assembly.com; the SaaS console on app.agent-assembly.com.

const config: Config = {
  title: 'Agent Assembly',
  tagline: 'Define the boundaries of autonomous agents.',
  favicon: 'img/favicon.png',

  future: {v4: true},

  url: MARKETING_URL,
  baseUrl: '/',

  organizationName: 'ai-agent-assembly',
  projectName: 'official-website',

  onBrokenLinks: 'warn',
  markdown: {hooks: {onBrokenMarkdownLinks: 'warn'}},

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-Hant'],
    localeConfigs: {
      en: {label: 'English'},
      'zh-Hant': {label: '繁體中文'},
    },
  },

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
        gtag: {trackingID: 'G-EG3PY1X0CC', anonymizeIP: true},
        sitemap: {
          /*
           * AAASM-5590. Each locale's build emits its own sitemap, so
           * `/sitemap.xml` listed only the 22 en URLs and the 22 zh-Hant ones
           * appeared solely in `/zh-Hant/sitemap.xml` — a file nothing points
           * a crawler at, since
           * the served robots.txt is Cloudflare-managed and carries no
           * `Sitemap:` line. The HTML hreflang alternates already name both
           * locales, so the site was telling a crawler two different things
           * about which pages exist.
           *
           * Each sitemap lists both locales rather than only the default-locale
           * one: `/sitemap.xml` is the conventional discovery point and has to
           * be right, but a crawler that arrives at either file should learn
           * the same set, and a symmetric rule needs no branch on which locale
           * is currently building.
           *
           * The current locale is read off `baseUrl`, which Docusaurus rewrites
           * to `/<locale>/` for a localized build. Deriving it that way keeps
           * this loop working if a third locale is added, with no list here to
           * fall out of step with `i18n.locales`.
           */
          createSitemapItems: async ({
            defaultCreateSitemapItems,
            ...params
          }) => {
            const items = await defaultCreateSitemapItems(params);
            const {defaultLocale, locales} = params.siteConfig.i18n;
            const origin = params.siteConfig.url;
            const currentPrefix = `${origin}${params.siteConfig.baseUrl}`;
            const seen = new Set<string>();
            const expanded = [];
            for (const item of items) {
              if (!item.url.startsWith(currentPrefix)) {
                // Not ours to rewrite; pass it through untouched.
                if (!seen.has(item.url)) {
                  seen.add(item.url);
                  expanded.push(item);
                }
                continue;
              }
              const routePath = item.url.slice(currentPrefix.length);
              for (const locale of locales) {
                const localePrefix =
                  locale === defaultLocale ? '/' : `/${locale}/`;
                const url = `${origin}${localePrefix}${routePath}`;
                if (!seen.has(url)) {
                  seen.add(url);
                  expanded.push({...item, url});
                }
              }
            }
            return expanded;
          },
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {defaultMode: 'dark', respectPrefersColorScheme: true},
    navbar: {
      title: 'Agent Assembly',
      logo: {alt: 'Agent Assembly', src: 'img/icon.png'},
      items: [
        {to: '/product', label: 'Product', position: 'left'},
        {
          type: 'custom-megaMenu',
          menuKey: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/ai-agent-assembly',
          label: 'GitHub',
          position: 'right',
        },
        {type: 'localeDropdown', position: 'right'},
        {
          type: 'custom-megaMenu',
          menuKey: 'getStarted',
          label: 'Get started',
          cta: true,
          align: 'right',
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
            {
              label: 'Get started',
              href: `${DOCS_URL}/`,
            },
            {
              html: '<span style="opacity:0.65">Cloud Console · 👷 coming soon</span>',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {label: 'Documentation', href: DOCS_URL},
            // AAASM-5588. In the footer rather than the navbar: it is the page
            // an evaluator goes looking for once they have a reason to, not one
            // to interrupt a first visit with, and the footer is where a
            // trust surface is conventionally looked for.
            {label: 'Trust and evidence', to: '/trust'},
            {label: 'Blog', to: '/blog'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'GitHub', href: 'https://github.com/ai-agent-assembly'},
            {
              label: 'Discussions',
              href: 'https://github.com/ai-agent-assembly/agent-assembly/discussions',
            },
            {
              label: 'Security',
              href: 'https://github.com/ai-agent-assembly/.github/blob/main/SECURITY.md',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Agent Assembly.`,
    },
    prism: {theme: prismThemes.github, darkTheme: prismThemes.dracula},
  } satisfies Preset.ThemeConfig,
};

export default config;
