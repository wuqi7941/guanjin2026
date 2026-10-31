import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { DailyLine } from '@/components/DailyLine'
import { NovelBanner } from '@/components/NovelBanner'
import { LatestPostsSection } from '@/components/LatestPostsSection'
import { ExhibitMarquee } from '@/components/ExhibitMarquee'
import { Footer } from '@/components/Footer'
import { AuroraBackground } from '@/components/AuroraBackground'
import Link from 'next/link'
import { getAllPosts, getFeaturedPosts, getPostBySlug, getArchiveStats } from '@/lib/posts'
import { getDailyLines } from '@/lib/lines'

export default function Home() {
  /* 《攒一架琴》在下方 NovelBanner 已单独占一条横幅，首页目录里不再重复 */
  const featuredPosts = getFeaturedPosts().filter((post) => post.slug !== 'novel-01')
  const novel = getPostBySlug('novel-01')
  const stats = getArchiveStats()
  const all = getAllPosts()
  const latest = all.find((p) => p.slug !== 'novel-01')

  /* 跑马灯：流的是正文里的句子，不是标题——下方卡片已经列了标题 */
  const quotes = getDailyLines()
    .slice(0, 12)
    .map((l) => ({ text: l.text, title: l.title, slug: l.slug }))

  return (
    <main id="main-content" className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />
      <Hero />

      {/* 最新一篇：一眼知道今天有没有新东西 */}
      {latest && (
        <Link href={`/blog/${latest.slug}/`} className="latest-strip">
          <span className="latest-strip-tag">最新</span>
          <span className="latest-strip-title">{latest.title}</span>
          <span className="latest-strip-date">{latest.date.replace(/-/g, '.')}</span>
          <span className="latest-strip-go" aria-hidden>
            →
          </span>
        </Link>
      )}

      <ExhibitMarquee items={quotes} />
      <DailyLine words={(stats.chars / 10000).toFixed(1)} />
      {novel && <NovelBanner post={novel} />}
      <LatestPostsSection posts={featuredPosts} />
      <Footer />
    </main>
  )
}
