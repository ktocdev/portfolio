---
title: Markdown reference
date: 2026-09-27
summary: Every element a post can use, rendered with the blog's styles. A permanent draft, so it never publishes.
tags: [reference]
draft: true
---

This post is a permanent draft: it shows in `npm run dev` and never in a
production build. Use it to check how things look after a style change.

## Text

Paragraphs, **bold**, *italic*, ~~strikethrough~~, [a link](https://ktoc.dev),
and `inline code`. Inline code can be highlighted too: `const x = useRef(null){:ts}`.
Bare URLs autolink: https://ktoc.dev.

### A third-level heading

Every heading is its own anchor link, so it can be shared as
`/blog/markdown-reference/#a-third-level-heading`.

> A blockquote. Good for pulling out a line from somewhere else.
>
> It can run to more than one paragraph.

- An unordered list
- With a second item
  - And a nested one

1. An ordered list
2. Second

- [x] A task list item, done
- [ ] One still to do

---

## Code

A plain fenced block with a language:

```ts
type Post = { slug: string; title: string; date: string };

export function newest(posts: Post[]): Post | undefined {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date))[0];
}
```

With a file name, line numbers, highlighted lines and a highlighted word:

```tsx title="src/components/Greeting.tsx" showLineNumbers {3,5-7} /name/
import { useState } from 'react';

export default function Greeting({ name }: { name: string }) {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>Hello, {name} ({count})</button>
  );
}
```

With a caption:

```bash caption="Deploy is the same command it always was."
npm run new-post -- "My next post"
npm run deploy
```

Python, CSS and JSON, to check the palette across grammars:

```python
def chunk(text: str, size: int = 800) -> list[str]:
    """Split text into roughly size-character chunks on paragraph breaks."""
    out, buf = [], ""
    for para in text.split("\n\n"):
        if len(buf) + len(para) > size and buf:
            out.append(buf)
            buf = ""
        buf += para + "\n\n"
    return out + ([buf] if buf else [])
```

```css
.prose pre [data-highlighted-line] {
  border-left-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}
```

```json
{ "name": "portfolio", "private": true, "scripts": { "deploy": "wrangler deploy" } }
```

A block with no language, and one long line that should scroll sideways rather than widen the page:

```
this line is deliberately long so the block has to scroll horizontally on a phone instead of pushing the layout wider than the screen
```

## Tables

| Command | What it does |
| --- | --- |
| `npm run dev` | Local preview, drafts included |
| `npm run new-post -- "Title"` | Scaffold a draft post |
| `npm run deploy` | Build, check, upload to Cloudflare |

## Images

Images live in `public/blog/<slug>/` and are referenced from the site root:

![A monarch butterfly on a zinnia](/media/zinnias-monarch.jpg)

## Footnotes

Footnotes collect at the end of the post.[^1]

[^1]: Like this one.
