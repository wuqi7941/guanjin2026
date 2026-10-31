'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { PostCardData } from '@/types/post'

const PROGRESS_KEY = 'embers_reading'

interface Entry {
  p: number
  t: number
}

/* 读过的地图：全站 211 篇排成一张方格纸，读过的格子被火点亮。
   高度就是读到多少——半格是读了一半。纯本地数据。 */
export function ReadMap({ all }: { all: PostCardData[] }) {
  const [read, setRead] = useState<Record<string, Entry>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem(PROGRESS_KEY)
        setRead(raw ? (JSON.parse(raw) as Record<string, Entry>) : {})
      } catch {
        setRead({})
      }
    }
    sync()
    setMounted(true)
    window.addEventListener('embers-reading', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('embers-reading', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const started = all.filter((p) => (read[p.slug]?.p ?? 0) > 0.02).length
  const finished = all.filter((p) => (read[p.slug]?.p ?? 0) > 0.92).length

  return (
    <section className="read-map" aria-label="读过的地图">
      <div className="read-map-head">
        <span className="exhibit-meta tabular-nums">
          读过的地图 · 开始 {mounted ? started : '--'} 篇 / 读完 {mounted ? finished : '--'} 篇 / 共 {all.length} 篇
        </span>
        <span className="read-map-legend">
          <i className="read-cell is-half" aria-hidden />
          一半
          <i className="read-cell is-read" aria-hidden />
          读完
        </span>
      </div>

      <div className="read-map-grid">
        {all.map((p) => {
          const ratio = read[p.slug]?.p ?? 0
          return (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}/`}
              title={`${p.title}${ratio > 0 ? ` · 读到 ${Math.round(ratio * 100)}%` : ''}`}
              className={`read-cell${ratio > 0.92 ? ' is-read' : ratio > 0.02 ? ' is-half' : ''}`}
              style={{ ['--r' as string]: Math.min(1, Math.max(0, ratio)).toFixed(2) }}
              aria-label={p.title}
            />
          )
        })}
      </div>
    </section>
  )
}
