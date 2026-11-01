import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AuroraBackground } from '@/components/AuroraBackground'
import { BookmarksClient } from '@/components/BookmarksClient'
import { getAllPosts, toCard } from '@/lib/posts'

export const metadata = {
  title: '收藏夹 — 余烬 EMBERS',
  description: '你在这台设备上收藏过的文章。存在本地，不上传。',
  alternates: { canonical: '/bookmarks/' },
}

export default function BookmarksPage() {
  const posts = getAllPosts().map(toCard)

  return (
    <main id="main-content" className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />

      <section className="relative pt-28 md:pt-32 pb-24 px-6 overflow-hidden">
        <span className="poster-number" aria-hidden>N°008</span>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-5">
              <span className="w-8 h-[2px] bg-[var(--accent)]" />
              <span className="kicker">Collection · 本地</span>
              <span className="hidden sm:block flex-1 h-px bg-[var(--hairline)]" aria-hidden />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em] text-[var(--ink)] mb-4">
              收藏夹
            </h1>
            <p className="text-lg text-[var(--ink-muted)] max-w-2xl">
              存在这台设备上，不上传。换浏览器或清缓存会丢，重要的话还是记在纸上。
            </p>
          </div>

          <BookmarksClient all={posts} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
