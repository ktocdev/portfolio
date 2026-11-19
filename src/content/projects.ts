import type { StoryIconName } from '@/components/StoryIcon';

/**
 * Project content, ported from the prototype's PROJECTS constant.
 * Long-form copy is first-person narrative voice and is reproduced verbatim.
 */

export type Link = {
  label: string;
  href: string;
  /** Small marker beside the link, e.g. "Coming soon". */
  badge?: string;
};

export type Fact = {
  value: string;
  label: string;
};

/**
 * Case-study notes mix five item types. All but `text` hang back to the left
 * margin and drop their marker; `text` is the only conventional bullet.
 */
export type Note =
  | { kind: 'heading'; text: string }
  | { kind: 'subheading'; text: string }
  | { kind: 'disclosure'; text: string }
  | { kind: 'para'; text: string }
  | { kind: 'text'; text: string; link?: Link; subs?: string[] };

export type StoryPoint = { text: string; link?: Link; subs?: string[] };

/**
 * One instant photo on the case study's table. The print shows `figure` big
 * with `figureLabel` under it, the white margin carries `group` and `title`
 * as a caption, and `points` are what the photo opens to.
 */
/** A screenshot of the work, at its file's own pixel size. */
export type Shot = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  /** In a story's shots: across all the columns, for a wide, short picture
   * that would be too small to read in one. */
  wide?: boolean;
};

export type Story = {
  /** Heads a row of its section's cards; stories without one share an
   * unheaded row. */
  group?: string;
  /** One of the strongest stories: its tape and figure take the accent. */
  featured?: boolean;
  title: string;
  /** A line icon on the card, above the figure (StoryIcon.tsx). */
  icon?: StoryIconName;
  figure: string;
  figureLabel: string;
  points: StoryPoint[];
  /** Shown under the points once the photo is opened. */
  shots?: Shot[];
  /** Pinned open: its text and screenshots always show, with no control to
   * put it back. */
  open?: boolean;
};

/** `alt` is the text alternative; `label` (the visible chip) is only a fallback since it's too terse on its own — describe what the screen shows. */
export type Slide = {
  label: string;
  src: string;
  /** The same screen in the dark theme, shown when the site is dark. */
  srcDark?: string;
  /** Pixel size. When every slide has one, the stage takes their shape and
   * the picture fills it, with no letterboxing. */
  width?: number;
  height?: number;
  alt?: string;
  type: 'video' | 'image';
};

/** The company's logo, in place of its name in the title: `dark` is the same artwork with
 * its wordmark in white, for the dark theme. */
export type Logo = {
  light: string;
  dark: string;
  alt: string;
  width: number;
  height: number;
};

/** One screenshot; `inset` (a phone view of the same screen) overlaps its
 * lower right. */
export type LeadShot = { main: Shot; inset?: Shot; caption: string };

/**
 * A titled part of a case study: an optional screenshot and facts grid side
 * by side, then its stories as a table of cards.
 */
export type CaseSection = {
  title: string;
  leadShot?: LeadShot;
  facts?: Fact[];
  stories: Story[];
  /** Small print under the cards. */
  note?: string;
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  meta: string;
  description: string;
  status?: string;
  paras?: string[];
  notes?: Note[];
  sections?: CaseSection[];
  links: Link[];
  slides?: Slide[];
  logo?: Logo;
};

