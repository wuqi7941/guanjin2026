'use client'

import { EASE } from '@/lib/motion'
import { m } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PostMeta } from '@/types/post'

interface NovelBannerProps {
  post: PostMeta
}

/* 首页大横幅：《攒一架琴》——整块 violet 色域海报（连续海报流动的 N°002） */
export function NovelBanner({ post }: NovelBannerProps) {
  return (
    <section className="relative px-4 sm:px-6 py-6">
      <m.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className="poster-block violet paper-stack relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--hairline)]"
      >
        

        <div className="relative z-10 p-8 sm:p-14 lg:p-16">
          <div className="max-w-2xl">
            <span className="flex items-center gap-3 kicker mb-5 text-[var(--ink-muted)]">
              <span className="w-8 h-[2px] bg-[var(--accent)]" />
              Novel · 长篇小说
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-[-0.03em] text-[var(--ink)] leading-[1.05] mb-6">
              《{post.title}》
            </h2>
            <p className="text-[var(--ink-muted)] max-w-xl leading-relaxed mb-7 text-base sm:text-lg">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-3 exhibit-meta mb-9 text-[var(--ink-subtle)]">
              <span>小说 · 音乐</span>
              <span className="w-1 h-1 rounded-full bg-[var(--ink-tertiary)]" />
              {post.wordCount && <span>{post.wordCount}</span>}
              <span className="w-1 h-1 rounded-full bg-[var(--ink-tertiary)]" />
              <span>{post.readingTime}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href={`/blog/${post.slug}/`}
                className="group inline-flex items-center gap-2 border border-[var(--accent)] text-[var(--accent)] px-8 py-3.5 text-[15px] font-semibold rounded-[var(--radius-md)] hover:bg-[var(--accent)] hover:text-[var(--surface-1)] transition-colors"
              >
                开始阅读
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/blog/"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-[15px] font-medium text-[var(--ink)] border border-[var(--hairline-strong)] rounded-[var(--radius-md)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                浏览全部文章
              </Link>
            </div>
          </div>
        </div>
      </m.div>
    </section>
  )
}