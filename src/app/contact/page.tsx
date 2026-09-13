import type { Metadata } from 'next';

import Figure from '@/components/Figure';
import { CONTACTS, COPY, IMAGES } from '@/content/site';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Based in Chicago. Open to senior and staff roles, design-system architecture, and conversations about AI-augmented engineering.',
};

export default function ContactPage() {
  return (
    <section className={styles.contact}>
      {/* Mirrors Home: space-between pins the contact list to the bottom. */}
      <div className={styles.left}>
        <div className={styles.stack}>
          <h1 className={styles.heading}>{COPY.contact.heading}</h1>
          <p className={styles.lead}>{COPY.contact.lead}</p>
        </div>

        <ul role="list" aria-label="Contact methods" className={styles.list}>
          {CONTACTS.map((contact) => {
            const isExternal = contact.href.startsWith('http');

            return (
              <li key={contact.label} className={styles.row}>
                <span className={styles.label}>{contact.label}</span>
                <a
                  href={contact.href}
                  className={styles.value}
                  {...(isExternal ? { target: '_blank', rel: 'noopener' } : {})}
                >
                  {contact.text}
                  {isExternal ? (
                    <span className="visuallyHidden"> (opens in a new tab)</span>
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <Figure src={IMAGES.heroContact.src} alt={IMAGES.heroContact.alt} variant="contact" priority />
    </section>
  );
}
