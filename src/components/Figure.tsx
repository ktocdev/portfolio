import Image from 'next/image';
import styles from './Figure.module.css';

type Variant = 'hero' | 'contact' | 'facts' | 'portrait';

type FigureProps = {
  src: string;
  alt: string;
  variant: Variant;
  className?: string;
  priority?: boolean;
  style?: React.CSSProperties;
};

/**
 * The site's one imagery treatment: a surface-strong base, the photograph
 * blended over it, and a soft-light gradient on top. The blend mode and
 * opacity come from tokens so dark mode flips them without a JS branch.
 *
 * `portrait` is the documented exception — the headshot keeps its colour and
 * takes only a tint at the bottom edge.
 */
export default function Figure({ src, alt, variant, className, priority, style }: FigureProps) {
  const classes = [styles.figure, styles[variant], className].filter(Boolean).join(' ');

  return (
    <figure className={classes} style={style}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 48rem) 100vw, 50vw"
        className={styles.image}
      />
      <div aria-hidden="true" className={styles.overlay} />
    </figure>
  );
}
