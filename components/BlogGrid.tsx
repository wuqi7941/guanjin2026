'use client'

import { useState, useMemo, useEffect } from 'react'
import { m } from 'framer-motion'
import { ArticleCard } from './ArticleCard'
import { FeaturedCard } from './FeaturedCard'
import { TagFilter } from './TagFilter'
import { ResumeChip } from './ResumeChip'
import { PostCardData } from '@/types/post'
import type { TagCount } from '@/lib/posts'

interface BlogGridProps {
  posts: PostCardData[]
  tags: TagCount[]
}

const PAGE_SIZE = 12

/* 编辑排版：首篇作头条卡（杂志封面式导览），其余进入条目卡网格。
   2026-10-25：网格卡由固定 3/4 竖版换成内容驱动的条目卡，消除卡内死白。 */
export function BlogGrid({ posts, tags }: BlogGridProps) {
  const [activeTag, setActiveTag] = useState('全部')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const filteredPosts = useMemo(() => {
    if (activeTag === '全部') return posts
    return posts.filter((post) => post.tags.includes(activeTag))
  }, [activeTag, posts])

  /* 切换分区时重置分页 */
  useEffect(() => {
    setVisible(PAGE_SIZE)
  }, [activeTag])

  const shown = filteredPosts.slice(0, visible)
  const [lead, ...rest] = shown
  const hasMore = visible < filteredPosts.length

  return (
    <div>
      <ResumeChip posts={posts} />
      <TagFilter tags={tags} active={activeTag} onSelect={setActiveTag} />

      <m.div
        key={activeTag}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        {lead && <FeaturedCard post={lead} index={0} />}

        <div className="grid-rhythm">
          {rest.map((post, index) => (
            <ArticleCard key={post.slug} post={post} index={index + 1} />
          ))}
        </div>
      </m.div>

      {filteredPosts.length === 0 && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 text-[var(--ink-muted)]"
        >
          这个分区暂时没有展品。
        </m.div>
      )}

      {/* 分批展映：降低单页 DOM，滚动不卡 */}
      {hasMore && (
        <div className="mt-14 flex flex-col items-center gap-3">
          <span className="exhibit-meta">
            已展出 {String(shown.length).padStart(2, '0')} / {String(filteredPosts.length).padStart(2, '0')} 件
          </span>
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="btn-secondary px-8 py-3 text-sm font-semibold tracking-[0.2em]"
          >
            继续展出 ↓
          </button>
        </div>
      )}
    </div>
  )
}
