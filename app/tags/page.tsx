import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AuroraBackground } from '@/components/AuroraBackground'
import { TagMap } from '@/components/TagMap'
import { getTagMap } from '@/lib/tagmap'
import { getAllPosts } from '@/lib/posts'

export const metadata = {
  title: '标签星图 — 余烬 EMBERS',
  description: '31 个分区在同一篇里碰到过就连一条线。悬停看关系，点一个分区看它的文章。',
}

export default function TagsPage() {
  const { nodes, edges } = getTagMap()

  const postsByTag: Record<string, { slug: string; title: string; date: string }[]> = {}
  for (const post of getAllPosts()) {
    for (const tag of post.tags ?? []) {
      if (!postsByTag[tag]) postsByTag[tag] = []
      postsByTag[tag].push({ slug: post.slug, title: post.title, date: post.date })
    }
  }

  return (
    <main id="main-content" className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />

      <section className="relative pt-28 md:pt-32 pb-24 px-6 overflow-hidden">
        <span className="poster-number" aria-hidden>N°014</span>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-5">
              <span className="w-8 h-[2px] bg-[var(--accent)]" />
              <span className="kicker">Constellation · 标签星图</span>
              <span className="hidden sm:block flex-1 h-px bg-[var(--hairline)]" aria-hidden />
              <span className="exhibit-meta tabular-nums">{nodes.length} 个分区</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em] text-[var(--ink)] mb-4">
              标签星图
            </h1>
            <p className="text-lg text-[var(--ink-muted)] max-w-2xl">
              每一个点是一个分区，越靠里写得越多。两个分区在同一篇里碰到过，就连一条线——碰得越勤，线越亮。
            </p>
          </div>

          <TagMap nodes={nodes} edges={edges} postsByTag={postsByTag} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
