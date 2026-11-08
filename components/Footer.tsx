'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { SeasonalWhisper } from './SeasonalWhisper'
import { EGGS, collectEgg, getCollectedEggs, type EggKey } from '@/lib/eggs'
import { EASE } from '@/lib/motion'

export function Footer() {
  /* 年份也别在渲染期取：静态导出会把构建年份写死，跨年 hydrate 不一致 */
  const [currentYear, setCurrentYear] = useState<number | null>(null)
  useEffect(() => setCurrentYear(new Date().getFullYear()), [])
  const [eggs, setEggs] = useState<EggKey[]>([])
  const [eggsOpen, setEggsOpen] = useState(false)

  /* 彩蛋「未冷」：连点那句 BURNED, STILL WARM. 三次 */
  const warmTaps = useRef(0)
  const warmTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const onWarmTap = () => {
    warmTaps.current += 1
    clearTimeout(warmTimer.current)
    warmTimer.current = setTimeout(() => {
      warmTaps.current = 0
    }, 1200)
    if (warmTaps.current >= 3) {
      clearTimeout(warmTimer.current)
      warmTaps.current = 0
      collectEgg('footer')
      window.dispatchEvent(new CustomEvent('embers-burst', { detail: 12 }))
    }
  }
  useEffect(() => () => clearTimeout(warmTimer.current), [])

  useEffect(() => {
    setEggs(getCollectedEggs())
    const onEgg = () => setEggs(getCollectedEggs())
    window.addEventListener('embers-egg', onEgg)
    return () => window.removeEventListener('embers-egg', onEgg)
  }, [])

  return (
    <footer className="relative py-14 px-6 overflow-hidden">
      <div className="ink-line absolute top-0 left-0 right-0" aria-hidden />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <Link href="/" className="font-display text-3xl font-bold tracking-[0.02em]">
              余烬 <span className="hero-ember">EMBERS</span>
            </Link>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              十六岁少年的数字花园 · 看着暗了，其实还在发热
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-2">
            {[
              { href: '/', label: '首页', idx: '01' },
              { href: '/blog/', label: '文章', idx: '02' },
              { href: '/about/', label: '关于', idx: '03' },
              { href: '/timeline/', label: '年轮', idx: '04' },
              { href: '/contact/', label: '联系', idx: '05' },
              { href: '/tags/', label: '星图', idx: '06' },
              { href: '/bookmarks/', label: '收藏夹', idx: '07' },
              { href: '/feed.xml', label: '订阅 RSS', idx: '08' },
            ].map((l) =>
              /* /feed.xml 是 route handler：用原生 <a>，避免 Link 对静态文件做 RSC 预取产生 404 */
              l.href === '/feed.xml' ? (
                <a
                  key={l.idx}
                  href={l.href}
                  className="group text-sm text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors"
                >
                  <span className="index-num mr-2">{l.idx}</span>
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.idx}
                  href={l.href}
                  className="group text-sm text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors"
                >
                  <span className="index-num mr-2">{l.idx}</span>
                  {l.label}
                </Link>
              )
            )}
          </div>
        </div>

        <div className="ink-line" aria-hidden />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-xs text-[var(--ink-tertiary)] font-mono tracking-widest">
            © {currentYear ?? ''} 观烬 GUANJIN — ALL RIGHTS RESERVED
          </p>
          <p
            onClick={onWarmTap}
            className="text-xs text-[var(--ink-tertiary)] font-mono tracking-widest cursor-default select-none"
          >
            BURNED, STILL WARM.
          </p>
        </div>

        <SeasonalWhisper />

        {/* 彩蛋收集册：发现过至少一枚暗语才浮现（纯本地，未集项给线索） */}
        {eggs.length > 0 && (
          <div className="mt-5 flex flex-col items-center gap-3 no-print">
            <button
              type="button"
              onClick={() => setEggsOpen((v) => !v)}
              aria-expanded={eggsOpen}
              className="text-[11px] font-mono tracking-[0.22em] text-[var(--ink-tertiary)] hover:text-[var(--accent)] transition-colors select-none"
            >
              暗语 · 已集 {eggs.length}/{EGGS.length} {eggsOpen ? '▴' : '▾'}
            </button>
            <AnimatePresence>
              {eggsOpen && (
                <m.ul
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2.5 text-left"
                >
                  {EGGS.map((e) => {
                    const got = eggs.includes(e.key)
                    return (
                      <li key={e.key} className="flex items-baseline gap-2 text-[11px] font-mono">
                        <span aria-hidden className={got ? 'text-[var(--accent)]' : 'text-[var(--ink-tertiary)]'}>
                          {got ? '●' : '○'}
                        </span>
                        <span className={got ? 'text-[var(--ink-muted)]' : 'text-[var(--ink-tertiary)]'}>
                          {got ? e.label : '？'}
                        </span>
                        {/* 不列触发线索：暗语是撞见的，不是照着说明书找的 */}
                      </li>
                    )
                  })}
                </m.ul>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </footer>
  )
}
