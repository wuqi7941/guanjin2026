import { Post, PostMeta, PostCardData } from '@/types/post'
import postsData from './posts.json'

/* 正文纯字数：去掉 Markdown 标记与空白。原先统计含语法符号与换行，
   刊头「十三万字」与卡片字数都虚高，与正文实际体量对不上。 */
const MARKUP = /[\s#>*`\-|~_\[\]()!]/g

export function countChars(md: string): number {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(MARKUP, '').length
}

/* posts.json 里大部分篇目没有 wordCount 字段（历史数据），
   这里按正文汉字数补一个，统计与卡片才准。有值的仍然以数据为准。
   不足一千字的按「字」出——原先一律 Math.max(1, …) 会把 800 字写成「1 千字」。 */
function withWordCount(list: Post[]): Post[] {
  return list.map((p) => {
    if (p.wordCount) return p
    const chars = countChars(p.content ?? '')
    const shown =
      chars >= 10000
        ? `${(chars / 10000).toFixed(1)} 万字`
        : chars >= 1000
          ? `${(chars / 1000).toFixed(1)} 千字`
          : `${chars} 字`
    return { ...p, wordCount: shown }
  })
}

const posts: Post[] = withWordCount(postsData as Post[])

/* 构建期体检（只告警不拦构建）：
   title 与 slug 相同意味着生成脚本漏取了标题，列表 / 搜索 / RSS / JSON-LD
   会直接把文件名当标题展示。piano-01/02/03/05 四篇曾如此，2026-11-05 已按正文首行标题补齐，现在应为 0 条。
   用一个模块级标志只打一次——构建会并行加载本模块多次，否则同一句话刷好几遍。 */
let titleWarned = false
if (process.env.NODE_ENV === 'production' && !titleWarned) {
  titleWarned = true
  const suspicious = posts.filter((p) => p.title === p.slug)
  if (suspicious.length) {
    console.warn(
      `[posts] ${suspicious.length} 篇标题与 slug 相同（疑似漏取标题）：${suspicious
        .map((p) => p.slug)
        .join('、')}`,
    )
  }
}

/* 排序规则：小说《攒一架琴》固定第一；「得意」只置顶一篇（最新那篇），
   其余得意回到时间序列——全置顶会让 7 月的文章压在 10 月前面，日期跳来跳去。
   次级键用 slug：同日多篇（数据里一天最多 6 篇）时顺序才确定，prev/next 不抖。 */
export function sortPosts(list: Post[]): Post[] {
  const isNovel = (p: Post) => p.slug === 'novel-01'
  const byDate = (a: Post, b: Post) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug)
  const novel = list.filter(isNovel)
  const lead = list.filter((p) => p.featured && !isNovel(p)).sort(byDate)[0]
  const rest = list.filter((p) => !isNovel(p) && p !== lead).sort(byDate)
  return [...novel, ...(lead ? [lead] : []), ...rest]
}

/* 去掉 content，避免列表/卡片场景背着全文 */
function toMeta(post: Post): PostMeta {
  const { content: _c, ...meta } = post
  return meta
}

/* 纯日期倒序：置顶只影响「目录里的展示顺序」，不该影响「最新是哪篇」。
   全站凡是问「最新」「最近」的地方都走这个，别再拿 sortPosts()[0]。 */
export function byDateDesc(a: PostMeta, b: PostMeta): number {
  return b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug)
}

export function getAllPosts(): PostMeta[] {
  return sortPosts(posts).map(toMeta)
}

/* 真正的最新一篇（排除置顶的小说，它在首页有独立横幅） */
export function getLatestPost(excludeSlug?: string): PostMeta | undefined {
  return posts
    .filter((p) => p.slug !== excludeSlug)
    .map(toMeta)
    .sort(byDateDesc)[0]
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug)
}

/* 首页「最近文章」= 按发布日期最新的 N 篇，不是目录前 N 条。
   原先取 sortPosts().slice(0,4)：小说占一位、置顶得意篇占一位，
   7 月的文章会出现在「最近」里。 */
export function getFeaturedPosts(limit = 3, excludeSlug = 'novel-01'): PostMeta[] {
  return posts
    .filter((p) => p.slug !== excludeSlug)
    .map(toMeta)
    .sort(byDateDesc)
    .slice(0, limit)
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
  /* 不能用 list（sortPosts 之后小说在最前），最新日期要单独求最大值 */
  const latest = list.reduce((max, p) => (p.date > max ? p.date : max), '')
  const chars = posts.reduce((sum, p) => sum + countChars(p.content ?? ''), 0)
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

/* 正文截断：搜索只需要"命中片段"，全文可以点进去看。
   原先取 4000 字——212 篇里绝大多数不到 4000，等于全文入库，
   索引实测 359KB（承诺 200KB）。收到 1500 字后约 150KB，移动端首开快一半。
   2026-11 修正：只留头部会让长文的后半段永远搜不到。
   改成「头 1800 + 尾 600」，索引体积几乎不变，结尾的落点也能命中。 */
const HEAD_LIMIT = 1800
const TAIL_LIMIT = 600

function bodySlice(text: string): string {
  if (text.length <= HEAD_LIMIT + TAIL_LIMIT) return text
  return `${text.slice(0, HEAD_LIMIT)} … ${text.slice(-TAIL_LIMIT)}`
}

export function getSearchDocs(): SearchDoc[] {
  return sortPosts(posts).map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    tags: p.tags ?? [],
    excerpt: p.excerpt ?? '',
    body: bodySlice(plainText(p.content ?? '')),
  }))
}
