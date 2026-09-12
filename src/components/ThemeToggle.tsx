'use client';

import { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.css';

type Theme = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'portfolio-theme';

const OPTIONS: { id: Theme; label: string }[] = [
  { id: 'system', label: 'Follow system setting' },
  { id: 'light', label: 'Light mode' },
  { id: 'dark', label: 'Dark mode' },
];

function applyTheme(theme: Theme) {
  const el = document.documentElement;
  /* `system` removes the attribute entirely so prefers-color-scheme governs
     again — setting data-theme="system" would match no CSS rule. */
  if (theme === 'system') el.removeAttribute('data-theme');
  else el.setAttribute('data-theme', theme);
}

export default function ThemeToggle() {
  /* Starts at the prerendered default and is corrected on mount. The visible
     theme is already correct by then — the inline script in layout.tsx set it
     before paint — so only the pressed segment settles here. */
  const [theme, setTheme] = useState<Theme>('system');

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

  return (
    <div role="group" aria-label="Color scheme" className={styles.group}>
      {OPTIONS.map((option) => (
        <span key={option.id} className={styles.tooltipWrap}>
          <button
            type="button"
            onClick={() => select(option.id)}
            aria-pressed={theme === option.id}
            aria-label={option.label}
            className={styles.segment}
            data-selected={theme === option.id || undefined}
          >
            {option.id === 'system' ? 'Auto' : null}
            {option.id === 'light' ? <SunIcon /> : null}
            {option.id === 'dark' ? <MoonIcon /> : null}
          </button>
          <span className={styles.tooltip} role="tooltip">
            {option.label}
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
