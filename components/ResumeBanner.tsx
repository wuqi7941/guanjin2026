'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { getResume } from '@/lib/reading'

interface Props {
  /* slug → 标题，服务端传进来，避免客户端再拉一遍文章库 */
  titles: Record<string, string>
}

/* 「继续阅读」：回访的人不必重新找上次读到哪。
   只在本地有未读完的进度时出现，读完（>95%）就当它不存在。 */
export function ResumeBanner({ titles }: Props) {
  const [resume, setResume] = useState<{ slug: string; p: number } | null>(null)

  useEffect(() => {
    const r = getResume()
    if (r && r.p > 0.03 && r.p < 0.95 && titles[r.slug]) setResume(r)
  }, [titles])

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
