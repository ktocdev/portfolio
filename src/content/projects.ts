/**
 * Project content, ported from the prototype's PROJECTS constant.
 * Long-form copy is first-person narrative voice and is reproduced verbatim.
 */

export type Link = {
  label: string;
  href: string;
};

export type Fact = {
  value: string;
  label: string;
};

/**
 * Case-study notes mix four item types. All but `text` hang back to the left
 * margin and drop their marker; `text` is the only conventional bullet.
 */
export type Note =
  | { kind: 'heading'; text: string }
  | { kind: 'subheading'; text: string }
  | { kind: 'disclosure'; text: string }
  | { kind: 'text'; text: string; link?: Link; subs?: string[] };

/** `alt` is the text alternative; `label` (the visible chip) is only a fallback since it's too terse on its own — describe what the screen shows. */
export type Slide = {
  label: string;
  src: string;
  alt?: string;
  type: 'video' | 'image';
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  meta: string;
  caseStudy?: boolean;
  description: string;
  status?: string;
  paras?: string[];
  facts?: Fact[];
  notes?: Note[];
  links: Link[];
  slides?: Slide[];
};

export const PROJECTS: Project[] = [
  {
    slug: 'discovery-education-design-systems',
    name: 'Discovery Education Design Systems',
    tagline: 'Comet · Nebula · nebula-nuxt',
    meta: 'Vue · Nuxt · 2016–2026 · Case study',
    caseStudy: true,
    description:
      "Three generations of one company's design system: founding team for Comet (2016), builder of its successor Nebula (2020), and sole architect of nebula-nuxt (2026), a themed component layer that lets twelve product teams replace legacy UI incrementally while migrating to Nuxt.",
    facts: [
      {
        value: '45M',
        label: 'students and 4.5M educators reached across 100 countries and territories',
      },
      {
        value: '6',
        label:
          'dimensions of UI rigor: visual polish, i18n/l10n, tracking, responsiveness, a11y, API flexibility',
      },
      {
        value: '3',
        label: 'generations of the library: Comet (2016), Nebula (2020), nebula-nuxt (2026)',
      },
      { value: '124', label: 'components and utilities managed across Nebula and nebula-nuxt' },
      { value: '12', label: 'product teams consuming the systems' },
      { value: '$3.05', label: 'cost to create a component, doc page, and release end to end' },
    ],
    notes: [
      { kind: 'heading', text: 'nebula-nuxt' },
      { kind: 'subheading', text: 'Proposal Stage' },
      {
        kind: 'text',
        text: 'Built nebula-nuxt: Nuxt UI + custom components, themed to match legacy Nebula brand. Purpose: apps migrate to new Nuxt components/pages without visual mismatch vs. unmigrated legacy pages. Deliberately transitional, not end state. Payoff: post-migration, org can shift visual language via theme change alone, no component rebuild needed.',
      },
      {
        kind: 'text',
        text: 'Led migration audit and stakeholder roadmap: analyzed legacy Nebula components, flagged highest-priority candidates, determined Nuxt UI equivalent vs. custom rebuild per component, assigned points per component, compiled into timeline.',
      },
      {
        kind: 'text',
        text: "nebula-nuxt was officially accepted as the quarter's Planning Interval (PI) deliverable, the company's formal engineering planning process; legacy Nebula support was separately recognized as its own PI item.",
      },
      { kind: 'subheading', text: 'Product Integration' },
      {
        kind: 'text',
        text: 'Migrated 25 of 46 legacy components to nebula-nuxt by myself; the rest had not yet been started when I moved on.',
      },
      {
        kind: 'text',
        text: 'Teammates also contributed to nebula-nuxt, adding updates and new components alongside my work.',
      },
      {
        kind: 'text',
        text: 'Integrated nebula-nuxt into the platform layer: implemented new Page Shell and Global Nav for production use, and built a live theme switcher and component-comparison playground (legacy Nebula vs. nebula-nuxt side by side) to demonstrate theming support.',
      },
      { kind: 'subheading', text: 'Doc Site Designer' },
      {
        kind: 'text',
        text: 'Built the new playground doc site for nebula-nuxt with searchable documentation via Nuxt Content; designed and implemented the entire layout and UI, and added robust scaffold, theming, and localization documentation displayed through Nuxt Content.',
      },
      {
        kind: 'text',
        text: 'Extended Nuxt UI with custom components: Tabs with responsive nav+panel variants, and Breadcrumbs with dropdowns that convert into a searchable command palette past 7 options, powered by a custom rowCollapse composable not provided by Nuxt UI/Reka out of the box.',
      },
      {
        kind: 'text',
        text: 'Created a live Theme Editor in the nebula-nuxt doc site that switches between the default Nuxt UI theme, legacy Nebula, and another unique theme, with editing granular down to color scale, spacing, font, and border radii and other theme tokens; the theme persists across all component pages until changed or reset.',
      },
      { kind: 'disclosure', text: 'Note: nebula-nuxt is internal; not publicly viewable.' },
      { kind: 'heading', text: 'Nebula Components' },
      {
        kind: 'text',
        text: 'Builder and maintainer of Nebula Components, predecessor to nebula-nuxt. Managed both design systems simultaneously.',
        link: { label: 'Nebula docs', href: 'https://nebula.discoveryeducation.com/' },
      },
      {
        kind: 'text',
        text: 'Built MegaMenu for high-stakes Back-to-School (BTS) product deliverable. Core technical feature: smart-detects when to responsively collapse into a linked drill-down list view, rather than relying on fixed breakpoint. Component adapts own layout based on available space and content, rather than hiding items past hardcoded width.',
        link: { label: 'MegaMenu demo', href: 'https://nebula.discoveryeducation.com/mega-menu-sink' },
        subs: [
          'Designed the responsive collapsed view myself: a linked drill-down list, not an accordion, that lets users tap into a category and navigate back out.',
          'Initial build: 3 days. Product then underwent significant redesign; updated MegaMenu delivered in 3 more days, matching new design.',
        ],
      },
      {
        kind: 'text',
        text: 'Built NebulaContainerTable, an enhanced NebulaTable that uses container queries instead of media queries, so the table adapts to its own container size rather than the viewport — more flexible across layouts.',
        link: {
          label: 'ContainerTable demo',
          href: 'https://nebula.discoveryeducation.com/container-table-sink',
        },
      },
      { kind: 'heading', text: 'AI Tooling' },
      { kind: 'subheading', text: 'Claude Skills' },
      {
        kind: 'text',
        text: 'Wrote a Claude planning skill that picks the build approach per component: themed primitive, wrapped primitive, or custom, running at about $1.75 per run.',
      },
      {
        kind: 'text',
        text: 'Wrote a Claude release-automation skill for the migration, running at about $0.02 per run.',
      },
      {
        kind: 'text',
        text: 'Wrote a Claude skill to port existing component doc-page examples from Nebula Components to nebula-nuxt, ensuring new components stayed backward compatible, running at about $1.30 per run.',
      },
      {
        kind: 'text',
        text: 'Wrote Claude Skill to audit and fix localization across the platform, refined against 9 company repos and used successfully in production.',
      },
      { kind: 'subheading', text: 'Extensions' },
      {
        kind: 'text',
        text: 'Built prompt-cache timer extension for VS Code because company experienced runaway Claude spend and began limiting monthly allowance per engineer. No such extension existed for VS Code at the time. Built one to fill the gap, tracking and surfacing prompt-cache timing directly in-editor. Shared with team to help others manage spend under new budget constraints.',
      },
      { kind: 'subheading', text: 'Slash Commands' },
      {
        kind: 'text',
        text: 'Built plan-create/plan-update slash commands for Claude Code: structured markdown plan docs (executive summary, phases, success criteria, known issues) generated conversationally, with approval-gated drafts and diff-style updates. Enforces consistent status markers and preserves historical context across iterations, turning ad hoc dev notes into a living, reviewable spec.',
      },
    ],
    links: [],
  },
  {
    slug: 'main-character',
    name: 'Main Character',
    tagline: 'AI personal knowledge & retrieval system',
    meta: 'Python · FastAPI · ChromaDB · Claude API',
    description:
      "An AI-powered journal that uses local embeddings, an entity graph, multi-level summaries, and semantic retrieval over personal entries. The retrieval pipeline grounds LLM responses in the user's actual journal history rather than generic model knowledge.",
    status: 'Work in progress. Full demo journal will be available online soon.',
    paras: [
      'Main Character is a journal app with an AI companion who responds to your entries. The companion is supportive, never sycophantic, and always roots for you like you are the main character. When you make mistakes and show flaws, it gives a helpful perspective and gets you on with your day.',
      "I had the vision for this app after having conversations with Claude about life stuff. I found that it didn't have very good memory. I came up with a workflow where I would have Claude make a summary of our conversation, then upload that as context for the next chat. This worked for a while, but I wanted more control.",
      'I created Main Character, which is based on the same workflow, in a web interface with many features, including entities (people, places, projects), entry and weekly summaries, overarching patterns, and more.',
      "A lot of new AI apps can rob you of something you created, because AI makes it too quick and easy. This app relies fully on your own ability to write and document what happened, and the more detail you put in, the more robust the system becomes. I know some people worry that an AI journal's reflections can end up changing their own. I think this one might hold up better because it uses a RAG memory system, grounded in what you've actually written, and the companion's responses are short, observational, and supportive rather than generic advice. But if every AI journal claims that, this one is no better than the rest, so you'll have to judge for yourself.",
      "It is very therapeutic for me to write out my feelings and read them back. It is like giving myself a second perspective on what I recount. The companion's response is almost like a comment left by someone on a blog. Because the companion has memory from the context summaries, semantic search, and vector database, it can give you personalized responses that can help you remember things you might have forgotten.",
      "Memory kicks in when you manually close and summarize a chat, recommended after about a week. You can edit the seed summary before it's saved, and the next entry starts fresh with that summary leading it. Everything blends into the existing files: summaries update, entities get extracted, categories form.",
      'Your companion can also retrieve information in a separate Chat screen. Consider it your journal Chatbot.',
      'Main Character is intended to be local only and you need a Claude API key.',
      'This might be good for people who want to find patterns in their life, remember things better, gain perspective through reflection, work toward a goal, or just enjoy feeling like the main character in their own story.',
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/ktocdev/main-character' }],
    slides: [
      { label: 'Write', src: '/projects/mc-write.mp4', type: 'video' },
      { label: 'Search', src: '/projects/mc-search.png', type: 'image' },
      { label: 'Entities', src: '/projects/mc-entities.mp4', type: 'video' },
      { label: 'History', src: '/projects/mc-history.png', type: 'image' },
      { label: 'Categories', src: '/projects/mc-categories.mp4', type: 'video' },
      { label: 'Patterns', src: '/projects/mc-patterns.mp4', type: 'video' },
      { label: 'Dreams', src: '/projects/mc-dreams.png', type: 'image' },
      { label: 'Triage', src: '/projects/mc-triage.png', type: 'image' },
      { label: 'Settings', src: '/projects/mc-settings.mp4', type: 'video' },
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
      { label: 'Title', src: '/projects/gps3-title.png', type: 'image' },
      { label: 'Adoption', src: '/projects/gps3-adoption.mp4', type: 'video' },
      { label: 'Feeding', src: '/projects/gps3-feeding.mp4', type: 'video' },
      { label: 'Poop', src: '/projects/gps3-poop.mp4', type: 'video' },
      { label: 'Shelter', src: '/projects/gps3-shelter.mp4', type: 'video' },
      { label: 'Interacting', src: '/projects/gps3-interacting.mp4', type: 'video' },
      { label: 'Shopping', src: '/projects/gps3-shopping.mp4', type: 'video' },
      { label: 'Inventory', src: '/projects/gps3-inventory.mp4', type: 'video' },
      { label: 'Tokens', src: '/projects/gps3-tokens.png', type: 'image' },
      { label: 'Design Elements', src: '/projects/gps3-design-elements.png', type: 'image' },
    ],
  },
];
