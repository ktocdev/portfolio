/**
 * Copy for the Main Character splash at /main-character/ (design handoff:
 * design_handoff_splash/, local only). The hero's two typed lines drive the
 * intro timeline, so their length sets how long the typing runs.
 */

export const MC_SPLASH = {
  meta: {
    title: 'Main Character: Journal with RAG Memory',
    description:
      'Main Character is a journal that remembers. Write entries in your own words, and a companion with RAG memory reads along and talks with you about what you wrote.',
  },
  hero: {
    eyebrow: 'find meaning in the story of your life',
    title: 'Main Character',
    subtitle: 'Journal with RAG Memory',
    nav: [
      { label: 'What It Is', href: '#what' },
      { label: 'How It Works', href: '#how' },
      { label: 'Try the Demo', href: '#demo' },
      { label: 'Start Writing Your Story', href: '#start' },
    ],
    scrollHint: 'scroll ↓',
    skip: 'skip intro',
  },
  about: {
    eyebrow: 'what it is',
    lead: 'Main Character is a journal that remembers. You write entries in your own words. A companion reads along, keeps track of the people, places, projects and recurring themes you mention, and can talk with you about what you wrote last week or last year.',
    body: 'RAG memory means retrieval, not recall. When you write or ask a question, the journal pulls the earlier entries that matter and hands them to the companion as context. What it knows about you is what you wrote.',
  },
  features: [
    {
      title: 'write',
      body: 'Entries and conversation. Write an entry, or talk it through in chat. Nothing said in chat becomes an entry unless you make it one.',
    },
    {
      title: 'read back',
      body: 'Search by meaning or by exact text. Browse the people and places in your life, the categories your entries fall into, patterns the companion has noticed, and your dreams as their own record.',
    },
    {
      title: 'keep',
      body: 'Your key, your budget, your data. Bring your own API key, set a spending ceiling per session, and export the whole journal whenever you want.',
    },
  ],
  /* Condensed from HOW-IT-WORKS.md in the main-character repo; the full
     write-up is linked below the steps. */
  how: {
    eyebrow: 'how it works',
    steps: [
      {
        title: 'You write.',
        body: 'Entries are saved on your machine. Saving costs nothing; Claude is only called when you ask for a reply.',
      },
      {
        title: 'It looks back before it answers.',
        body: 'Before each reply, the journal searches your past entries on your own machine, both by meaning and by exact words. The companion gets what the search found: about a dozen passages, a few summaries, and anyone you named. It never reads the whole journal, which is why it can tell you when you wrote something even when it doesn’t have your exact words.',
      },
      {
        title: 'Closing a chapter makes it memory.',
        body: 'When you close a chapter, the text is indexed locally. A background pass then tags it, picks out people, places and projects, and updates the summaries. It also drafts a new life summary for you to review; that draft never replaces yours on its own.',
      },
    ],
    note: 'Search, indexing and export run on your machine at no cost. Every Claude call goes through your spend caps.',
    link: {
      label: 'read the full technical write-up',
      href: 'https://github.com/ktocdev/main-character/blob/main/HOW-IT-WORKS.md',
    },
  },
  demo: {
    eyebrow: 'try the demo',
    body: 'Talk with the companion about a sample journal before you write your own.',
    cta: { label: 'open the demo', href: '/main-character/demo/' },
  },
  start: {
    eyebrow: 'start writing your story',
    /* The app runs locally, so there is no hosted Write screen to send people
       to; the repo's README covers setup. */
    body: 'Main Character runs on your own machine. Get the code, bring your Claude API key, and write your first entry.',
    cta: { label: 'get the code', href: 'https://github.com/ktocdev/main-character' },
  },
  wordmark: 'main character',
} as const;
