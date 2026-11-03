'use client'

/* 历史上的今天：如果今天（月-日）恰好是某篇旧文章发表的日子，首页亮出一条小签。
   客户端取当天日期（静态导出下构建日的日期会冻结，不能在服务端算）。 */
import Link from 'next/link'
import { useMemo } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { EASE } from '@/lib/motion'

interface AnniversaryStripProps {
  posts: Array<{ slug: string; title: string; date: string }>
}

export function AnniversaryStrip({ posts }: AnniversaryStripProps) {
  const reduce = !!useReducedMotion()

  const hits = useMemo(() => {
    const now = new Date()
    const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const year = now.getFullYear()
    return posts
      .filter((p) => {
        /* 月日匹配，且必须是往年（今年今天发的算是新文，不算纪念） */
        return p.date.endsWith(`-${mmdd}`) && Number(p.date.slice(0, 4)) < year
      })
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 2)
  }, [posts])

  if (hits.length === 0) return null

  return (
    <m.div
      initial={reduce ? undefined : { opacity: 0, y: 12 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
      className="mb-10 px-5 py-4 rounded-2xl card-static flex flex-wrap items-baseline gap-x-4 gap-y-1"
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
