import Link from 'next/link';
import styles from './ButtonLink.module.css';

type ButtonLinkProps = {
  href: string;
  glyph: string;
  children: React.ReactNode;
  /** Filename to download as. Renders a plain `<a>` instead of a `next/link`. */
  download?: string;
  className?: string;
};

/**
 * The site's one filled button, used for internal navigation (Home) and for
 * a downloadable asset (Resume). Same look either way.
 */
export default function ButtonLink({ href, glyph, children, download, className }: ButtonLinkProps) {
  const classes = [styles.button, className].filter(Boolean).join(' ');

  const content = (
    <>
      {children}
      {' '}
      <span aria-hidden="true" className={styles.glyph}>
        {glyph}
      </span>
    </>
  );

  if (download !== undefined) {
    return (
      <a href={href} download={download} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
