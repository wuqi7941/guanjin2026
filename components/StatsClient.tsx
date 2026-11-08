'use client'

import { useEffect, useMemo, useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { EASE } from '@/lib/motion'

interface Stats {
  total: number
  today: number
  /* 按「同一天 + 同一 IP 哈希」去重后的累计人数 */
  unique: number
  days: Array<{ day: string; n: number }>
  recent: Array<{ ts: number; path: string }>
}

/* 北京时间的日历日（UTC+8），与 Functions 里的 beijingDay 同一套口径 */
function bjDay(ts: number): string {
  return new Date(ts + 8 * 3600 * 1000).toISOString().slice(0, 10)
}

function clock(ts: number): string {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}.${p(d.getDate())}  ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function StatsClient() {
  const reduce = !!useReducedMotion()
  const [data, setData] = useState<Stats | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/visit', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('bad response')
        return r.json()
      })
      .then((d: Stats) => {
        if (!cancelled) setData(d)
      })
      .catch(() => {
        if (!cancelled) setErr('暂时读不出来，稍后再看。')
      })
    return () => {
      cancelled = true
    }
  }, [])

  /* 近 14 天，缺的天补 0，柱状才不会歪 */
  const bars = useMemo(() => {
    const map = new Map((data?.days ?? []).map((d) => [d.day, d.n]))
    const now = Date.now()
    return Array.from({ length: 14 }, (_, i) => {
      const day = bjDay(now - (13 - i) * 86400000)
      return { day, n: map.get(day) ?? 0 }
    })
  }, [data])

  const max = Math.max(1, ...bars.map((b) => b.n))
  const week = bars.slice(-7).reduce((s, b) => s + b.n, 0)
  const n = (v: number | undefined) => (v === undefined ? '—' : v.toLocaleString('zh-CN'))

  return (
    <div className="flex flex-col gap-10">
      {/* 两个主框：3:2 非对称，今日次数 / 来过的人分开算 */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div className="sm:col-span-3 card-static rounded-[var(--radius-md)] p-6 sm:p-8 min-h-[13rem] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-[2px] bg-[var(--accent)]" aria-hidden />
            <span className="text-[10px] font-mono tracking-[0.22em] text-[var(--ink-tertiary)]">
              今日 · OPENED TODAY
            </span>
          </div>
          <div>
            <p className="font-display font-semibold tabular-nums text-6xl sm:text-7xl leading-none text-[var(--ink)] tracking-tight">
              {n(data?.today)}
            </p>
            <p className="mt-4 text-xs sm:text-[13px] leading-relaxed text-[var(--ink-subtle)]">
              今天，这个站被打开的次数
            </p>
          </div>
        </div>

        <div className="sm:col-span-2 card-static rounded-[var(--radius-md)] p-6 sm:p-8 min-h-[13rem] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-[2px] bg-[var(--accent)]" aria-hidden />
            <span className="text-[10px] font-mono tracking-[0.22em] text-[var(--ink-tertiary)]">
              来过的人 · VISITORS
            </span>
          </div>
          <div>
            <p className="font-display font-semibold tabular-nums text-6xl sm:text-7xl leading-none text-[var(--accent)] tracking-tight">
              {n(data?.unique)}
            </p>
            <p className="mt-4 text-xs sm:text-[13px] leading-relaxed text-[var(--ink-subtle)]">
              同一个 IP，一天里进出多次只算一次
            </p>
          </div>
        </div>
      </div>

      {/* 副信息：一条细线把「累计」和主框分开，不再抢视觉 */}
      <div className="flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-[var(--hairline)] pt-5 text-xs font-mono text-[var(--ink-subtle)]">
        <span>
          累计打开 <span className="tabular-nums text-[var(--ink)]">{n(data?.total)}</span>
        </span>
        <span>
          近七日 <span className="tabular-nums text-[var(--ink)]">{data ? week : '—'}</span>
        </span>
        <span className="text-[var(--ink-tertiary)]">一笔，就是一次点进来</span>
        {err && (
          <span className="text-[var(--accent)]" role="alert">
            {err}
          </span>
        )}
      </div>

      <div className="card-static rounded-[var(--radius-md)] p-5 sm:p-7">
        <p className="text-[10px] font-mono tracking-[0.22em] text-[var(--ink-tertiary)] mb-6">
          近十四日 · DAILY
        </p>
        <div
          className="flex items-end gap-1.5 h-32 border-b border-[var(--hairline)] pb-px"
          role="img"
          aria-label="近十四日每日打开次数柱状图"
        >
          {bars.map((b, i) => (
            <m.div
              key={b.day}
              className="flex-1 min-w-0 rounded-t-[2px]"
              initial={reduce ? undefined : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? undefined : { duration: 0.4, delay: i * 0.025, ease: EASE }}
              style={{
                height: `${Math.max(3, (b.n / max) * 100)}%`,
                background: b.n > 0 ? 'var(--accent)' : 'var(--hairline-strong)',
                opacity: b.n > 0 ? 0.85 : 0.6,
              }}
              title={`${b.day} · ${b.n} 次`}
            />
          ))}
        </div>
        <div className="mt-3 flex justify-between text-[10px] font-mono text-[var(--ink-tertiary)] tabular-nums">
          <span>{bars[0].day.replace(/-/g, '.')}</span>
          <span className="hidden sm:inline">{bars[7].day.replace(/-/g, '.')}</span>
          <span>{bars[13].day.replace(/-/g, '.')}</span>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-mono tracking-[0.22em] text-[var(--ink-tertiary)] mb-4">
          最近留下的脚印 · RECENT
        </p>
        {data && data.recent.length === 0 ? (
          <p className="text-sm text-[var(--ink-subtle)]">还没有人来过。你是第一个。</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
            {(data?.recent ?? []).map((r) => (
              <li
                key={r.ts + r.path}
                className="flex items-baseline justify-between gap-3 border-b border-dashed border-[var(--hairline)] pb-2 min-w-0"
              >
                <span className="text-xs font-mono text-[var(--ink-muted)] truncate">{r.path}</span>
                <span className="flex-none text-[10px] font-mono text-[var(--ink-tertiary)] tabular-nums">
                  {clock(r.ts)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs leading-relaxed text-[var(--ink-tertiary)] max-w-[56ch]">
        这里只记时间和来过的页面。不记 IP、不记设备、不记是谁——有人来过，就够了。
      </p>
    </div>
  )
}
