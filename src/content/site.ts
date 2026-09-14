/**
 * Site-level content: nav, contact rows, skills table, and the per-page copy
 * that is short enough to live beside its route rather than in its own file.
 */

export const SITE = {
  name: "Katie O'Connor",
  role: 'Senior Software Engineer',
  specialties: ['Design Engineer', 'Full-Stack Engineer', 'Design System Architect'],
  email: 'katie.oconnor13@gmail.com',
  url: 'https://ktoc.dev',
  copyright: "© 2026 Katie O'Connor",
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Resume', href: '/resume' },
  { label: 'Contact', href: '/contact' },
  { label: 'About', href: '/about' },
];

export type SkillRow = {
  label: string;
  items: string;
};

export const SKILLS: SkillRow[] = [
  {
    label: 'AI engineering',
    items:
      'Prompt engineering, spec-driven development, Prompt Caching, Model Routing, AI orchestration, LLM cost & model strategy, RAG, vector databases, Anthropic Claude API, Claude Design',
  },
  {
    label: 'Front-end',
    items:
      'Vue 3, Vite, Nuxt, React, Next.js, TypeScript, design systems, component & theming architecture, Playwright MCP, Tailwind CSS, Vite, accessibility',
  },
  {
    label: 'Back-end',
    items: 'Python, FastAPI, ChromaDB, Node.js, Docker',
  },
  {
    label: 'Other',
    items: 'Git, Github, VS Code, Cloudflare, THREE.js, Pinia, UX patterns, cross-team technical leadership',
  },
];

export type ContactRow = {
  label: string;
  text: string;
  href: string;
};

export const CONTACTS: ContactRow[] = [
  {
    label: 'Email',
    text: 'katie.oconnor13@gmail.com',
    href: 'mailto:katie.oconnor13@gmail.com',
  },
  {
    label: 'LinkedIn',
    text: 'linkedin.com/in/katieoconnor13',
    href: 'https://www.linkedin.com/in/katieoconnor13/',
  },
  {
    label: 'GitHub',
    text: 'github.com/ktocdev',
    href: 'https://github.com/ktocdev',
  },
];

/** Per-page copy. */
export const COPY = {
  home: {
    lead: 'I architect design systems and build AI-native applications. Eleven years at Discovery Education, across three generations of a component library serving products that reach 45M students in 100 countries, most recently as architect and technical lead of nebula-nuxt.',
    cta: 'See selected projects',
  },
  projects: {
    intro:
      'Personal work on GitHub plus one design-system case study. Select a project for screens, notes, and links.',
  },
  contact: {
    heading: 'Say hello.',
    lead: 'Based in Chicago. Open to senior and staff roles, design-system architecture, and conversations about AI-augmented engineering.',
  },
  about: {
    body: "I'm Katie. I live in eclectic Avondale, a lively neighborhood on Chicago's northwest side, with my two cats (Mitty and Ralphie) and guinea pig (Betty Boop), muse for GPS3. Outside of code, you can find me singing karaoke, at trivia night with friends, or hanging out with my many plants (including a voracious Venus flytrap!)",
    caption: 'Photos throughout this site are my own.',
    facts: [
      { label: 'Now', value: 'Building AI-native side projects; open to new roles' },
      { label: 'Education', value: 'Columbia College Chicago, BA in Interactive Art and Media, 2009' },
    ],
  },
} as const;

/** Photography. All images are Katie's own; alt text per the handoff. */
export const IMAGES = {
  heroHome: {
    src: '/media/hero-home.jpg',
    alt: 'A black swallowtail butterfly on pink and orange zinnias in a backyard garden.',
  },
  heroContact: {
    src: '/media/hero-contact.jpg',
    alt: 'A purple allium in full bloom against soft green garden foliage.',
  },
  headshot: {
    src: '/media/headshot.jpg',
    alt: "Katie O'Connor in front of a graffiti mural.",
  },
  zinnias: {
    src: '/media/zinnias-monarch.jpg',
    alt: 'A monarch butterfly resting on magenta zinnias.',
  },
} as const;
