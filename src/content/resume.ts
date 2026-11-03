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
  'Senior Frontend & Design Engineer',
  'Design Systems in Code',
  'AI-Native Product UI',
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
  "Resume of Katie O'Connor, senior frontend and design engineer in Chicago: design systems, AI-native product UI, accessibility.";

export const RESUME_SUMMARY =
  "Senior frontend and design engineer with 11+ years at Discovery Education building web experiences used by 45M students and 4.5M educators across 100 countries. Architect and de facto technical lead of the company's design system across three generations, setting the component, token, documentation, testing, and release standards every product built on, and a product engineer on 12+ teams working hand in hand with product, design, analytics, backend, and QA. Embedded with the AI team to take a human-in-the-loop review product from a partial design to a user-tested frontend, and made the design system agent-ready so AI workflows could ship components end to end. Outside work, designs and builds full-stack products on the Claude API and Supabase, including a streaming, retrieval-grounded AI journal and a role-secured maintenance app for a Chicago restaurant group. Accessibility subject matter expert, mentor, and AI-first developer; six years fully remote with distributed teams, and open to hybrid work in Chicago.";

/** Detailed roles — each renders as grouped bullet sets. */
export const EXPERIENCE: Entry[] = [
  {
    years: '2015–2026',
    role: 'Senior Software Engineer',
    org: 'Discovery Education',
    location: 'Chicago, IL',
    groups: [
      {
        label: 'Design System Architecture & Leadership',
        items: [
          "Architected and led nebula-nuxt, the company's TypeScript component library for its server-rendered Nuxt apps, built on Nuxt UI so product teams could replace legacy UI incrementally during a framework migration without coupling visual changes to component rebuilds.",
          'Owned the platform end to end: component APIs, semantic design tokens and theming, shared workspace packages with versioned releases optimized for tree-shaking so apps shipped only the components they used, a separately published icon package, and GitHub Actions CI.',
          'Published guidelines, component patterns, and styling conventions on a searchable documentation site with a live theme editor: users start from a theme and customize it down to individual semantic tokens and fonts, with edits reflected live across every component.',
          'Maintained 124 production components and utilities consumed by every product across three generations of the design system: founding team for Comet (2016), build team for Nebula (2020), and owner and primary contributor for nebula-nuxt (2026).',
          'Led the migration audit for 46 legacy components, mapping what to deprecate and breaking the work into deliverable units before sprint planning; personally built 25 of the 26 delivered and partnered with 9 product teams on integration.',
          "Authored a position paper and presented at a company AMA to win organization-wide agreement on the platform direction over competing proposals, without formal authority over the teams involved; it became the quarter's committed deliverable.",
        ],
      },
      {
        label: 'AI-Native Interfaces & AI-Augmented Engineering',
        items: [
          'Embedded with the AI team to build the frontend of a human-in-the-loop review dashboard where people evaluate and correct AI output; completed a partial design, made the UX calls it left open, and tested it with real users to make the review workflow efficient.',
          "Defined the dashboard's REST contract with the backend engineer, writing a detailed spec on data shapes, request semantics (PATCH vs. POST), and full schema trees so both sides could build in parallel.",
          'Made the design system agent-ready with custom Claude skills for planning and release, automating end-to-end component delivery (build, docs page, release) that used to take one to two days of hands-on work, with human review at each step.',
          "Co-hosted the company's AI Office Hours to help engineers adopt AI-assisted development.",
          'Automated repetitive setup before agentic tools existed, writing Python scripts with GitHub Copilot that generated code template files for new work.',
        ],
      },
      {
        label: 'Product Delivery, Performance & Reliability',
        items: [
          "Built the Video Onboarding Modal and a new performance- and accessibility-optimized video player that introduced new features to teachers on their first back-to-school login, the year's biggest launch window, with autoplay, skip, hard dismiss, and dismiss-for-session controls; reused two years running.",
          "Implemented the modal's engagement tracking for the analytics team, mapping user data IDs to backend actions to show whether teachers watched some, all, or none of the videos, and advised on video compression so playback held up on slow networks.",
          'Shipped MegaMenu to production in 3 days for a hard Back-to-School deadline, later extending it for a redesign with new features; it detects at runtime when to collapse into a drill-down list instead of relying on fixed breakpoints.',
          'Delivered feature-flagged releases across multiple projects, rendering from backend flag data to expose new features to targeted audiences first while keeping tracking metrics intact, so engagement data could decide wider rollout.',
          'Monitored JavaScript errors in New Relic while on call for biweekly migrations, triaging and troubleshooting production issues across a multi-team platform.',
          'Contributed as a product engineer to 12+ product teams, including Techbook, Search, Assessments, Atlas (in-house CMS), Admin Tools, and User Onboarding, in two-week Agile sprints with product, design, analytics, backend, and QA from planning through launch.',
        ],
      },
      {
        label: 'Design Partnership & Figma',
        items: [
          "Kept design and code in sync with the design team: maintained the design system's Figma files, used Dev Mode for implementation requirements, brought coded components into Figma with plugins, implemented slots on cards, and advised on auto layout so prototypes translated cleanly into responsive components.",
          "Filled design gaps directly: designed MegaMenu's mobile solution, a single panel that keeps the top-level menu in view and opens the selected section beneath it, and the Video Onboarding Modal's mobile experience, a fullscreen scrolling view with the player scaled to its aspect ratio and the videos stacked below.",
          'Integrated design system components into Atlas, the in-house CMS, so they could be used in Atlas-built pages, and built features for its authoring interface.',
        ],
      },
      {
        label: 'Engineering Standards, Quality & Mentorship',
        items: [
          'Owned code quality for the shared library: reviewed PRs and caught issues before release, and backed changes with Vitest and Playwright so they shipped safely to every consumer.',
          'Built a Storybook site for legacy components while converting them to TypeScript, navigating years of code written by other engineers and fixing the defects it surfaced.',
          'Served as accessibility subject matter expert, running audits and translating WCAG, ARIA, keyboard, and focus requirements into practical guidance for designers and engineers through design and code review.',
          'Designed and presented a stacked-PR strategy that reduces rebasing and review friction for engineers working asynchronously across US and UK time zones; mentored engineers across teams on theming, component placement, and accessible implementation.',
        ],
      },
    ],
  },
];

