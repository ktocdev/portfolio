'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ThemeToggle.module.css';

type Theme = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'portfolio-theme';

/* `label` overrides the accessible name only where visible text exists (WCAG 2.5.3); icon-only segments have none to agree with, so `tip` serves as their name. */
const OPTIONS: { id: Theme; tip: string; label?: string }[] = [
  { id: 'system', tip: 'Use system mode', label: 'Auto — use system mode' },
  { id: 'light', tip: 'Light mode' },
  { id: 'dark', tip: 'Dark mode' },
];

function applyTheme(theme: Theme) {
  const el = document.documentElement;
  /* `system` removes the attribute so prefers-color-scheme governs again, since data-theme="system" would match no CSS rule. */
  if (theme === 'system') el.removeAttribute('data-theme');
  else el.setAttribute('data-theme', theme);
}

export default function ThemeToggle() {
  /* Starts at the prerendered default; only the pressed segment settles on mount since layout.tsx's inline script already set the visible theme before paint. */
  const [theme, setTheme] = useState<Theme>('system');
  const segments = useRef<(HTMLButtonElement | null)[]>([]);
  /* Tooltips are pure CSS (:hover/:focus-within) with no dismissal otherwise; Escape sets this to satisfy 1.4.13 without losing pointer position or tab order. */
  const [tipsHidden, setTipsHidden] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') setTheme(saved);
    } catch {
      /* Private mode and blocked storage both throw; the default stands. */
    }
  }, []);

  function select(next: Theme) {
    applyTheme(next);
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Preference simply will not persist; the session still works. */
    }
  }

  /* Arrow keys move and select immediately, as expected for a radio group; focus is moved by hand since only the checked radio is in the tab order. */
  function onKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key === 'Escape') {
      setTipsHidden(true);
      return;
    }

    const last = OPTIONS.length - 1;
    let next: number;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = index === last ? 0 : index + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = index === 0 ? last : index - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }

    /* Arrowing to a different segment is a fresh request to see its tip. */
    setTipsHidden(false);
    /* Stops the arrow keys from scrolling the page out from under the footer. */
    event.preventDefault();
    select(OPTIONS[next].id);
    segments.current[next]?.focus();
  }

  return (
    /* Radiogroup, not toggle buttons: aria-pressed would describe segments as independently on/off; roving tabindex keeps this a single tab stop. */
    <div
      role="radiogroup"
      aria-label="Color scheme"
      className={styles.group}
      data-tips-hidden={tipsHidden || undefined}
      onMouseLeave={() => setTipsHidden(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setTipsHidden(false);
      }}
    >
      {OPTIONS.map((option, index) => (
        <span key={option.id} className={styles.tooltipWrap}>
          <button
            type="button"
            role="radio"
            ref={(el) => {
              segments.current[index] = el;
            }}
            onClick={() => select(option.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            aria-checked={theme === option.id}
            tabIndex={theme === option.id ? 0 : -1}
            aria-label={option.label ?? option.tip}
            className={styles.segment}
            data-selected={theme === option.id || undefined}
          >
            {option.id === 'system' ? 'Auto' : null}
            {option.id === 'light' ? <SunIcon /> : null}
            {option.id === 'dark' ? <MoonIcon /> : null}
          </button>
          {/* Hidden from assistive tech: repeats the accessible name above, and opacity alone would leave it in the footer's reading order. */}
          <span aria-hidden="true" className={styles.tooltip}>
            {option.tip}
          </span>
        </span>
      ))}
    </div>
  );
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="17"
      height="17"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 12a5 5 0 1 1-10 0a5 5 0 0 1 10 0Z" />
        <path
          strokeLinecap="round"
          d="M12 2c-.377.333-.905 1.2 0 2m0 16c.377.333.906 1.2 0 2m7.5-17.497c-.532-.033-1.575.22-1.496 1.495M5.496 17.5c.033.532-.22 1.575-1.496 1.496M5.003 4.5c-.033.532.22 1.576 1.497 1.497M18 17.503c.532-.032 1.575.208 1.496 1.414M22 12c-.333-.377-1.2-.905-2 0m-16-.5c-.333.377-1.2.906-2 0"
        />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="15"
      height="15"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M21.5 14.078A8.557 8.557 0 0 1 9.922 2.5C5.668 3.497 2.5 7.315 2.5 11.873a9.627 9.627 0 0 0 9.627 9.627c4.558 0 8.376-3.168 9.373-7.422"
      />
    </svg>
  );
}
