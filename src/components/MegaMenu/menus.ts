export type MegaMenuKey = 'docs' | 'getStarted';

export interface MegaMenuLink {
  label: string;
  href: string;
  desc?: string;
  /** Path to an icon under static/img/lang/ (e.g. 'python.svg'). */
  icon?: string;
  /** Render as a non-clickable "Coming soon" item (feature not live yet). */
  comingSoon?: boolean;
}

export interface MegaMenuColumn {
  title: string;
  links: MegaMenuLink[];
}

export interface MegaMenuData {
  columns: MegaMenuColumn[];
}

const DOCS = 'https://docs.agent-assembly.com';
const GH_PAGES = 'https://ai-agent-assembly.github.io';

export const MENUS: Record<MegaMenuKey, MegaMenuData> = {
  docs: {
    columns: [
      {
        title: 'Platform',
        links: [
          {
            label: 'Core & Gateway',
            href: `${GH_PAGES}/agent-assembly/`,
            desc: 'Gateway, policy engine, proxy, eBPF, CLI',
          },
          {
            label: 'Documentation hub',
            href: `${DOCS}/`,
            desc: 'All docs in one place',
          },
        ],
      },
      {
        title: 'SDKs',
        links: [
          {
            label: 'Python SDK',
            href: `${GH_PAGES}/python-sdk/`,
            icon: 'python.svg',
          },
          {
            label: 'Node.js SDK',
            href: `${GH_PAGES}/node-sdk/`,
            icon: 'nodejs.svg',
          },
          {label: 'Go SDK', href: `${GH_PAGES}/go-sdk/`, icon: 'go.svg'},
        ],
      },
      {
        title: 'Reference',
        links: [
          {
            label: 'Policy reference',
            href: `${DOCS}/policy-reference.html`,
            desc: 'Every rule type, field, and section',
          },
          {
            label: 'Security model',
            href: `${DOCS}/security-model.html`,
            desc: 'Threat model and enforcement guarantees',
          },
          {
            label: 'Comparison',
            href: `${DOCS}/comparison.html`,
            desc: 'How it differs from agent frameworks',
          },
          {
            label: 'Open-core boundary',
            href: `${DOCS}/open-core-boundary.html`,
            desc: 'Open-source core vs hosted Cloud',
          },
        ],
      },
    ],
  },
  getStarted: {
    columns: [
      {
        title: 'Community · self-host',
        links: [
          {
            label: 'Quickstart',
            href: `${DOCS}/`,
            desc: 'Run the open-source stack yourself',
          },
          {
            label: 'Browse the source',
            href: 'https://github.com/ai-agent-assembly',
            desc: 'GitHub organization',
          },
        ],
      },
      {
        title: 'Cloud · managed',
        links: [
          {
            label: 'Cloud quickstart',
            href: `${DOCS}/quickstart-saas.html`,
            desc: 'Get going on the hosted control plane',
            comingSoon: true,
          },
          {
            label: 'Cloud Console',
            href: 'https://app.agent-assembly.com',
            desc: 'Sign in to the managed control plane',
            comingSoon: true,
          },
        ],
      },
    ],
  },
};
