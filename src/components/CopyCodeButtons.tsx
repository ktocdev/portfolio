'use client';

import { useEffect, useRef } from 'react';

import styles from './CopyCodeButtons.module.css';

const RESET_MS = 2000;

/* griddy-icons:copy (Iconify). A string, not JSX: the buttons are built with
   the DOM, below. The icon's transparent 24×24 frame path is dropped. */
const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M7.25 18h12.5c.69 0 1.25-.56 1.25-1.25V4.25C21 3.56 20.44 3 19.75 3H7.25C6.56 3 6 3.56 6 4.25v12.5c0 .69.56 1.25 1.25 1.25m12.25-1.5h-12v-12h12zM5.75 21H18v-1.5H5.75c-.69 0-1.25-.56-1.25-1.25V6H3v12.25A2.755 2.755 0 0 0 5.75 21"/></svg>`;

/**
 * Adds a copy button to each code block in the post it sits beside: in the
 * file-name bar when the block has one, otherwise over the code's top-right
 * corner. The post body is prerendered HTML, not React, so the buttons are
 * attached after hydration instead of rendered with it; without script the
 * blocks simply have none. Renders an empty marker to find its own article.
 */
export default function CopyCodeButtons() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const scope = marker.current?.closest('article');
    if (!scope) return;

    const timers = new Set<number>();
    const added: HTMLButtonElement[] = [];

    for (const figure of scope.querySelectorAll<HTMLElement>('figure[data-rehype-pretty-code-figure]')) {
      const pre = figure.querySelector('pre');
      if (!pre || figure.querySelector(`.${styles.button}`)) continue;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = `buttonReset ${styles.button}`;
      button.setAttribute('aria-label', 'Copy code');
      button.title = 'Copy code';
      /* Empty until a click; the live region announces "Copied" (and shows it
         beside the icon) without changing the button's name. */
      const status = document.createElement('span');
      status.className = styles.status;
      status.setAttribute('aria-live', 'polite');
      button.append(status);
      button.insertAdjacentHTML('beforeend', COPY_ICON);

      button.addEventListener('click', async () => {
        try {
          /* One entry per [data-line]; the highlighter pads blank lines with a
             space so they keep their height, which shouldn't be copied. */
          const lines = [...pre.querySelectorAll('[data-line]')].map((line) =>
            line.textContent === ' ' ? '' : (line.textContent ?? '')
          );
          await navigator.clipboard.writeText(lines.join('\n'));
          status.textContent = 'Copied';
          button.setAttribute('data-copied', '');
        } catch {
          status.textContent = 'Copy failed';
        }
        const timer = window.setTimeout(() => {
          status.textContent = '';
          button.removeAttribute('data-copied');
          timers.delete(timer);
        }, RESET_MS);
        timers.add(timer);
      });

      const title = figure.querySelector('[data-rehype-pretty-code-title]');
      if (title) {
        title.setAttribute('data-has-copy', '');
        title.append(button);
      } else {
        figure.append(button);
      }
      added.push(button);
    }

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      added.forEach((button) => {
        button.parentElement?.removeAttribute('data-has-copy');
        button.remove();
      });
    };
  }, []);

  return <span ref={marker} hidden />;
}
