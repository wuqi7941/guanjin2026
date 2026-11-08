import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'
import { SITE } from '@/lib/site'

export const dynamic = 'force-static'

const BASE = SITE.url

/* lastModified 的语义是「这个 URL 的内容最后一次变」，不是构建时刻。
   原先六个静态页全写 new Date()：改一行 CSS 重新构建，就等于告诉 Google
   全站核心页今天都更新了——浪费抓取预算，长期 Google 会学会无视你的 lastmod。
   现在一律取「最新一篇文章的日期」，因为这些页面的内容确实只随文章增删而变。
   联系页基本是静态的，用一个固定日期。 */
const CONTACT_UPDATED = '2026-08-01'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  /* posts[0] 是置顶的《攒一架琴》（数据日期 2026-08-19），
     拿它当全站 lastModified 会让 7 个静态页永远比真实最新日期旧两个多月。 */
  const latest = posts.reduce((max, p) => (p.date > max ? p.date : max), '2026-01-01')
  const at = (d: string) => new Date(d)

  return [
    { url: `${BASE}/`, lastModified: at(latest), priority: 1, changeFrequency: 'weekly' },
    { url: `${BASE}/blog/`, lastModified: at(latest), priority: 0.9, changeFrequency: 'weekly' },
    { url: `${BASE}/about/`, lastModified: at(latest), priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/contact/`, lastModified: at(CONTACT_UPDATED), priority: 0.5, changeFrequency: 'yearly' },
    { url: `${BASE}/timeline/`, lastModified: at(latest), priority: 0.6, changeFrequency: 'weekly' },
    { url: `${BASE}/tags/`, lastModified: at(latest), priority: 0.6, changeFrequency: 'weekly' },
    { url: `${BASE}/bookmarks/`, lastModified: at(latest), priority: 0.4, changeFrequency: 'monthly' },
    { url: `${BASE}/play/`, lastModified: at(latest), priority: 0.5, changeFrequency: 'monthly' },
    ...posts.map((post) => ({
      url: `${BASE}/blog/${post.slug}/`,
      lastModified: at(post.date),
      priority: 0.6,
      changeFrequency: 'monthly' as const,
    })),
  ]
}
