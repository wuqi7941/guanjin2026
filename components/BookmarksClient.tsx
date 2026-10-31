'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookmarkX } from 'lucide-react'
import { clearBookmarks, getBookmarks } from '@/lib/reading'
import { ReadMap } from './ReadMap'
import type { PostCardData } from '@/types/post'

/* 收藏夹：本地 slug 列表 → 与构建时的文章元数据对照还原 */
export function BookmarksClient({ all }: { all: PostCardData[] }) {
  const [slugs, setSlugs] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const sync = () => setSlugs(getBookmarks())
    sync()
    setMounted(true)
    window.addEventListener('embers-reading', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('embers-reading', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const bySlug = new Map(all.map((p) => [p.slug, p]))
  const items = slugs.map((s) => bySlug.get(s)).filter(Boolean) as PostCardData[]

  if (!mounted) {
    return <p className="text-sm text-[var(--ink-tertiary)] py-16 text-center">读取本地收藏…</p>
  }

  if (items.length === 0) {
    return (
      <div>
        <div className="py-16 text-center">
          <p className="text-[var(--ink-muted)] mb-3">还没有收藏。</p>
          <p className="text-sm text-[var(--ink-tertiary)] mb-6">在文章页标题下方点「收藏」，就会出现在这里。</p>
          <Link href="/blog/" className="btn-secondary inline-block px-7 py-3 text-sm font-semibold tracking-[0.16em]">
            去档案库逛逛
          </Link>
        </div>
        <ReadMap all={all} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="exhibit-meta tabular-nums">{items.length} 篇</span>
        <button
          type="button"
          onClick={() => {
            clearBookmarks()
            setSlugs([])
          }}
          className="inline-flex items-center gap-1.5 text-xs font-mono tracking-[0.14em] text-[var(--ink-tertiary)] hover:text-[var(--accent)] transition-colors"
        >
          <BookmarkX className="w-3.5 h-3.5" />
          清空收藏
        </button>
      </div>

      <ul className="divide-y divide-[var(--hairline)] border-t border-[var(--hairline)]">
        {items.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}/`}
              className="group flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 py-4"
            >
              <span className="shrink-0 font-mono text-[11px] tracking-[0.14em] text-[var(--ink-tertiary)] tabular-nums sm:w-24">
                {post.date.replace(/-/g, '.')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg leading-snug text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                  {post.title}
                </span>
                <span className="mt-1 block text-[13px] leading-relaxed text-[var(--ink-muted)] line-clamp-1">
                  {post.excerpt}
                </span>
              </span>
              <span className="shrink-0 font-mono text-[11px] tracking-[0.14em] text-[var(--ink-subtle)]">
                {post.tags[0] ?? '随笔'} · {post.readingTime}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <ReadMap all={all} />
    </div>
  )
}
