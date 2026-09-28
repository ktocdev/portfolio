import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import CopyCodeButtons from '@/components/CopyCodeButtons';
import { formatPostDate, getAllPosts, getPost } from '@/lib/blog';
import styles from '../blog.module.css';

type Params = { slug: string };

/* Static export: every post is prerendered, and an unknown slug is the 404
   page rather than a runtime render there is no server to do. */
export const dynamicParams = false;

/* `output: 'export'` refuses to build a dynamic route with no params at all,
   which is the state while every post is a draft. This stand-in keeps the
   build going; getPost() finds nothing for it, so it renders the 404 page. */
const NO_POSTS = '_';

export function generateStaticParams(): Params[] {
  const slugs = getAllPosts().map(({ slug }) => ({ slug }));
  return slugs.length ? slugs : [{ slug: NO_POSTS }];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.summary,
      url: `/blog/${post.slug}/`,
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  return (
    <article className={styles.post}>
      <header className={styles.postHeader}>
        <Link href="/blog" className={styles.back}>
          <span aria-hidden="true">←</span> Blog
        </Link>
        <h1 className={styles.postTitle}>{post.title}</h1>
        <p className={styles.meta}>
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
          {post.draft && <span className={styles.draft}>Draft</span>}
        </p>
      </header>

      {/* Built from the author's own markdown at build time; there is no
          user-submitted content anywhere on this site. */}
      <div className={styles.prose} dangerouslySetInnerHTML={{ __html: post.html }} />
      <CopyCodeButtons />
    </article>
  );
}