/** Pre-2015 roles, summarised as one line. */
export const EARLIER_ROLES =
  'Front-end, interactive, and production roles at Sears Holdings Corporation, Razorfish, AlphaZeta Interactive, Elevation, Hewitt Associates, Bankers Life and Casualty, iPort Media, and WGN-TV.';

export const EDUCATION: Entry = {
  role: 'BA, Interactive Art and Media',
  org: 'Columbia College Chicago',
};

/** The resume's skills table. The home page keeps its own, broader list in site.ts. */
export const RESUME_SKILLS: ResumeSkill[] = [
  {
    label: 'Languages & Frameworks',
    items:
      'TypeScript, JavaScript (ES6+), React, Next.js, Vue 3, Nuxt, HTML, CSS, Tailwind CSS, Node.js, Python, FastAPI, Supabase, PostgreSQL',
  },
  {
    label: 'Design Systems in Code',
    items:
      'Component Libraries & Component APIs, Design Tokens & Semantic Theming, Live Theme Editor, Documentation Sites, Storybook, Workspace Packages, Versioned Releases, Tree-Shaking & Bundle Optimization, Legacy UI Audits & Incremental Migration',
  },
  {
    label: 'AI-Native UI & LLM Systems',
    items:
      'Anthropic Claude API, Streaming & Conversational UI, Human-in-the-Loop Review, Tool Use, Embeddings & Semantic Retrieval, Vector Databases (ChromaDB), Prompt & Context Engineering, Prompt Caching, Model Selection, Agent Skills',
  },
  {
    label: 'Design & Figma',
    items:
      'Figma Dev Mode, Figma Variables & Code Token Sync, Libraries, Auto Layout, Component Slots, Figma Plugins, Claude Design, Design-to-Code Handoff, User Testing, Responsive & Mobile Design',
  },
  {
    label: 'Interaction & Motion',
    items:
      'Web Animations API, Page Transitions, Three.js, Video Playback & Media Performance, Keyboard Interaction & Focus Management',
  },
  {
    label: 'Accessibility & Quality',
    items:
      'WCAG 2.2, ARIA, Accessibility Audits, Vitest, Playwright (E2E), Code Review & PR Standards, Cross-Browser Compatibility, Performance Optimization',
  },
  {
    label: 'Integration & Security',
    items:
      'RESTful API Contract Design, Authentication (Supabase Auth, JWT Sessions, Two-Factor), Role-Based Access Control & Row-Level Security, Feature Flags & Staged Rollouts, Server-Side Rendering (SSR), PWAs',
  },
  {
    label: 'Analytics & Privacy',
    items:
      'Google Analytics (Custom Events), Google Consent Mode, Microsoft Clarity (Masked Session Replay), Google Search Console, Consent Management & Strict Tag Blocking, Engagement Tracking',
  },
  {
    label: 'Delivery & Operations',
    items:
      'Git, GitHub, GitHub Actions (CI/CD), Jenkins, Docker, Cloudflare, Vite, New Relic, On-Call Release Support, Stacked PR Workflows, Agile / Scrum',
  },
  {
    label: 'AI-Assisted Development',
    items:
      'Claude Code, Cursor, Codex, GitHub Copilot, Spec-Driven Development, AI Code Quality & Security Audits, Python Scripting & Code Scaffolding',
  },
];

