'use client'

import { useMemo, useState } from 'react'
import { m } from 'framer-motion'
import { CHANGELOG_BY_DAY } from '@/lib/changelog'
import { EASE } from '@/lib/motion'

const COLLAPSED_COUNT = 4

/* 更新记录：关于页里只留一条时间轴。
   原来左下角那个「有新变化」浮层带两颗按钮，一进站就抢视线——极简下撤掉，
   想看的人自然会翻到这一节。 */
export function ChangelogPanel() {
  const [expanded, setExpanded] = useState(false)
  const list = useMemo(
    () => (expanded ? CHANGELOG_BY_DAY : CHANGELOG_BY_DAY.slice(0, COLLAPSED_COUNT)),
    [expanded],
  )

  return (
    <section id="changelog" className="relative pt-4 scroll-mt-24">
      <div className="flex items-center gap-4 mb-4">
        <span className="w-8 h-[2px] bg-[var(--accent)]" aria-hidden />
        <span className="kicker">Changelog · 更新记录</span>
        <span className="hidden sm:block flex-1 h-px bg-[var(--hairline)]" aria-hidden />
        <span className="exhibit-meta tabular-nums">{CHANGELOG_BY_DAY.length} 天</span>
      </div>

      <p className="changelog-intro">
        只记看得见的变化。最新一次：<strong>{CHANGELOG_BY_DAY[0].title}</strong>（
        {CHANGELOG_BY_DAY[0].date.replace(/-/g, '.')}）。
      </p>

      <ol className="changelog-list">
        {list.map((entry, i) => (
          <m.li
            key={`${entry.date}-${entry.title}`}
            className="changelog-item"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: Math.min(i, 5) * 0.04, ease: EASE }}
          >
            <time className="changelog-date" dateTime={entry.date}>
              {entry.date.replace(/-/g, '.')}
            </time>
            <div className="changelog-body">
              <h3 className="changelog-title">
                {entry.title}
                {i === 0 && <span className="seal-mini changelog-new">最新</span>}
              </h3>
              <ul className="changelog-points">
                {entry.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          </m.li>
        ))}
      </ol>

      {CHANGELOG_BY_DAY.length > COLLAPSED_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="changelog-more"
          aria-expanded={expanded}
        >
          {expanded ? '收起 −' : `看更早的 ${CHANGELOG_BY_DAY.length - COLLAPSED_COUNT} 天的更新 +`}
        </button>
      )}
    </section>
  )
}
