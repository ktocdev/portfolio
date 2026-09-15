/**
 * Resume content for /resume, which is also the source the PDF is printed
 * from. Wording here is the resume's canonical text — the PDF should match
 * it, not the other way round.
 */

import { CONTACTS, SITE } from './site';

export type BulletGroup = {
  label: string;
  items: string[];
};

export type Entry = {
  years: string;
  role: string;
  org?: string;
  location?: string;
  groups?: BulletGroup[];
  note?: string;
};

export type ResumeSkill = {
  label: string;
  items: string;
};

export type ResumeProject = {
  title: string;
  stack: string;
  items: string[];
};

export type ResumeContact = {
  text: string;
  href?: string;
};

/** Job titles in the document header, in reading order. */
export const RESUME_TITLES = [
  'Senior Software Engineer',
  'Design Systems Architect',
  'Design Engineer',
] as const;

const contact = (label: string): ResumeContact => {
  const row = CONTACTS.find((c) => c.label === label);
  if (!row) throw new Error(`CONTACTS has no "${label}" row`);
  return { text: row.text, href: row.href };
};

/** Header contact line: location, email, site, LinkedIn. */
export const RESUME_CONTACT: ResumeContact[] = [
  { text: 'Chicago, IL' },
  contact('Email'),
  { text: SITE.url.replace(/^https?:\/\//, ''), href: SITE.url },
  contact('LinkedIn'),
];

export const RESUME_SUMMARY =
  "Senior software engineer and design-systems architect. Spent 11+ years at Discovery Education on products reaching 45M students and 4.5M educators across 100 countries; architected and shipped three successive generations of the company's component library. Now building AI-native applications end-to-end, from local vector-search retrieval systems to full 3D game architecture, pairing deep design-systems and accessibility expertise with daily AI-assisted engineering workflows.";

/** Detailed roles — each renders as grouped bullet sets. */
export const EXPERIENCE: Entry[] = [
  {
    years: '2015–2026',
    role: 'Senior Software Engineer',
    org: 'Discovery Education',
    location: 'Chicago, IL',
    groups: [
      {
        label: 'Design Systems',
        items: [
          'Founding team for Comet (2016), build team for its successor Nebula (2020), and owner and primary contributor for nebula-nuxt (2026); managed 124 components and utilities across Nebula and nebula-nuxt simultaneously.',
          "Architected nebula-nuxt, a themed component system letting teams replace legacy UI incrementally while migrating to Nuxt, separating visual-language changes from component rebuilds; selected over competing proposals as the quarter's committed deliverable.",
          'Led the migration audit and stakeholder roadmap for 46 legacy component replacements; personally built 25 of the 26 components delivered in the new system and released nebula-nuxt for platform-layer consumption. Also built the nebula-nuxt doc site with searchable documentation (Nuxt Content) and a theme editor that switches themes and customizes them down to semantic tokens and font choice.',
          'Architected and shipped MegaMenu for a Back-to-School product deliverable in 3 days, then delivered a refactored production version in another 3; detects at runtime when to collapse into a linked drill-down list rather than relying on fixed breakpoints.',
          'Developed custom Claude skills to support migration: a planning skill that determines the right build approach (themed primitive, wrapped primitive, or fully custom component) for each legacy component, and a release-automation skill.',
        ],
      },
      {
        label: 'AI-Assisted Engineering',
        items: [
          'Drove the end-to-end cost of shipping a component—build, doc page, and release—to $3.05 through spec-driven development and skill-based automation.',
          'Developed model-selection and prompt-caching strategies that reduced daily AI spend by roughly two-thirds, from $40–$50 to $10–$20, while preserving output quality; shared the cost-efficiency approach across the team.',
          'Built a dashboard for human-in-the-loop review and approval of AI-generated metadata, designing the API around the review workflow.',
          "Co-hosted the company's AI Office Hours, and designed and presented a cost-efficient stacked-PR strategy there, structuring PRs in advance to reduce rebasing.",
        ],
      },
      {
        label: 'Cross-Team Product Work',
        items: [
          "Integrated nebula-nuxt into the platform layer with ten production components, including Global Nav, Page Shell, and Modal; added pages to the platform team's playground showing those components under a live theme switcher, proving they stayed themable inside the production shell.",
          'Systems consumed by 12 product teams; partnered directly with teams including Techbook, Search, Assessments, Admin tools, and User Onboarding to architect layouts, interfaces, and components across varied product domains.',
          'Designed production-ready interfaces directly in code with Claude and existing design-system components when designs were incomplete or unavailable, bridging design and engineering to keep product work moving.',
          'Advised engineers on theming architecture, component placement, and accessibility best practices; redirected in-progress work into the shared library.',
          'Served as accessibility subject matter expert, performing audits, bug fixes, and code review to enforce accessible implementation across products and shared components.',
        ],
      },
    ],
  },
];

/** Pre-2015 roles, summarised as one line. */
export const EARLIER_ROLES: Entry = {
  years: '2008–2015',
  role: 'Front-end & Production Roles',
  location: 'Chicago, IL',
  note: 'Sears Holdings Corporation, Razorfish, AlphaZeta Interactive, Elevation, Hewitt Associates, Bankers Life and Casualty, iPort Media, WGN-TV.',
};

export const EDUCATION: Entry = {
  years: '2009',
  role: 'BA, Interactive Art and Media',
  org: 'Columbia College Chicago',
};

/** The resume's skills table. The home page keeps its own, broader list in site.ts. */
export const RESUME_SKILLS: ResumeSkill[] = [
  {
    label: 'AI Engineering',
    items:
      'Prompt Engineering, Spec-Driven Development, LLM Cost/Model Strategy, Prompt Caching, RAG, Vector Databases, Anthropic Claude API, Claude Design',
  },
  {
    label: 'Frontend & Architecture',
    items:
      'Vue 3, Nuxt, TypeScript, Design Systems, Component Architecture, Theming Architecture, Tailwind CSS, Vite, Accessibility (WCAG 2.2, ARIA)',
  },
  {
    label: 'Backend & Infrastructure',
    items: 'Python, FastAPI, ChromaDB, Node.js, Docker',
  },
  {
    label: 'Other',
    items:
      'User Experience Patterns, Cross-Team Technical Leadership, Figma, Git, GitHub, VS Code, Cloudflare',
  },
];

export const RESUME_PROJECTS: ResumeProject[] = [
  {
    title: 'Main Character — AI Personal Knowledge & Retrieval System',
    stack: 'Python, FastAPI, ChromaDB, Anthropic Claude API',
    items: [
      'Architected an AI-powered journal application using local embeddings, an entity graph, multi-level summaries, and semantic retrieval over personal journal entries.',
      "Built the retrieval pipeline to ground LLM responses in the user's actual journal history rather than generic model knowledge.",
    ],
  },
  {
    title: 'GPS3 (Guinea Pig Simulator 3)',
    stack: 'Vue 3 (Composition API), TypeScript, Pinia, Three.js, Vite',
    items: [
      'Solo-developed virtual pet care simulator managing 10 interconnected wellness needs across 2D game view and interactive 3D habitat.',
      "Designed game's visual language in Claude Design, then converted into a standalone token-based design system and ported back into the game as the single source of styling truth.",
    ],
  },
];