export const RESUME_PROJECTS: ResumeProject[] = [
  {
    title: 'OnTrack: Restaurant Maintenance Management',
    years: '2026–present',
    stack: 'React PWA, Supabase (Auth, Postgres, Edge Functions), Docker, Cloudflare, Claude Design, Claude Code',
    items: [
      'Designing and building a mobile-first maintenance ticketing app for a Chicago restaurant group to replace their current system; designed 100+ screens in Claude Design and presented the plan to the client in a review deck.',
      'Iterating with the operations manager, who tests each release and requests features, with every round of feedback going back into the design and build.',
      "Designed database-enforced role-based access control for four roles (restaurant managers, operations managers, leadership, admin) using Postgres row-level security, with roles looked up per request so changes apply immediately instead of waiting for tokens to expire; sessions that haven't completed two-factor sign-in can read nothing.",
      "Secured privileged Edge Functions by verifying each caller's token and role server-side, kept roles out of client-writable user metadata, used role-based UI guards for display only, and contained the test environment in Docker.",
    ],
  },
  {
    title: 'Main Character: AI Journal & Retrieval System',
    years: '2026',
    stack: 'Python, FastAPI, ChromaDB, Anthropic Claude API, Figma',
    link: { text: 'ktoc.dev/main-character', href: 'https://ktoc.dev/main-character' },
    items: [
      "Designed and built a full-stack LLM application with a sandboxed online demo: Python/FastAPI backend, local embeddings, a ChromaDB vector store, an entity graph, and multi-level summaries that ground an AI companion in the user's own history, with prompts tuned to stay supportive without sycophancy.",
      'Built two streaming conversational surfaces: a companion users chat with while writing, and an Ask mode for natural-language questions about past entries with retrieval-grounded answers and follow-ups; a smart-reply mode streams each tool-use round as it happens.',
      'Streamed every reply token by token through a FastAPI chunked response and designed for model latency and non-deterministic output: a thinking state holds until the first token, the log follows the reply only if the reader was already at the bottom, and an interrupted stream is clearly flagged.',
      "Created the brand identity and splash page spotlight effects, and brought the app's design tokens into Figma as variables so design and code share the same values.",
      "Instrumented the demo with custom Google Analytics events and masked Clarity session recordings anywhere a visitor's own writing appears, injected at build time with a build check that fails if a refresh breaks the injection.",
    ],
  },
  {
    title: 'ktoc.dev: Portfolio',
    stack: 'React, Next.js, TypeScript, Web Animations API, Cloudflare',
    items: [
      'Designed and built a personal portfolio with custom page-to-page motion transitions written directly against the Web Animations API.',
      "Built a custom, dependency-free consent layer with strict blocking and separate choices for analytics and session recording: no tag loads and no cookie is set before consent, Google Consent Mode and Clarity's consent API are wired in, and opting out stops each tool immediately in every open tab and cleans up its cookies.",
      'Covered consent state, per-tool loading, cookie cleanup, and cross-tab sync with automated tests, plus production-build browser checks that keep test traffic out of live analytics.',
    ],
  },
  {
    title: 'GPS3: Guinea Pig Simulation Game',
    years: '2025–present',
    stack: 'Vue 3, Three.js, Claude Design, Claude Code',
    items: [
      'Building a 3D simulation game that pairs a real-time Three.js scene with a reactive Vue 3 interface, with a custom debugging interface for testing the game during development.',
      "Ran a design-to-code pipeline for the game's UI chrome: designed it in Claude Design, wrote the handoff to replace the debug interface in the live app, then refined the app's design system and components so the shipped UI matched the design.",
    ],
  },
];
