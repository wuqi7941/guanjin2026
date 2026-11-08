'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { getResume } from '@/lib/reading'

interface Props {
  /* 与 AnniversaryStrip 共用同一份轻量数据（同一个引用，RSC 只序列化一次） */
  items: Array<{ slug: string; title: string }>
}

/* 「继续阅读」：回访的人不必重新找上次读到哪。
   阈值只在 getResume 里定义一次，这里只判断「有这篇的标题」。
   首帧占一条同高的位置，水合后插入不会再顶动下面的内容。 */
export function ResumeBanner({ items }: Props) {
  const titles = useMemo(() => Object.fromEntries(items.map((i) => [i.slug, i.title])), [items])
  const [mounted, setMounted] = useState(false)
  const [resume, setResume] = useState<{ slug: string; p: number } | null>(null)

  useEffect(() => {
    const r = getResume()
    if (r && titles[r.slug]) setResume(r)
    setMounted(true)
  }, [titles])

  if (!mounted) return <div className="resume-hold" aria-hidden />

  if (!resume) return null

  const pct = Math.round(resume.p * 100)

  return (
    <Link href={`/blog/${resume.slug}/`} className="resume-strip">
      <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden />
      <span className="resume-strip-label">继续阅读</span>
      <span className="resume-strip-title">{titles[resume.slug]}</span>
      <span className="resume-strip-bar" aria-hidden>
        <span style={{ width: `${pct}%` }} />
      </span>
      <span className="resume-strip-pct tabular-nums">{pct}%</span>
    </Link>
  )
}
