'use client'

import { useEffect, useMemo, useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { EASE } from '@/lib/motion'

interface Stats {
  total: number
  today: number
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

  return (
    <div className="flex flex-col gap-8">
      <div className="card-static rounded-[var(--radius-md)] p-6 sm:p-8">
        <p className="text-[10px] font-mono tracking-[0.22em] text-[var(--ink-tertiary)] mb-4">
          累计 · TOTAL VISITS
        </p>
        <p className="font-display font-semibold text-[var(--ink)] leading-none tabular-nums text-6xl sm:text-8xl tracking-tight">
          {data ? data.total.toLocaleString('zh-CN') : '—'}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-[var(--ink-subtle)]">
          <span>
            今日 <span className="text-[var(--accent)] tabular-nums">{data ? data.today : '—'}</span>
          </span>
          <span>
            近七日 <span className="tabular-nums">{data ? week : '—'}</span>
          </span>
          <span className="text-[var(--ink-tertiary)]">一笔，就是一次点进来</span>
        </div>
        {err && (
          <p className="mt-5 text-xs text-[var(--accent)]" role="alert">
            {err}
          </p>
        )}
      </div>

      <div className="card-static rounded-[var(--radius-md)] p-5 sm:p-7">
        <p className="text-[10px] font-mono tracking-[0.22em] text-[var(--ink-tertiary)] mb-6">
          近十四日 · DAILY
        </p>
        <div className="flex items-end gap-1.5 h-32" role="img" aria-label="近十四日每日访问量柱状图">
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
              <li key={r.ts + r.path} className="flex items-baseline justify-between gap-3 border-b border-dashed border-[var(--hairline)] pb-2">
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
