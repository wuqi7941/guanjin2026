/* 文章元数据：列表/卡片场景使用，不携带正文 content */
export interface PostMeta {
  slug: string
  title: string
  excerpt: string
  date: string
  tags: string[]
  readingTime: string
  wordCount?: string
  featured?: boolean
}

/* 完整文章：仅详情页使用（含正文） */
export interface Post extends PostMeta {
  content: string
}

/* 卡片数据与元数据同构，保留别名避免组件层大改 */
export type PostCardData = PostMeta
