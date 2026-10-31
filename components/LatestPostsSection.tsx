'use client'

import { EASE } from '@/lib/motion'
import { m } from 'framer-motion'
import { ArticleCard } from './ArticleCard'
import { PostMeta } from '@/types/post'

interface LatestPostsSectionProps {
  posts: PostMeta[]
}

/* 首页「最近文章」：三张条目卡，与上方《攒一架琴》横幅不重复。
   2026-10-25 前这里用 lg:col-span-2 lg:row-span-2 硬撑首卡，
   卡内却是固定比例海报，结果首卡巨大、右侧两张挤在一起、第四张孤零零挂左下角。 */
export function LatestPostsSection({ posts }: LatestPostsSectionProps) {
  return (
    <section id="latest" className="relative py-24 px-6">
      
      <div className="max-w-6xl mx-auto relative z-10">
        <m.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10"
        >
          <div className="w-full">
            <span className="flex items-center gap-3 kicker mb-4 text-[var(--ink-subtle)]">
              <span className="w-8 h-[2px] bg-[var(--accent)]" />
              Latest — {String(posts.length).padStart(2, '0')} ENTRIES
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.02em] text-[var(--ink)]">
              最近文章
            </h2>
          </div>
          <a
            href="/blog/"
            className="group shrink-0 text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors text-sm font-semibold border-b border-[var(--hairline)] pb-1 hover:border-[var(--accent)]"
          >
            查看全部 —— 进入档案库
          </a>
        </m.div>

        <div className="grid-rhythm">
          {posts.map((post, index) => (
            <ArticleCard key={post.slug} post={post} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
