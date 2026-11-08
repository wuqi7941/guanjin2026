'use client'

/* 历史上的今天：如果今天（月-日）恰好是某篇旧文章发表的日子，首页亮出一条小签。
   客户端取当天日期（静态导出下构建日的日期会冻结，不能在服务端算）。 */
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { EASE } from '@/lib/motion'

interface AnniversaryStripProps {
  posts: Array<{ slug: string; title: string; date: string }>
}

export function AnniversaryStrip({ posts }: AnniversaryStripProps) {
  const reduce = !!useReducedMotion()

  /* 静态导出也会预渲染客户端组件：渲染期读 new Date() 会把「构建那天」写死进 HTML，
     隔天 hydrate 就会对不上。日期一律挂载后再取，首帧两边都渲染空。 */
  const [today, setToday] = useState<{ mmdd: string; year: number } | null>(null)
  useEffect(() => {
    const now = new Date()
    setToday({
      mmdd: `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
      year: now.getFullYear(),
    })
  }, [])

  const hits = useMemo(() => {
    if (!today) return []
    const { mmdd, year } = today
    return posts
      .filter((p) => {
        /* 月日匹配，且必须是往年（今年今天发的算是新文，不算纪念） */
        return p.date.endsWith(`-${mmdd}`) && Number(p.date.slice(0, 4)) < year
      })
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 2)
  }, [posts, today])

  if (hits.length === 0) return null

  return (
    <m.div
      initial={reduce ? undefined : { opacity: 0, y: 12 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
      className="mb-10 px-5 py-4 rounded-[var(--radius-md)] card-static flex flex-wrap items-baseline gap-x-4 gap-y-1"
    >
      <span className="text-[10px] font-mono tracking-[0.2em] text-[var(--accent)]">ON THIS DAY</span>
      {hits.map((p) => (
        <Link
          key={p.slug}
          href={`/blog/${p.slug}/`}
          className="group text-sm text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors"
        >
          <span className="font-mono text-xs text-[var(--ink-tertiary)]">{p.date.slice(0, 4)} 年的今天</span>
          <span className="mx-2 text-[var(--hairline-strong)]">·</span>
          <span className="group-hover:underline underline-offset-4 decoration-[var(--hairline-strong)]">
            {p.title}
          </span>
        </Link>
      ))}
    </m.div>
  )
}
