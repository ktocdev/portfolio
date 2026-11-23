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
  /** Omitted where a date would signal age more than experience. */
  years?: string;
  role: string;
  org?: string;
  location?: string;
  groups?: BulletGroup[];
};

export type ResumeSkill = {
  label: string;
  items: string;
};

export type ResumeProject = {
  title: string;
  years?: string;
  stack: string;
  /** Shown after the stack, where the project has a public page. */
  link?: { text: string; href: string };
  items: string[];
};

export type ResumeContact = {
  text: string;
  href?: string;
  /** Rendered on the printed sheet only: kept off the public page. */
  printOnly?: boolean;
};

/** Job titles in the document header, in reading order. */
export const RESUME_TITLES = [
  'Senior Front End Product Engineer',
  'React, Next.js & TypeScript',
  'Performance, Accessibility & Reliability',
] as const;

const contact = (label: string): ResumeContact => {
  const row = CONTACTS.find((c) => c.label === label);
  if (!row) throw new Error(`CONTACTS has no "${label}" row`);
  return { text: row.text, href: row.href };
};

/**
 * Read at build time, from .env.print.local via `npm run dev:print` or
 * `npm run build:print`. A plain build leaves it undefined, so the number is
 * absent from the deployed HTML rather than merely hidden in it — CSS alone
 * would still hand it to anyone reading the page source. Not NEXT_PUBLIC_, so
 * it cannot reach the client bundle either.
 */
const phone = process.env.RESUME_PHONE?.trim();

/**
 * Header contact line: location, phone, email, site, LinkedIn. The phone is
 * print-only on top of being build-gated, so even the print build's screen
 * view leaves it off. CONTACTS stays as is: it feeds /contact too.
 */
