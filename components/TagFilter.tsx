'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import type { TagCount } from '@/lib/posts'

interface TagFilterProps {
  tags: TagCount[]
  active: string
  onSelect: (tag: string) => void
}

/* 分区栏：默认只铺 12 个高频分区（此前 31 个平铺，第 11 个被右缘切半个字），
   其余收进「更多分区」。桌面换行排布，手机仍是单行横滑。 */
const DEFAULT_LIMIT = 12

export function TagFilter({ tags, active, onSelect }: TagFilterProps) {
  const [expanded, setExpanded] = useState(false)

  const limit = expanded ? tags.length : DEFAULT_LIMIT
  const base = tags.slice(0, Math.max(limit, 1))
  const activeTag = tags.find((t) => t.name === active)
  const list =
    activeTag && !base.some((t) => t.name === activeTag.name) ? [...base, activeTag] : base
  const hiddenCount = tags.length - base.length

  const options: Array<TagCount & { total?: boolean }> = [
    { name: '全部', count: 0, total: true },
    ...list,
  ]

  return (
    <div className="mb-9">
      <div className="exhibit-meta flex items-center gap-3 mb-4">
        <span className="w-8 h-[2px] bg-[var(--accent)]" />
        <span>GALLERY SECTIONS · 分区</span>
        <span className="ink-line flex-1" aria-hidden />
        <span className="shrink-0 tabular-nums">{tags.length} 区</span>
      </div>

      <div className="tag-scroller">
        {options.map((tag, i) => {
          const selected = active === tag.name
          return (
            <m.button
              key={tag.name}
              onClick={() => onSelect(tag.name)}
              whileTap={{ scale: 0.97 }}
              aria-pressed={selected}
              /* 目录的厚度：分区越厚（篇数越多），底边那条线越粗。
                 只给厚度，颜色深浅交给 CSS 按主题给（暗色下要压暗）。 */
              style={
                tag.total || selected
                  ? undefined
                  : ({
                      '--tier': `${Math.min(4, Math.max(1, Math.round(tag.count / 22)))}px`,
                    } as React.CSSProperties)
              }
              className={`shrink-0 relative px-4 py-2.5 min-h-11 sm:py-2 sm:min-h-0 text-sm transition-all duration-300 border ${
                selected
                  ? 'text-white border-[var(--accent)] bg-[var(--accent)]'
                  : 'text-[var(--ink-subtle)] border-transparent bg-transparent hover:text-[var(--ink)] hover:bg-[var(--surface-1)] hover:border-[var(--hairline)]'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className={`font-mono text-[10px] ${selected ? 'text-white/80' : 'text-[var(--accent)]'}`}>
                  {tag.total ? '00' : String(i).padStart(2, '0')}
                </span>
                {tag.name}
                {!tag.total && (
                  <span
                    className={`font-mono text-[10px] tabular-nums ${
                      selected ? 'text-white/70' : 'text-[var(--ink-tertiary)]'
                    }`}
                  >
                    {tag.count}
                  </span>
                )}
              </span>
            </m.button>
          )
        })}

        {tags.length > DEFAULT_LIMIT && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 px-3 py-2.5 min-h-11 sm:py-2 sm:min-h-0 text-sm text-[var(--ink-tertiary)] hover:text-[var(--accent)] transition-colors duration-300"
            aria-expanded={expanded}
          >
            {expanded ? '收起 −' : `更多分区 +${hiddenCount}`}
          </button>
        )}
      </div>
    </div>
  )
}
