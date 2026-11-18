/**
 * Line icons for the case study's cards, drawn on a 24px grid in the stroke
 * style of the site's other inline icons. Decorative: the card's title and
 * figure say what it is.
 */

const PATHS = {
  /* A page with a check: the proposal that was picked. */
  proposal: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 14l2 2 4-4" />
    </>
  ),
  /* A layer laid over another: the themed layer teams moved onto. */
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5z" />
      <path d="M3 12.5l9 5 9-5" />
      <path d="M3 17l9 5 9-5" />
    </>
  ),
  /* Sliders: the live theme editor. */
  sliders: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="9" cy="6" r="2" fill="var(--paper)" />
      <circle cx="15" cy="12" r="2" fill="var(--paper)" />
      <circle cx="7" cy="18" r="2" fill="var(--paper)" />
    </>
  ),
  /* A nav bar over panels: a component library, MegaMenu first. */
  components: (
    <>
      <rect x="3" y="3.5" width="18" height="5" rx="1" />
      <rect x="3" y="11.5" width="7.5" height="9" rx="1" />
      <rect x="13.5" y="11.5" width="7.5" height="9" rx="1" />
    </>
  ),
  /* Sparkles: the Claude skills. */
  sparkle: (
    <>
      <path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z" />
      <path d="M18.5 15l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z" />
    </>
  ),
  /* A person and a check: a human reviewing the AI's work. */
  review: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M15.5 11l2 2 4-4" />
    </>
  ),
  /* A screen with a play button: the onboarding video. */
  video: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M10 9.5v5l4.5-2.5z" />
    </>
  ),
  /* A pulse line: production monitoring. */
  pulse: <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />,
  /* Two people: the product teams. */
  team: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19.5c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 14.1c2.9.3 5 2.4 5 5.4" />
    </>
  ),
  /* A package: the published workspace packages. */
  package: (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
    </>
  ),
  /* A terminal prompt: the slash commands. */
  terminal: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9l3 3-3 3M12.5 15H17" />
    </>
  ),
} as const;

export type StoryIconName = keyof typeof PATHS;

export default function StoryIcon({ name, className }: { name: StoryIconName; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}
