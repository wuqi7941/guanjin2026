'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Line {
  text: string
  slug: string
  title: string
  date: string
}

let cache: Line[] | null = null

/* 每日一句：按本地日期取一条，同一天刷新不变，第二天自动换。
   句子表 20KB 左右，进首页才拉，拉过一次就驻留内存。
   words：全站字数（构建期算好传进来），显示成"今夜可读 X 万字"。 */
export function DailyLine({ words }: { words?: string }) {
  const [line, setLine] = useState<Line | null>(null)
  const [day, setDay] = useState('')

  useEffect(() => {
    const load = cache
      ? Promise.resolve(cache)
      : fetch('/daily-lines.json')
          .then((r) => r.json())
          .then((list: Line[]) => {
            cache = list
            return list
          })

    load
      .then((list) => {
        if (!list.length) return
        const now = new Date()
        const stamp = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000)
        setLine(list[stamp % list.length])
        setDay(`${now.getMonth() + 1} 月 ${now.getDate()} 日`)
      })
      .catch(() => {})
  }, [])

  if (!line) {
    /* 首帧留出等高的位置，避免加载完后页面跳动 */
    return <section className="daily-band" aria-hidden style={{ minHeight: '11rem' }} />
  }

  return (
    <section className="daily-band">
      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="daily-meta">
          <span className="w-8 h-[2px] bg-[var(--accent)]" />
          <span>每日一句 · {day}</span>
          {words && <span className="daily-words">今夜可读 {words} 万字</span>}
          <span className="flex-1 h-px bg-[var(--hairline)]" aria-hidden />
          <Link href={`/blog/${line.slug}/`} className="daily-source">
            出自《{line.title}》
          </Link>
        </div>

        <p className="daily-text">
          <span className="daily-quote" aria-hidden>
            「
          </span>
          {line.text.replace(/[。]$/, '')}
          <span className="daily-quote" aria-hidden>
            」
          </span>
        </p>
      </div>
    </section>
  )
}
