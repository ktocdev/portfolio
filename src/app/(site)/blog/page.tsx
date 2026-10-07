import type { Metadata } from 'next';
import Link from 'next/link';

import { formatPostDate, getAllPosts } from '@/lib/blog';
import styles from './blog.module.css';

export const metadata: Metadata = {
  title: 'Blog',
  alternates: { canonical: '/blog/' },
  description: "Notes from Katie O'Connor on design systems, AI engineering, and side projects.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <section className={styles.index}>
      <h1 className={styles.heading}>Blog</h1>

      {posts.length === 0 ? (
        <p className={styles.empty}>Nothing here yet.</p>
      ) : (
        <ul role="list" className={styles.list}>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className={styles.entry}>
                <span className={styles.meta}>
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  {post.draft && <span className={styles.draft}>Draft</span>}
                </span>
                <span className={styles.title}>{post.title}</span>
                <span className={styles.summary}>{post.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