export const PROJECTS: Project[] = [
  {
    slug: 'discovery-education-design-systems',
    name: 'Discovery Education Design Systems',
    tagline: 'Comet · Nebula · nebula-nuxt',
    meta: 'Vue · Nuxt · 2016–2026 · Case study',
    logo: {
      light: '/media/projects/de-logo-full-black-1.png',
      dark: '/media/projects/de-logo-dark.png',
      alt: 'Discovery Education',
      width: 330,
      height: 77,
    },
    description:
      "Three generations of one company's design system: founding team for Comet (2016), builder of its successor Nebula (2020), and sole architect of nebula-nuxt (2026), a themed component layer that lets twelve product teams replace legacy UI incrementally while migrating to Nuxt.",
    /* Shown as a case-study note, ahead of the sections, not a lead paragraph. */
    paras: [],
    notes: [
      {
        kind: 'para',
        text: "Three generations of one company's design system: founding team for Comet (2016), builder of its successor Nebula (2020), and sole architect of nebula-nuxt (2026), a themed component layer that lets twelve product teams replace legacy UI incrementally while migrating to Nuxt.",
      },
    ],
    sections: [
      {
        title: 'Design System',
        leadShot: {
          main: {
            src: '/media/projects/nebula/mega-menu-desktop.webp',
            alt: 'Nebula MegaMenu on desktop: the top navigation with one section open, a gradient image panel beside three grade-band columns of links.',
            width: 1600,
            height: 525,
          },
          inset: {
            src: '/media/projects/nebula/mega-menu-mobile.webp',
            alt: 'The same MegaMenu on a phone, collapsed into a drill-down list: the section list with one selected, and its links below.',
            width: 420,
            height: 720,
          },
          caption: 'Nebula MegaMenu, desktop and collapsed drill-down',
        },
        facts: [
          {
            value: '45M',
            label: 'students and 4.5M educators reached across 100 countries and territories',
          },
          {
            value: '8',
            label:
              'dimensions of UI rigor: theming, polish, i18n/l10n, analytics, responsiveness, a11y, API, and performance',
          },
          {
            value: '3',
            label: 'generations of the library: Comet (2016), Nebula (2020), nebula-nuxt (2026)',
          },
          { value: '124', label: 'components and utilities managed across Nebula and nebula-nuxt' },
          { value: '12', label: 'product teams consuming the systems' },
          { value: '46', label: 'legacy components audited and planned for the nebula-nuxt migration' },
        ],
        stories: [
          {
            group: 'nebula-nuxt',
            featured: true,
            title: 'Proposal Stage',
            icon: 'proposal',
            figure: '#1',
            figureLabel: "proposal picked as the quarter's committed deliverable",
            points: [
              {
                text: 'Architected nebula-nuxt: Nuxt UI plus custom components, themed to match the legacy Nebula brand, letting teams replace legacy UI incrementally while migrating to Nuxt and separating visual-language changes from component rebuilds. Deliberately transitional, not the end state. Payoff: post-migration, the org can shift visual language via a theme change alone, with no component rebuild needed.',
              },
              {
                text: 'Led migration audit and stakeholder roadmap: analyzed legacy Nebula components, flagged highest-priority candidates, determined Nuxt UI equivalent vs. custom rebuild per component, assigned points per component, compiled into timeline.',
              },
              {
                text: "Authored a position paper and presented it at a company AMA to win organization-wide agreement on the platform direction, without formal authority over the teams involved. nebula-nuxt was selected over competing proposals as the quarter's committed deliverable; legacy Nebula support was separately recognized as its own committed item.",
              },
            ],
          },
          {
            group: 'nebula-nuxt',
            featured: true,
            title: 'Product Integration',
            icon: 'layers',
            figure: '25 of 46',
            figureLabel: 'legacy components rebuilt by me in nebula-nuxt',
            points: [
              {
                text: 'Of the 46 legacy components on the roadmap, 26 had been migrated to nebula-nuxt when I moved on: I built 25 of them and a teammate built the other. The remaining 20 had not yet been started. Partnered with 9 product teams on integration.',
              },
              {
                text: 'Teammates also contributed to nebula-nuxt, adding updates and new components alongside my work.',
              },
              {
                text: "Integrated nebula-nuxt into the platform layer with ten production components, including Global Nav, Page Shell, and Modal; added pages to the platform team's playground showing those components under a live theme switcher, legacy Nebula vs. nebula-nuxt side by side, proving they stayed themable inside the production shell.",
              },
            ],
          },
          {
            group: 'nebula-nuxt',
            title: 'Doc Site Designer',
            icon: 'sliders',
            figure: '3 themes',
            figureLabel: 'in a live Theme Editor, editable down to each token',
            points: [
              {
                text: 'Built the new playground doc site for nebula-nuxt with searchable documentation via Nuxt Content; designed and implemented the entire layout and UI, and added robust scaffold, theming, and localization documentation displayed through Nuxt Content.',
              },
              {
                text: 'Extended Nuxt UI with custom components: Tabs with responsive nav+panel variants, and Breadcrumbs with dropdowns that convert into a searchable command palette past 7 options, powered by a custom rowCollapse composable not provided by Nuxt UI/Reka out of the box.',
              },
              {
                text: 'Created a live Theme Editor in the nebula-nuxt doc site that switches between the default Nuxt UI theme, legacy Nebula, and another unique theme, with editing granular down to color scale, spacing, font, and border radii and other theme tokens; the theme persists across all component pages until changed or reset.',
              },
            ],
          },
          {
            group: 'Nebula',
            featured: true,
            title: 'Nebula Components',
            icon: 'components',
            figure: '2 systems',
            figureLabel: 'maintained at once: Nebula and nebula-nuxt',
            points: [
              {
                text: 'Builder and maintainer of Nebula Components, predecessor to nebula-nuxt. Managed both design systems simultaneously.',
                link: { label: 'Nebula docs', href: 'https://nebula.discoveryeducation.com/' },
              },
            ],
            shots: [
              {
                src: '/media/projects/nebula/admin-form.webp',
                alt: 'An admin form built from Nebula components: role and department selects, permission checkboxes and account-setting toggles.',
                width: 795,
                height: 618,
                caption: 'Form components: select, checkbox, toggle',
              },
              {
                src: '/media/projects/nebula/accordion.webp',
                alt: 'Nebula accordion menu with its Visual Language section open, and buttons that open and close sections.',
                width: 930,
                height: 663,
                caption: 'Accordion menu',
              },
            ],
          },
          {
            group: 'Nebula',
            featured: true,
            title: 'MegaMenu',
            icon: 'components',
            open: true,
            figure: 'No breakpoints',
            figureLabel: 'collapses by measuring its own space, not the screen width',
            points: [
              {
                text: 'Built MegaMenu for a Back-to-School product deliverable. Core technical feature: detects at runtime when to collapse into a linked drill-down list view, rather than relying on fixed breakpoints. Component adapts its own layout based on available space and content, rather than hiding items past a hardcoded width.',
                link: { label: 'MegaMenu demo', href: 'https://nebula.discoveryeducation.com/mega-menu-sink' },
                subs: [
                  'Designed the responsive collapsed view myself: a linked drill-down list, not an accordion, that lets users tap into a category and navigate back out.',
                ],
              },
              {
                text: "Stopped the tab bar shifting when a tab is selected. A bold selected label is wider, which pushes its neighbors sideways. NebulaButton renders its label into a data-text attribute, so a hidden bold copy can share the label's grid cell and reserve the bold width ahead of time. The fix is CSS only and SSR-safe, with no measuring in the browser.",
              },
              {
                text: "Added a slot to replace any single panel's default categories, CTA and image layout with custom content, while every other panel keeps the standard layout.",
              },
              {
                text: 'Panel links mark the current page with aria-current="page" and can open in a new tab.',
              },
            ],
            shots: [
              {
                src: '/media/projects/nebula/mega-menu-desktop.webp',
                alt: 'Nebula MegaMenu on desktop: the top navigation with one section open, a gradient image panel beside three grade-band columns of links.',
                width: 1600,
                height: 525,
                caption: 'Desktop: one section open',
                wide: true,
              },
              {
                src: '/media/projects/nebula/mega-menu-mobile.webp',
                alt: 'The same MegaMenu on a phone, collapsed into a drill-down list: the section list with one selected, and its links below.',
                width: 420,
                height: 720,
                caption: 'Collapsed into the drill-down list',
              },
            ],
          },
          {
            group: 'Nebula',
            featured: true,
            title: 'ContainerTable',
            icon: 'components',
            open: true,
            figure: 'Container queries',
            figureLabel: 'not media queries: the table fits its box, not the screen',
            points: [
              {
                text: 'Built NebulaContainerTable, an enhanced NebulaTable that uses container queries instead of media queries, so the table adapts to its own container size rather than the viewport — more flexible across layouts.',
                link: { label: 'ContainerTable demo', href: 'https://nebula.discoveryeducation.com/container-table-sink' },
              },
            ],
            shots: [
              {
                src: '/media/projects/nebula/container-table-compare.webp',
                alt: 'Two tables in 400px containers: the original NebulaTable, driven by media queries, overflows its box; NebulaContainerTable switches to stacked cards.',
                width: 1328,
                height: 995,
                caption: 'Media query vs. container query, both 400px wide',
              },
              {
                src: '/media/projects/nebula/container-table-scroll.webp',
                alt: 'NebulaContainerTable in a 516px container, keeping all six columns and scrolling sideways within its bounds.',
                width: 798,
                height: 663,
                caption: 'ContainerTable scrolling within a 516px container',
              },
            ],
          },
          {
            group: 'AI tooling',
            featured: true,
            title: 'Claude Skills',
            icon: 'sparkle',
            figure: '1–2 days',
            figureLabel: 'of hands-on work saved per component',
            points: [
              {
                text: 'Made the design system agent-ready with custom Claude skills that automate end-to-end component delivery (build, docs page, release), with human review at each step, replacing one to two days of hands-on work per component.',
              },
              {
                text: 'Wrote a Claude planning skill that picks the build approach per component: themed primitive, wrapped primitive, or fully custom component.',
              },
              {
                text: 'Wrote a Claude release-automation skill for the migration.',
              },
              {
                text: 'Wrote a Claude skill to port existing component doc-page examples from Nebula Components to nebula-nuxt, ensuring new components stayed backward compatible.',
              },
              {
                text: 'Wrote Claude Skill to audit and fix localization across the platform, refined against 9 company repos and used successfully in production.',
              },
            ],
          },
        ],
      },
      {
        title: 'Product Team',
        stories: [
          {
            featured: true,
            title: 'AI-Native Interfaces',
            icon: 'review',
            figure: 'In parallel',
            figureLabel: 'frontend and backend built at once from one REST spec',
            points: [
              {
                text: 'Embedded with the AI team to build the frontend of a human-in-the-loop review dashboard where people evaluate and correct AI output; completed a partial design, made the UX calls it left open, and tested it with real users to make the review workflow efficient.',
              },
              {
                text: "Defined the dashboard's REST contract with the backend engineer, writing a detailed spec on data shapes, request semantics (PATCH vs. POST), and full schema trees so both sides could build in parallel.",
              },
            ],
          },
          {
            title: 'Video Onboarding Modal',
            icon: 'video',
            figure: '2 years',
            figureLabel: "running, at teachers' first back-to-school login",
            points: [
              {
                text: "Built the Video Onboarding Modal with a new performance- and accessibility-optimized video player for teachers' first back-to-school login, advising on compression for slow networks and adding engagement tracking for the analytics team; reused two years running.",
              },
            ],
          },
          {
            title: 'Production Reliability',
            icon: 'pulse',
            figure: 'On call',
            figureLabel: 'for biweekly migrations, watching New Relic',
            points: [
              {
                text: 'Monitored JavaScript errors in New Relic while on call for biweekly migrations, troubleshooting production issues across a multi-team platform; delivered feature-flag projects that rendered UI from backend flag data while keeping tracking metrics intact.',
              },
            ],
          },
          {
            title: 'Product Teams',
            icon: 'team',
            figure: '12+',
            figureLabel: 'product teams, in two-week sprints',
            points: [
              {
                text: 'Contributed to 12+ product teams, including Techbook, Search, Assessments, Atlas (in-house CMS), Admin Tools, and User Onboarding, working in two-week Agile sprints with product, design, backend, and QA.',
              },
            ],
          },
        ],
      },
      {
        title: 'Behind the scenes',
        stories: [
          {
            title: 'Platform Ownership',
            icon: 'package',
            figure: 'End to end',
            figureLabel: 'APIs, tokens, packages, icons, CI, and tests',
            points: [
              {
                text: 'Owned the platform end to end: component APIs, semantic design tokens and theming, shared workspace packages with versioned releases optimized for tree-shaking so apps shipped only the components they used, a separately published icon package, and GitHub Actions CI.',
              },
              {
                text: 'Owned code quality for the library: reviewed PRs and caught issues before release, and backed changes with Vitest and Playwright so they shipped safely to every consumer.',
              },
            ],
          },
          {
            title: 'Slash Commands & Adoption',
            icon: 'terminal',
            figure: '/plan',
            figureLabel: 'slash commands that turn dev notes into living specs',
            points: [
              {
                text: 'Built plan-create/plan-update slash commands for Claude Code: structured markdown plan docs (executive summary, phases, success criteria, known issues) generated conversationally, with approval-gated drafts and diff-style updates. Enforces consistent status markers and preserves historical context across iterations, turning ad hoc dev notes into a living, reviewable spec.',
              },
              {
                text: "Co-hosted the company's AI Office Hours to help engineers adopt AI-assisted development.",
              },
            ],
          },
        ],
      },
    ],
    links: [],
  },
  {
    slug: 'ontrack',
    name: 'OnTrack',
    tagline: 'Restaurant maintenance management',
    meta: 'React PWA · Supabase · Docker · Cloudflare',
    description:
      'A mobile-first maintenance ticketing app for a Chicago restaurant group, built with the operations manager, who tests each release and requests features.',
    /* Placeholder overview, from the resume; screens and the story to come. */
    paras: [
      'Designing and building a mobile-first maintenance ticketing app for a Chicago restaurant group, iterating with the operations manager, who tests each release and requests features.',
      "Designed database-enforced role-based access control for four roles (restaurant managers, operations managers, leadership, admin) using Postgres row-level security, so role, rights, and deactivation changes apply on the next request instead of waiting for tokens to expire; sessions that haven't completed two-factor sign-in can read nothing.",
      "Secured privileged Edge Functions by verifying each caller's token and role server-side, kept roles out of client-writable user metadata, and used role-based UI guards for display only; runs the test environment in Docker containers.",
    ],
    links: [],
    slides: [
      {
        label: 'Coming soon',
        src: '/projects/ontrack-placeholder-light.svg',
        srcDark: '/projects/ontrack-placeholder-dark.svg',
        width: 1600,
        height: 1000,
        type: 'image',
        alt: 'Placeholder: screens of OnTrack are coming soon.',
      },
    ],
  },
  {
    slug: 'main-character',
    name: 'Main Character',
    tagline: 'AI personal knowledge & retrieval system',
    meta: 'Python · FastAPI · ChromaDB · Claude API',
    description:
      "An AI-powered journal that uses local embeddings, an entity graph, multi-level summaries, and semantic retrieval over personal entries. The retrieval pipeline grounds LLM responses in the user's actual journal history rather than generic model knowledge.",
    paras: [
      'Main Character is a journal app with an AI companion who responds to your entries. The companion is supportive, never sycophantic, and always roots for you like you are the main character. When you make mistakes and show flaws, it gives a helpful perspective and gets you on with your day.',
      "I had the vision for this app after having conversations with Claude about life stuff. I found that it didn't have very good memory. I came up with a workflow where I would have Claude make a summary of our conversation, then upload that as context for the next chat. This worked for a while, but I wanted more control.",
      'I created Main Character, which is based on the same workflow, in a web interface with many features, including entities (people, places, projects), entry and weekly summaries, overarching patterns, and more.',
      "A lot of new AI apps can rob you of something you created, because AI makes it too quick and easy. This app relies fully on your own ability to write and document what happened, and the more detail you put in, the more robust the system becomes. I know some people worry that an AI journal's reflections can end up changing their own. I think this one might hold up better because it uses a RAG memory system, grounded in what you've actually written, and the companion's responses are short, observational, and supportive rather than generic advice. But if every AI journal claims that, this one is no better than the rest, so you'll have to judge for yourself.",
      "It is very therapeutic for me to write out my feelings and read them back. It is like giving myself a second perspective on what I recount. The companion's response is almost like a comment left by someone on a blog. Because the companion has memory from the context summaries, semantic search, and vector database, it can give you personalized responses that can help you remember things you might have forgotten.",
      "Memory kicks in when you manually close and summarize a chat, recommended after about a week. You can edit the life summary before it's saved, and the next entry starts fresh with that summary leading it. Everything blends into the existing files: summaries update, entities get extracted, categories form.",
      'Your companion can also retrieve information in a separate Ask screen. Consider it your journal Chatbot.',
      'Main Character is intended to be local only and you need a Claude API key.',
      'This might be good for people who want to find patterns in their life, remember things better, gain perspective through reflection, work toward a goal, or just enjoy feeling like the main character in their own story.',
    ],
    links: [
      { label: 'Main Character site', href: '/main-character/' },
      { label: 'Try the demo', href: '/main-character/demo/' },
      { label: 'GitHub', href: 'https://github.com/ktocdev/main-character' },
    ],
    slides: [
      {
        label: 'Write',
        src: '/projects/mc-write-light.webp',
        srcDark: '/projects/mc-write-dark.webp',
        width: 2160,
        height: 1350,
        type: 'image',
        alt: "The write screen mid-conversation: an entry from September 17 about rewriting a case study, the companion's reply under it, and the composer holding the next entry, with save entry, send and reflect buttons.",
      },
      {
        label: 'Ask',
        src: '/projects/mc-ask-light.webp',
        srcDark: '/projects/mc-ask-dark.webp',
        width: 2160,
        height: 1350,
        type: 'image',
        alt: "The ask screen: the question \"when did I first go to Groundwork?\" and the companion's answer, which names the first entry that mentions it by date and title and quotes it. The next question waits in the box below.",
      },
      {
        label: 'Entities',
        src: '/projects/mc-entities-light.webp',
        srcDark: '/projects/mc-entities-dark.webp',
        width: 2160,
        height: 1350,
        type: 'image',
        alt: "The entities screen: the sidebar lists people with their mention counts, under filters for kind, sort and groups. Mika is selected, and the right panel shows a summary of who Mika is, written from the observations across the entries that mention them.",
      },
      {
        label: 'History',
        src: '/projects/mc-history-light.webp',
        srcDark: '/projects/mc-history-dark.webp',
        width: 2160,
        height: 1350,
        type: 'image',
        alt: "The history screen: the open chapter and the closed ones, each with its dates, in the sidebar; the current chapter's entries in the middle; and a list of entry dates to jump to on the right. A chapters and weeks switch sits at the top of the sidebar.",
      },
      {
        label: 'Patterns',
        src: '/projects/mc-patterns-light.webp',
        srcDark: '/projects/mc-patterns-dark.webp',
        width: 2160,
        height: 1350,
        type: 'image',
        alt: "The patterns screen: patterns found across the entries, such as The Shutdown Spiral and Groundwork Resurrection, each with its kind, a confidence level, a description, what triggers it, and the entries behind it. Chips across the top filter by kind.",
      },
    ],
  },
  {
    slug: 'gps3',
    name: 'GPS3',
    tagline: 'Guinea Pig Simulator 3',
    meta: 'Vue 3 · TypeScript · Pinia · THREE.js · Vite',
    description:
      'A solo-developed virtual pet care simulator managing ten interconnected wellness needs across a 2D game view and an interactive 3D habitat. Its visual language was designed in Claude Design, converted into a standalone token-based design system, and ported back as the single source of styling truth.',
    paras: [
      'I began building the concept of a Guinea Pig Simulator (GPS) last year via vibe coding. It was a 2D game using emojis only. Through the trials of disorganized development, I started to organically understand the benefits of planning and specification-driven workflows for better quality outputs.',
      'I loved the concept and wanted to start over, and began to plan a 3D version (GPS2). I spent weeks planning the phases, six total, with 29 sub-phases. The initial UI was a simple debug interface wrapping the 3D canvas. I was focusing on the core of the game experience: a reliable game controller, object pathfinding, debugging tools, needs and personality systems, resource consumption and economy, habitat degradation and upkeep, AI autonomy, and user to pig and pig to pig interactions.',
      "My process was to have Claude execute each sub-phase one at a time, then I'd manually test what I could and run code audits on the output. This helped keep the game vision on track and the code sound and extensible.",
      'Early on, the debug interface was key to simulating different scenarios, like feedback messaging when guinea pig needs were low. Today, the debug panel still exists in the game to help with testing and to illustrate the telemetry behind the scenes.',
      'When I hit my MVP, the guinea pigs were alive. They sought food in their dish. They drank when thirsty and sheltered in the igloo when tired. Their personalities drove their motivations into unique patterns.',
      "I created the 3D meshes with Claude. Because a guinea pig is a cute potato shape, it wasn't a big challenge to iterate on the simple model. It was more difficult to build the igloo, wooden archway, and water bottle, but we got there.",
      'When Claude Design came out, I wanted to try to build a better UI chrome around the game. I envisioned something playful, tactile, and perhaps a bit nostalgic. I recreated the game screens along with documentation on tokens and design elements. Once complete, I was able to backfill the designs into GPS2, and it became GPS3.',
      'The next steps for GPS3 are ironing out gameplay bugs and finishing up the planned 3D meshes (incomplete items from the store render as cubes).',
      'I would love to collaborate with 3D designers on creating assets! I have lettuce and blueberries to pay with.',
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/ktocdev/gps3' },
      { label: 'Play', href: 'https://ktocdev.github.io/gps3/' },
      { label: 'Design System', href: 'https://ktocdev.github.io/gps2-design/' },
    ],
    slides: [
      {
        label: 'Title',
        src: '/projects/gps3-title.png',
        type: 'image',
        alt: 'The title screen shows GPS3 in a playful font, a line of 7 colorful illustrated guinea pigs on a manila colored background.',
      },
      {
        label: 'Adoption',
        src: '/projects/gps3-adoption.mp4',
        type: 'video',
        alt: 'On the adoption screen, the user scrolls past four illustrated habitats, each with two guinea pigs moving around inside. The user clicks one to select the pigs for adoption. An adoption certificate appears, and the user clicks the \"Adopt\" button. An \"Adopted\" stamp appears on the certificate.',
      },
      {
        label: 'Feeding',
        src: '/projects/gps3-feeding.mp4',
        type: 'video',
        alt: 'In the 3D habitat, two guinea pigs are present. The user clicks on the empty food bowl and a menu appears with options. The user clicks \"Add Food\" and a list of food appears. The user clicks \"Timothy Hay\" and the food bowl fills with hay. It is quickly eaten, and the user adds pellets and more hay.',
      },
      {
        label: 'Poop',
        src: '/projects/gps3-poop.mp4',
        type: 'video',
        alt: 'In the 3D habitat, seen from above, two guinea pigs are present with cage items. There are numerous piles of poop on the floor. The user removes some by clicking on them. The user clicks \"Give Care\" and then \"Quick Clean\". All the poop disappears and the guinea pigs are happy.',
      },
      {
        label: 'Shelter',
        src: '/projects/gps3-shelter.mp4',
        type: 'video',
        alt: 'In the 3D habitat, seen from above, the pink plastic igloo is in view. Both guinea pigs have low shelter needs and are shown moving into the igloo together and resting.',
      },
      {
        label: 'Interacting',
        src: '/projects/gps3-interacting.mp4',
        type: 'video',
        alt: 'In the 3D habitat, the user clicks the \"Socialize\" button, then \"Pet\". A message appears that says \"Click the guinea pig you want to pet!\" The user clicks the guinea pig and a petting animation plays. The guinea pig is happy.',
      },
      {
        label: 'Shopping',
        src: '/projects/gps3-shopping.mp4',
        type: 'video',
        alt: 'On the \"Supplies Store\" screen, the user scrolls the \"Today\'s Picks\" section and clicks \"Buy\" on Average Bedding and Timothy Hay. The user clicks the \"Habitat\" tab and scrolls down and buys the Wooden Archway Tunnel.',
      },
      {
        label: 'Inventory',
        src: '/projects/gps3-inventory.mp4',
        type: 'video',
        alt: 'In the 3D habitat, the user clicks the \"Inventory\" button. The inventory panel opens with a list of items. The user clicks on the Wooden Archway Tunnel and places it in the habitat.',
      },
      {
        label: 'Tokens',
        src: '/projects/gps3-tokens.png',
        type: 'image',
        alt: 'The color ramps page shows four ramps: pink, green, violet, and yellow. Each step in a ramp is labeled with its number, its hex value, and its token name, such as --color-green-300.',
      },
      {
        label: 'Design Elements',
        src: '/projects/gps3-design-elements.png',
        type: 'image',
        alt: 'The design elements page shows the Wood section: realistic wooden fixtures used for the GPS3 interface chrome and for the shelves in the Supplies Store.',
      },
    ],
  },
];
