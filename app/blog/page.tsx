import { Navbar } from '@/components/Navbar'
import { BlogGrid } from '@/components/BlogGrid'
import { Footer } from '@/components/Footer'
import { AuroraBackground } from '@/components/AuroraBackground'
import { DrawLot } from '@/components/DrawLot'
import Link from 'next/link'
import { getAllPosts, getTagCounts, getArchiveStats, toCard } from '@/lib/posts'

export const metadata = {
  title: '文章 — 余烬 EMBERS',
  description: '浏览观烬的全部文章：技术、日记、随笔、小说、诗，还有深夜的思绪。',
  alternates: { canonical: '/blog/' },
}

export default function BlogPage() {
  const posts = getAllPosts().map(toCard)
  const tags = getTagCounts()
  const stats = getArchiveStats()
  const words = (stats.chars / 10000).toFixed(1)
  const updated = stats.latest.replace(/-/g, '.')

  return (
    <main id="main-content" className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />

      <section className="relative pt-28 md:pt-32 pb-20 px-6 overflow-hidden">
        <span className="poster-number" aria-hidden>N°002</span>
        <div className="max-w-6xl mx-auto relative z-10">
          {/* 刊头：左文件名，右统计（更像刊物的版权页抬头） */}
          <div className="mb-9">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5">
              <span className="w-8 h-[2px] bg-[var(--accent)]" />
              <span className="kicker">Exhibition · 作品档案</span>
              <span className="hidden sm:block flex-1 h-px bg-[var(--hairline)]" aria-hidden />
              <span className="exhibit-meta tabular-nums">
                {String(posts.length).padStart(2, '0')} 件 · {words} 万字 · 更新至 {updated}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em] text-[var(--ink)] mb-4">
              作品展馆
            </h1>
            <p className="text-lg text-[var(--ink-muted)] max-w-2xl mb-6">
              火灭了，但还有温度。每一件展品都是一段余烬。按分区浏览，或随意漫步。
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <DrawLot slugs={posts.map((p) => p.slug)} />
              <Link
                href="/timeline/"
                className="section-link"
              >
                火的年轮 →
              </Link>
              <Link
                href="/tags/"
                className="section-link"
              >
                标签星图 →
              </Link>
            </div>
          </div>

          <BlogGrid posts={posts} tags={tags} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
