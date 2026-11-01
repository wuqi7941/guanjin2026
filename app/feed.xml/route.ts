import { getAllPosts } from '@/lib/posts'
import { SITE } from '@/lib/site'

export const dynamic = 'force-static'

const BASE = SITE.url

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function GET() {
  const posts = getAllPosts().slice(0, 30)
  /* lastBuildDate 用最新一篇文章的日期，不是构建时刻——
     否则每构建一次，所有订阅器都会以为有新内容，是退订率上升的经典原因 */
  const latest = posts[0]?.date ?? '2026-01-01'
  const items = posts
    .map((post) => {
      const url = `${BASE}/blog/${post.slug}/`
      const date = new Date(post.date).toUTCString()
      return `    <item>
      <title>${esc(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${esc(post.excerpt)}</description>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>余烬 EMBERS</title>
    <link>${BASE}/</link>
    <description>${esc(SITE.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  })
}
