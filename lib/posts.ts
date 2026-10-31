import { Post, PostMeta, PostCardData } from '@/types/post'
import postsData from './posts.json'

const posts: Post[] = postsData as Post[]

/* 排序规则：小说《攒一架琴》固定第一；「得意」只置顶一篇（最新那篇），
   其余得意回到时间序列——全置顶会让 7 月的文章压在 10 月前面，日期跳来跳去。 */
export function sortPosts(list: Post[]): Post[] {
  const isNovel = (p: Post) => p.slug === 'novel-01'
  const novel = list.filter(isNovel)
  const lead = list
    .filter((p) => p.featured && !isNovel(p))
    .sort((a, b) => b.date.localeCompare(a.date))[0]
  const rest = list
    .filter((p) => !isNovel(p) && p !== lead)
    .sort((a, b) => b.date.localeCompare(a.date))
  return [...novel, ...(lead ? [lead] : []), ...rest]
}

/* 去掉 content，避免列表/卡片场景背着全文 */
function toMeta(post: Post): PostMeta {
  const { content: _c, ...meta } = post
  return meta
}

export function getAllPosts(): PostMeta[] {
  return sortPosts(posts).map(toMeta)
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug)
}

export function getFeaturedPosts(): PostMeta[] {
  return sortPosts(posts)
    .slice(0, 4)
    .map(toMeta)
}

export function getPostsByTag(tag: string): PostMeta[] {
  if (tag === '全部') return getAllPosts()
  return sortPosts(posts.filter((post) => post.tags.includes(tag))).map(toMeta)
}

export function getTags(): string[] {
  const counts = new Map<string, number>()
  posts.forEach((post) =>
    post.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)),
  )
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
}

/* 分区（标签）与作品数：分区栏直接标注件数，避免"点进去才知道有多少" */
export interface TagCount {
  name: string
  count: number
}

export function getTagCounts(): TagCount[] {
  const counts = new Map<string, number>()
  posts.forEach((post) =>
    post.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)),
  )
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh'))
    .map(([name, count]) => ({ name, count }))
}

/* 刊头数据：件数 / 字数 / 累计阅读分钟 / 最后更新（构建期算一次） */
export interface ArchiveStats {
  count: number
  chars: number
  minutes: number
  latest: string
}

export function getArchiveStats(): ArchiveStats {
  const list = getAllPosts()
  const minutes = list.reduce((sum, p) => sum + (parseInt(p.readingTime, 10) || 0), 0)
  const latest = list.reduce((max, p) => (p.date > max ? p.date : max), '')
  const chars = posts.reduce((sum, p) => sum + (p.content ? p.content.length : 0), 0)
  return { count: list.length, chars, minutes, latest }
}

export function toCard(post: PostMeta): PostCardData {
  return post
}

/* ---------- 全文搜索：构建期生成索引（/search-index.json），客户端按需拉 ---------- */

export interface SearchDoc {
  slug: string
  title: string
  date: string
  tags: string[]
  excerpt: string
  body: string
}

/* markdown → 纯文本：去代码块、图片、链接语法、标题符号、HTML 标签 */
function plainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, ' ')
    .replace(/[*_~|]+/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

/* 正文截断：绝大多数文章 < 2000 字，长文（小说）截前 4000 字，
   索引体积控制在 200KB 上下，只在打开搜索时下载 */
const BODY_LIMIT = 4000

export function getSearchDocs(): SearchDoc[] {
  return sortPosts(posts).map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    tags: p.tags ?? [],
    excerpt: p.excerpt ?? '',
    body: plainText(p.content ?? '').slice(0, BODY_LIMIT),
  }))
}
