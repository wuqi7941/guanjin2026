'use client'

import { useEffect, useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { isBookmarked, toggleBookmark } from '@/lib/reading'

interface BookmarkButtonProps {
  slug: string
  title: string
}

/* 收藏一枚：只存 slug，列表在 /bookmarks/ 读本地数据还原 */
export function BookmarkButton({ slug, title }: BookmarkButtonProps) {
  const [on, setOn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setOn(isBookmarked(slug))
    setMounted(true)
    const sync = () => setOn(isBookmarked(slug))
    window.addEventListener('embers-reading', sync)
    return () => window.removeEventListener('embers-reading', sync)
  }, [slug])

  return (
    <button
      type="button"
      onClick={() => setOn(toggleBookmark(slug))}
      aria-pressed={on}
      aria-label={on ? `取消收藏《${title}》` : `收藏《${title}》`}
      title={on ? '已收藏，点击取消' : '收藏这篇'}
      className={`bookmark-btn ${on ? 'is-on' : ''}`}
    >
      {on ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
      <span>{mounted && on ? '已收藏' : '收藏'}</span>
    </button>
  )
}
