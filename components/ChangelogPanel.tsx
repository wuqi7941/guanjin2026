'use client'

import { useEffect, useMemo, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { ArrowDown, Check } from 'lucide-react'
import { CHANGELOG, CHANGELOG_VERSION } from '@/lib/changelog'
import { EASE } from '@/lib/motion'

const SEEN_KEY = 'embers_changelog_seen'
const COLLAPSED_COUNT = 4

/* 更新记录：关于页里的时间轴 + 首次来访的一次性提示。
   提示只出现一次（点「知道了」或「看更新记录」即写入缓存），
   之后设备上不再主动出现；记录本身始终留在这个页面里。 */
export function ChangelogPanel() {
  const [mounted, setMounted] = useState(false)
  const [firstTime, setFirstTime] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    let seen = ''
    try {
      seen = localStorage.getItem(SEEN_KEY) ?? ''
    } catch {
      /* 隐私模式：当作没看过，但不写缓存 */
    }
    setFirstTime(!seen)
    setExpanded(!seen)
    setMounted(true)
  }, [])

  const dismiss = () => {
    setFirstTime(false)
    try {
      localStorage.setItem(SEEN_KEY, CHANGELOG_VERSION)
    } catch {
      /* ignore */
    }
  }

  const jumpTo = () => {
    dismiss()
    document.getElementById('changelog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const list = useMemo(
    () => (expanded ? CHANGELOG : CHANGELOG.slice(0, COLLAPSED_COUNT)),
    [expanded],
  )

  return (
    <>
      {/* 一次性提示：浮在左下角，滚不滚都能看见；点一次就记住 */}
      <AnimatePresence>
        {mounted && firstTime && (
          <m.aside
            className="changelog-toast"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.5, ease: EASE }}
            role="status"
          >
            <span className="changelog-toast-mark" aria-hidden>
              新
            </span>
            <div className="changelog-toast-body">
              <p className="changelog-toast-title">这个站改过 {CHANGELOG.length} 次</p>
              <p className="changelog-toast-sub">
                最近一次：{CHANGELOG[0].title}。这条提示只出现这一次。
              </p>
              <div className="changelog-toast-actions">
                <button type="button" onClick={jumpTo} className="changelog-toast-primary">
                  <ArrowDown className="w-3.5 h-3.5" aria-hidden />
                  看更新记录
                </button>
                <button type="button" onClick={dismiss} className="changelog-toast-ghost">
                  知道了
                </button>
              </div>
            </div>
          </m.aside>
        )}
      </AnimatePresence>

      <section id="changelog" className="relative pt-4 scroll-mt-24">
        <div className="flex items-center gap-4 mb-4">
          <span className="w-8 h-[2px] bg-[var(--accent)]" />
          <span className="kicker">Changelog · 更新记录</span>
          <span className="hidden sm:block flex-1 h-px bg-[var(--hairline)]" aria-hidden />
          <span className="exhibit-meta tabular-nums">{CHANGELOG.length} 次</span>
        </div>

        <p className="changelog-intro">
          只记看得见的变化。最新一次：<strong>{CHANGELOG[0].title}</strong>（
          {CHANGELOG[0].date.replace(/-/g, '.')}）。
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

        {CHANGELOG.length > COLLAPSED_COUNT && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="changelog-more"
            aria-expanded={expanded}
          >
            {expanded ? '收起 −' : `看更早的 ${CHANGELOG.length - COLLAPSED_COUNT} 次更新 +`}
          </button>
        )}
      </section>
    </>
  )
}
