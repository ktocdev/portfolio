/**
 * Copy for the Main Character splash at /main-character/ (design handoff:
 * design_handoff_splash/, local only). The hero's typed title drives the
 * intro timeline, so its length sets how long the typing runs.
 */

export const MC_SPLASH = {
  meta: {
    title: 'Main Character: Journal with RAG Memory',
    description:
      'Main Character is a journal that knows where to look. Write in your own words; before the companion replies, it searches everything you’ve written for what matters now.',
  },
  hero: {
    eyebrow: 'find meaning in the story of your life',
    title: 'main character',
    nav: [
      { label: 'What It Is', href: '#what' },
      { label: 'How It Works', href: '#how' },
      { label: 'Try the Demo', href: '#demo' },
      { label: 'Start Writing Your Story', href: '#start' },
    ],
    scrollHint: 'scroll ↓',
    skip: 'skip intro',
    folio: 'i',
  },
  about: {
    eyebrow: 'what it is',
    lead: 'Main Character is a journal that organizes your life as you write it. Each entry is sorted into the people, places, projects and patterns it touches, building a record of your life you can search, revisit and make sense of. A Claude companion replies to your entries as you go (you can opt out), for extra support and reflection.',
    body: 'RAG memory means retrieval augmented generation. Every entry is split into 120-token passages and embedded on your machine into a local ChromaDB vector store. When you write, your entry becomes the query: it is embedded the same way and matched against the store by meaning, while a BM25 keyword index catches names and rare words. The best matches, along with summaries and the profiles of anyone you name, go into the prompt, and Claude generates its reply from them. The model keeps no memory of its own. What it knows about you is what the search retrieved from what you wrote.',
  },
  features: [
    {
      title: 'entry summaries',
      body: 'Every entry gets a two-to-three sentence summary: what happened, how you felt, and what you decided. Skim a month in a minute.',
    },
    {
      title: 'weekly arcs',
      body: 'Each week is retold as a short narrative of what happened, what changed and what carried over, so you can see a stretch of your life as a story.',
    },
    {
      title: 'people, places & things',
      body: 'People, places, projects, things you love and animals each get a profile with dated observations from your entries and a count of how often they appear.',
    },
    {
      title: 'categories',
      body: 'Entries are tagged by life domain, like work, health or relationships. New categories can emerge from your writing, and you confirm or dismiss them.',
    },
    {
      title: 'domain documents',
      body: 'Each category keeps a living document, the one page to read to understand that part of your life. It is rewritten as new entries are tagged.',
    },
    {
      title: 'patterns',
      body: 'Once there is enough writing, the journal names what repeats: emotional cycles, habits that lead to one another, relationship dynamics. Dismiss any that don’t fit.',
    },
    {
      title: 'life summary',
      body: 'Your story retold as a whole. Each closed chapter drafts an update that you edit before saving, and it opens every new chapter.',
    },
    {
      title: 'dreams',
      body: 'Dreams are kept in their own realm, each retold with its cast, its tones and your own reading of it, so they never get mixed up with waking life.',
    },
  ],
  /* Condensed from HOW-IT-WORKS.md in the main-character repo; the full
     write-up is linked below the steps. */
  how: {
    eyebrow: 'how it works',
    steps: [
      {
        title: 'Write.',
        body: 'Entries and messages join the open chapter and are saved on your machine. The companion replies to each one like a warm, sharp friend who knows your journal: short, in your register, and anchored to dates in your history. It names patterns without lecturing and doesn’t prescribe fixes, diagnose, or reach for therapy-speak or easy praise. To save an entry without a reply, tick “no reply”.',
      },
      {
        title: 'Close.',
        body: 'Closing a chapter turns it into memory: your writing is embedded into the search index, so the journal can find it from then on. A background pass sorts it into categories, picks out people, places and projects, writes the entry summary, refreshes the weekly arc and drafts an update to your life summary. Edit the draft in the app and save it. The life summary is your story retold as a whole, and it opens every chapter as the journal’s main context.',
      },
      {
        title: 'Ask.',
        body: 'Ask “when did I last see Sam?” and Claude answers from the retrieved passages in one call. For questions that span the whole timeline, like “how often did I see Sam this year?”, smart replies runs a tool loop that searches again and reads whole entries before answering. The search screen finds every match by meaning or exact text, with no API call.',
      },
    ],
    note: 'Search and indexing run on your machine. Two small embedding models do the work: snowflake-arctic-embed-s for passages, summaries and dreams, and all-MiniLM-L6-v2 for whole-entry chunks. Every Claude call, background work included, goes through your spend caps.',
    link: {
      label: 'read the full technical write-up',
      href: 'https://github.com/ktocdev/main-character/blob/main/HOW-IT-WORKS.md',
    },
  },
  demo: {
    eyebrow: 'try the demo',
    body: 'Seven weeks of Jordan’s fictional life, with real companion replies recorded from Claude.',
    facts: ['no API key', 'runs in your browser', 'reload to start over'],
    /* Follows the scripted flow in rag-journal's demo-script.js and
       web-demo/backend.js: each send is swapped for the next scripted
       message, and the recorded close indexes the open chapter's three days,
       so ask answers change after it. `ui` is the control's label in the
       app, so the step points at the button to press. */
    steps: [
      {
        title: 'Send Jordan’s next entry',
        ui: 'send',
        body: 'The demo opens mid-week with three days in the open chapter, and the write box already holds the next entry. Send it to see the companion’s reply. Anything you type is swapped for the script.',
      },
      {
        title: 'Close the chapter',
        ui: 'close chapter',
        body: 'After a few entries, close it and watch the memory pipeline run: categories, people and places, summaries, the weekly arc and a life summary draft.',
      },
      {
        title: 'Ask before and after',
        ui: 'ask',
        body: 'Ask “when did I last mention my mom?” before the close and again after. The answer changes once the chapter is memory.',
      },
      {
        title: 'Look around',
        ui: 'entities',
        body: 'Open people, categories and patterns to see what seven weeks of writing turned into.',
      },
    ],
    cta: { label: 'open the demo', href: '/main-character/demo/' },
  },
  start: {
    eyebrow: 'start writing your story',
    /* The app runs locally, so there is no hosted Write screen to send people
       to; the repo's README covers setup. */
    body: 'Main Character runs on your local machine. Clone the repo, run the installer, add your Claude API key and write. It is single-user and local-only by design. Nothing leaves your disk except the writing sent with each Claude API call.',
    cta: { label: 'get the code', href: 'https://github.com/ktocdev/main-character' },
  },
  wordmark: 'main character',
} as const;
