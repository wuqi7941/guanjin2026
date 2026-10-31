'use client'

import { m } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { EASE } from '@/lib/motion'
import type { PostCardData } from '@/types/post'

interface FeaturedCardProps {
  post: PostCardData
  index?: number
}

/* 头条卡：杂志封面式导览——左侧编号与标题，右侧摘要与展签 */
export function FeaturedCard({ post, index = 0 }: FeaturedCardProps) {
  const num = String(index + 1).padStart(2, '0')
  const meta = [post.date.replace(/-/g, '.'), post.wordCount, post.readingTime].filter(Boolean) as string[]

  return (
    <m.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: EASE }}
      className="mb-8 md:mb-10"
    >
      <Link
        href={`/blog/${post.slug}/`}
        className="feature-card group grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-7 md:gap-10 p-6 sm:p-8 md:p-10"
      >
        {/* 左：标签 · 编号 · 大标题 */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline justify-between gap-4 mb-6 md:mb-8">
            <span className="feature-label">{post.tags[0] ?? '随笔'}</span>
            <span className="feature-index" aria-hidden>{num}</span>
          </div>

          <h2 className="feature-title">{post.title}</h2>

          {post.featured && <span className="seal-mini self-start mt-5">得意</span>}
        </div>

        {/* 右：摘要 · 展签 · 入口 */}
        <div className="flex flex-col justify-between gap-8 md:border-l md:border-[var(--hairline)] md:pl-10">
          <p className="text-[15px] leading-[1.9] text-[var(--ink-muted)] line-clamp-4">
            {post.excerpt}
          </p>

          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-subtle)] pb-4 border-b border-[var(--hairline)]">
              {meta.map((m, i) => (
                <span key={m} className="flex items-center gap-3">
                  {i > 0 && <span className="w-1 h-1 rounded-full bg-[var(--ink-tertiary)]" aria-hidden />}
                  {m}
                </span>
              ))}
            </div>
            <span className="inline-flex items-center gap-2 pt-4 text-[13px] font-mono tracking-[0.18em] uppercase text-[var(--accent)]">
              开始阅读
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </div>
        </div>
      </Link>
    </m.article>
  )
}
