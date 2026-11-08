'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { SeasonalWhisper } from './SeasonalWhisper'
import { collectEgg } from '@/lib/eggs'

export function Footer() {
  /* 年份也别在渲染期取：静态导出会把构建年份写死，跨年 hydrate 不一致 */
  const [currentYear, setCurrentYear] = useState<number | null>(null)
  useEffect(() => setCurrentYear(new Date().getFullYear()), [])

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
              /* 年轮 / 星图 / 收藏夹在导航的「文章」下拉里已有，页脚不重复堆入口 */
              { href: '/', label: '首页', idx: '01' },
              { href: '/blog/', label: '文章', idx: '02' },
              { href: '/about/', label: '关于', idx: '03' },
              { href: '/contact/', label: '联系', idx: '04' },
              { href: '/feed.xml', label: '订阅 RSS', idx: '05' },
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

      </div>
    </footer>
  )
}