export const RESUME_CONTACT: ResumeContact[] = [
  { text: 'Chicago, IL' },
  ...(phone ? [{ text: phone, href: `tel:+1${phone.replace(/\D/g, '')}`, printOnly: true }] : []),
  contact('Email'),
  { text: SITE.url.replace(/^https?:\/\//, ''), href: SITE.url },
  contact('LinkedIn'),
];

/** The page's meta description: the summary is too long to serve as one. */
export const RESUME_DESCRIPTION =
  "Resume of Katie O'Connor, senior front end product engineer in Chicago: React, Next.js, and TypeScript, with a focus on performance, accessibility, and reliability.";

export const RESUME_SUMMARY =
  "Senior frontend engineer with 11+ years at Discovery Education building web experiences used by 45M students and 4.5M educators across 100 countries. Architect and technical lead of the company's design system, setting the coding, testing, and release standards every product built on, and a product engineer across 12+ teams working hand in hand with product, design, backend, and QA. Builds with React, Next.js, Vue, and Nuxt in TypeScript; integrates REST APIs, authentication providers, and third-party services; and treats performance, accessibility, and production reliability as part of the job, from on-call error monitoring in New Relic to WCAG audits. Mentors engineers through code review, documentation, and hands-on guidance, and brings modern tooling to teams, including AI-assisted development.";

/** Detailed roles — each renders as grouped bullet sets. */
export const EXPERIENCE: Entry[] = [
  {
    years: '2015–2026',
    role: 'Senior Software Engineer',
    org: 'Discovery Education',
    location: 'Chicago, IL',
    groups: [
      {
        label: 'Frontend Architecture & Technical Leadership',
        items: [
          "Architected and led nebula-nuxt, the company's TypeScript component platform for its Nuxt (SSR) applications, designed so product teams could replace legacy UI incrementally during a framework migration.",
          "Defined the platform's architecture and roadmap: shared workspace packages with versioned releases, optimized for tree-shaking so consuming apps shipped only the components they used, with icons published as a separate package.",
          'Led the migration audit for 46 legacy components, breaking it into clear, deliverable units of work; personally built 25 of the 26 delivered and partnered with 9 product teams on integration.',
          'Maintained 124 production components across three design system generations (2016, 2020, 2026); authored a position paper and presented at a company AMA to win organization-wide agreement on the platform direction.',
        ],
      },
      {
        label: 'Engineering Standards, Quality & Mentorship',
        items: [
          'Established and documented UI guidelines, reusable components, and styling conventions on a documentation site with a live theme editor that customizes themes down to semantic tokens and fonts.',
          'Owned code quality for the shared library: reviewed PRs and caught issues before release, backed changes with Vitest and Playwright, and set up GitHub Actions CI so releases shipped safely to every consumer.',
          'Served as accessibility subject matter expert, running audits and mentoring designers and engineers on WCAG, ARIA, keyboard, and focus requirements through design and code review.',
          "Promoted modern tooling: co-hosted the company's AI Office Hours, made the design system agent-ready with custom Claude skills automating component build, docs, and release, and presented a stacked-PR strategy that reduces rebase and review friction.",
        ],
      },
      {
        label: 'Product Delivery, Performance & Reliability',
        items: [
          "Built the Video Onboarding Modal with a new performance- and accessibility-optimized video player for teachers' first back-to-school login, advising on compression for slow networks and adding engagement tracking for the analytics team; reused two years running.",
          'Monitored JavaScript errors in New Relic while on call for biweekly migrations, troubleshooting production issues across a multi-team platform; delivered feature-flag projects that rendered UI from backend flag data while keeping tracking metrics intact.',
          'Embedded with the AI team to build the frontend of a human-in-the-loop review dashboard; wrote the REST integration spec with the backend engineer (data shapes, PATCH vs. POST semantics, schema trees) so both sides could build in parallel.',
          'Shipped MegaMenu for a hard Back-to-School deadline and designed its mobile experience; it detects at runtime when to collapse into a drill-down list instead of relying on fixed breakpoints.',
          'Contributed to 12+ product teams, including Techbook, Search, Assessments, Atlas (in-house CMS), Admin Tools, and User Onboarding, working in two-week Agile sprints with product, design, backend, and QA.',
        ],
      },
    ],
  },
];

/** Pre-2015 roles, summarised as one line. */
export const EARLIER_ROLES =
  'Front-end, interactive, and production roles at Sears Holdings Corporation, Razorfish, AlphaZeta Interactive, Elevation, Hewitt Associates, Bankers Life and Casualty, iPort Media, WGN-TV.';

export const EDUCATION: Entry = {
  role: 'BA, Interactive Art and Media',
  org: 'Columbia College Chicago',
};

/** The resume's skills table. The home page keeps its own, broader list in site.ts. */
export const RESUME_SKILLS: ResumeSkill[] = [
  {
    label: 'Languages & Frameworks',
    items: 'TypeScript, JavaScript (ES6+), React, Next.js, Vue 3, Nuxt, HTML5, CSS3, Tailwind CSS, Node.js',
  },
  {
    label: 'Architecture & Performance',
    items:
      'Server-Side Rendering (SSR), Component Libraries & Design Systems, Design Tokens & Theming, Versioned Packages, Tree-Shaking & Bundle Optimization, Incremental Migration, Responsive Web Design, PWAs',
  },
  {
    label: 'Integration',
    items:
      'REST API Integration & Contract Design, Authentication Providers (Supabase Auth, JWT Sessions, Two-Factor Auth), Role-Based Access Control & Row-Level Security, Third-Party Services (Google Analytics, Google Consent Mode, Microsoft Clarity), Feature Flags, Anthropic Claude API',
  },
  {
    label: 'Testing & Accessibility',
    items:
      'Vitest, Playwright (E2E), Storybook, Code Review & Standards, WCAG 2.2, ARIA, Accessibility Audits, Cross-Browser Compatibility',
  },
  {
    label: 'Delivery & Operations',
    items:
      'Git, GitHub, GitHub Actions (CI/CD), Jenkins, Docker, Cloudflare, New Relic, Production Troubleshooting, Agile / Scrum',
  },
  {
    label: 'AI-Assisted Development',
    items: 'Claude Code, Agent Skills, Spec-Driven Development, Cursor, GitHub Copilot',
  },
];

export const RESUME_PROJECTS: ResumeProject[] = [
  {
    title: 'OnTrack: Restaurant Maintenance Management',
    years: '2026–present',
    stack: 'React PWA, Supabase (Auth, Postgres, Edge Functions), Docker, Cloudflare',
    items: [
      'Designing and building a mobile-first maintenance ticketing app for a Chicago restaurant group, iterating with the operations manager, who tests each release and requests features.',
      "Designed database-enforced role-based access control for four roles (restaurant managers, operations managers, leadership, admin) using Postgres row-level security, so role, rights, and deactivation changes apply on the next request instead of waiting for tokens to expire; sessions that haven't completed two-factor sign-in can read nothing.",
      "Secured privileged Edge Functions by verifying each caller's token and role server-side, kept roles out of client-writable user metadata, and used role-based UI guards for display only; runs the test environment in Docker containers.",
    ],
  },
  {
    title: 'ktoc.dev: Portfolio',
    stack: 'React, Next.js, TypeScript, Web Animations API, Cloudflare',
    items: [
      'Built page-to-page motion transitions with the Web Animations API; integrated Google Analytics custom events, Google Consent Mode, and Microsoft Clarity behind a custom consent layer that blocks all tags until consent, with automated tests.',
    ],
  },
  {
    title: 'Main Character: AI Journal & Retrieval System',
    stack: 'Python, FastAPI, ChromaDB, Anthropic Claude API',
    items: [
      "Built a full-stack LLM app with a sandboxed online demo, a FastAPI backend, and streaming conversational UI grounded in the user's own history through embeddings and semantic retrieval.",
    ],
  },
];
