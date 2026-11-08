import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { NovelBanner } from '@/components/NovelBanner'
import { LatestPostsSection } from '@/components/LatestPostsSection'
import { ResumeBanner } from '@/components/ResumeBanner'
import { Footer } from '@/components/Footer'
import { AuroraBackground } from '@/components/AuroraBackground'
import Link from 'next/link'
import { getAllPosts, getFeaturedPosts, getPostBySlug, getLatestPost } from '@/lib/posts'

/* 首页自己的 metadata：标题与描述继承 layout，但 canonical 必须每页单独声明。
   不能放 layout——Metadata 的 alternates 会向下继承，把所有子页的 canonical 压成首页。 */
export const metadata = {
  alternates: { canonical: '/' },
}

export default function Home() {
  const all = getAllPosts()
  /* 212 条轻量元数据只构造一次，同一个引用传给 ResumeBanner：
     RSC flight 对同一引用去重，不再把整份库序列化两遍进 HTML。 */
  const lite = all.map((p) => ({ slug: p.slug, title: p.title, date: p.date }))
  /* 《攒一架琴》由下方 NovelBanner 单独占一条横幅，首页目录里不重复 */
  const latestPosts = getFeaturedPosts(3)
  const novel = getPostBySlug('novel-01')
  const latest = getLatestPost('novel-01')

  return (
    <main id="main-content" className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />
      <Hero />

      {/* 一、上次没读完的，接着读（没有进度时自己不占位） */}
      <ResumeBanner items={lite} />

      {/* 二、最新一篇：一眼知道今天有没有新东西 */}
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

      {/* 三、小说横幅 */}
      {novel && <NovelBanner post={novel} />}

      {/* 四、最近三篇 */}
      <LatestPostsSection posts={latestPosts} />
      <Footer />
    </main>
  )
}
