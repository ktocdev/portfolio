/**
 * Resume content, ported from the prototype's `experience` array.
 * Entries render either grouped bullet sets or a single note line.
 */

export type BulletGroup = {
  label: string;
  items: string[];
};

export type Entry = {
  years: string;
  role: string;
  org: string;
  groups?: BulletGroup[];
  note?: string;
};

export const RESUME_SUMMARY =
  "Senior software engineer and design-systems architect with 11+ years at Discovery Education, on products reaching 45M students and 4.5M educators across 100 countries. Architected three successive generations of the company's component library, alongside AI-native applications built end to end.";

export const EXPERIENCE: Entry[] = [
  {
    years: '2015–2026',
    role: 'Senior Software Engineer',
    org: 'Discovery Education · Chicago, IL',
    groups: [
      {
        label: 'Design Systems Architecture & Leadership',
        items: [
          "Contributed across three generations of Discovery Education's component library: founding team for Comet (2016), build team for successor Nebula (2020), owner and primary contributor for current successor nebula-nuxt (2026). Managed 124 components and utilities across Nebula and nebula-nuxt simultaneously.",
          "Architected nebula-nuxt, a themed component system letting teams replace legacy UI incrementally while migrating to Nuxt, separating visual-language changes from component rebuilds; ratified as the quarter's formal Planning Interval deliverable following a contested internal architecture debate.",
          'Led the migration audit and stakeholder roadmap for 46 legacy component replacements; personally built 25 of the 26 components delivered in the new system and released nebula-nuxt for platform-layer consumption. Also built a new playground doc site with searchable documentation (Nuxt Content) and a live theme editor.',
          'Architected and shipped MegaMenu for a high-stakes Back-to-School (BTS) product deliverable in 3 days, then delivered a refactored production version in another 3; smart-detects when to responsively collapse into a linked drill-down list rather than relying on fixed breakpoints.',
          'Developed custom Claude skills to support migration: a planning skill that determines the right build approach (themed primitive, wrapped primitive, or fully custom component) for each legacy component, and a release-automation skill running at about $0.02 per use.',
        ],
      },
      {
        label: 'AI-Augmented Engineering & Prompt Strategy',
        items: [
          'Used Claude daily for spec-driven development, producing in-depth, well-researched implementation plans before executing.',
          'Drove the end-to-end cost of shipping a component—build, doc page, and release—to $3.05 through skill-based automation.',
          'Developed model-selection and prompt-caching strategies that reduced daily AI spend by approximately 50%, from $40–$50 to $10–$20, while preserving output quality; shared the cost-efficiency approach across the team.',
          'Built a dashboard for human-in-the-loop review and approval of AI-generated metadata, designing the API around the review workflow.',
          "Co-hosted the company's AI Office Hours, and designed and presented a cost-efficient stacked-PR strategy there, structuring PRs in advance to reduce rebasing.",
        ],
      },
      {
        label: 'Cross-Team Product Engineering & Adaptability',
        items: [
          'Integrated nebula-nuxt into the platform layer with production implementations of Product Bar, Global Nav, Page Shell, Button, Badge, Card, Switch, Row, Modal, and Tooltip; built a live theme switcher and component-comparison playground (legacy Nebula vs. nebula-nuxt side by side) to demonstrate the migration.',
          'Systems consumed by 12 product teams; partnered directly with teams including Techbook, Search, Assessments, Admin tools, and User Onboarding to architect layouts, interfaces, and components across varied product domains.',
          'Designed production-ready interfaces directly in code with Claude and existing design-system components when designs were incomplete or unavailable, bridging design and engineering to keep product work moving.',
          'Advised engineers on theming architecture, component placement, and accessibility best practices; redirected in-progress work into the shared library with proper structure.',
          'Served as accessibility subject matter expert, performing audits, bug fixes, and code review to enforce accessible implementation across products and shared components.',
        ],
      },
    ],
  },
  {
    years: '2008–2015',
    role: 'Front-end & Production Roles',
    org: 'Chicago, IL',
    note: 'Sears Holdings, Razorfish, AlphaZeta Interactive, Elevation, Hewitt Associates, Bankers Life and Casualty, iPort Media, WGN-TV.',
  },
  {
    years: '2009',
    role: 'BA, Interactive Art and Media',
    org: 'Columbia College Chicago',
  },
];
