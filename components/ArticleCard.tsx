'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { m } from 'framer-motion'
import { EASE } from '@/lib/motion'
import type { PostCardData } from '@/types/post'

interface ArticleCardProps {
  post: PostCardData
  index?: number
}

/* 条目卡（纸本杂志 2.0）：
   2026-10-25 前的展品卡是固定 3/4 竖版，标题在上三分之一、展签压底，
   中间约 55% 是空纸，12 张并排像一排空盒子。改为内容驱动高度：
   上缘（编号·栏目·印）→ 标题 → 摘要 → 下缘展签，卡片不再有死白区。

   2026-10-26：纸色按写作年份微微「泛黄」——越早的文章，纸越暖一点。
   --paper-age 取 0（新）到 1（最旧），交给 CSS 混色，不新增色值。 */
const OLDEST = '2026-01-01'
const NEWEST = '2026-12-31'

function paperAge(date: string): number {
  const t = Date.parse(date)
  const a = Date.parse(OLDEST)
  const b = Date.parse(NEWEST)
  if (!isFinite(t) || b === a) return 0
  /* --paper-age 的语义是「0 新 → 1 旧」，而日期越大越新。
     原来直接返回 (t - a) / (b - a)，等于越新的文章纸越黄，和 CSS 注释正好相反。 */
  return Math.min(1, Math.max(0, 1 - (t - a) / (b - a)))
}

export function ArticleCard({ post, index = 0 }: ArticleCardProps) {
  const num = String(index + 1).padStart(2, '0')
  const meta = [post.wordCount, post.readingTime]
    .filter(Boolean)
    .join(' · ')
  const age = paperAge(post.date)

  return (
    <m.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.035, ease: EASE }}
      className="min-w-0 h-full"
    >
      <Link
        href={`/blog/${post.slug}/`}
        className="acard"
        style={{ ['--paper-age' as string]: age.toFixed(2) }}
      >
        <div className="acard-top">
          <span className="acard-no">No.{num}</span>
          <span className="acard-date">{post.date.replace(/-/g, '.')}</span>
          <span className="acard-tag">{post.tags[0] ?? '随笔'}</span>
          {post.featured && <span className="seal-mini">得意</span>}
        </div>

        <h3 className="acard-title">{post.title}</h3>

        <p className="acard-excerpt">{post.excerpt}</p>

        <div className="acard-foot">
          <span className="acard-meta">{meta}</span>
          <span className="acard-go">
            阅读
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
          </span>
        </div>
      </Link>
    </m.article>
  )
}
