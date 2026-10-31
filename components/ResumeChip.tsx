'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getResume } from '@/lib/reading'
import type { PostCardData } from '@/types/post'

/* 继续阅读：本地有「读了一半」的文章时，列表页顶部浮一枚书签 */
export function ResumeChip({ posts }: { posts: PostCardData[] }) {
  const [resume, setResume] = useState<{ slug: string; p: number } | null>(null)

  useEffect(() => {
    const sync = () => setResume(getResume())
    sync()
    window.addEventListener('embers-reading', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('embers-reading', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  if (!resume) return null
  const post = posts.find((p) => p.slug === resume.slug)
  if (!post) return null

  return (
    <Link href={`/blog/${post.slug}/`} className="resume-chip">
      <span className="resume-chip-label">继续阅读</span>
      <span className="resume-chip-title">{post.title}</span>
      <span className="resume-chip-bar" aria-hidden>
        <span style={{ width: `${Math.round(resume.p * 100)}%` }} />
      </span>
      <span className="resume-chip-pct">{Math.round(resume.p * 100)}%</span>
    </Link>
  )
}
