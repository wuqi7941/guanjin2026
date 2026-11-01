import { notFound } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { PostContent } from '@/components/PostContent'
import { AuroraBackground } from '@/components/AuroraBackground'
import { SITE } from '@/lib/site'
import { getAllPosts, getPostBySlug } from '@/lib/posts'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug)
  if (!post) return { title: 'Not Found' }

  /* 每篇一张纸感分享卡（scripts/og_cards.py 生成到 public/og/） */
  const og = `/og/${post.slug}.png`

  return {
    title: `${post.title} — 余烬 EMBERS`,
    description: post.excerpt,
    alternates: {
      canonical: `${SITE.url}/blog/${post.slug}/`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE.url}/blog/${post.slug}/`,
      type: 'article',
      publishedTime: post.date,
      authors: [SITE.author],
      locale: 'zh_CN',
      siteName: SITE.name,
      images: [{ url: og, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [og],
    },
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const posts = getAllPosts()
  const index = posts.findIndex((p) => p.slug === post.slug)
  const prev = index > 0 ? posts[index - 1] : null
  const next = index < posts.length - 1 ? posts[index + 1] : null

  return (
    <main id="main-content" className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />
      {/* BlogPosting 结构化数据：搜索引擎的富摘要（作者/日期/标题）从这里来。
          必须转义 `<`：JSON.stringify 会把字符串原样吐出来，标题里出现
          `</script>` 就会提前闭合标签——当前数据没有，但内容源一变就炸。 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            dateModified: post.date,
            inLanguage: 'zh-CN',
            author: { '@type': 'Person', name: SITE.author, url: `${SITE.url}/about/` },
            /* publisher 是 Google 富结果的必需字段，缺了直接不合格 */
            publisher: {
              '@type': 'Organization',
              name: '余烬 EMBERS',
              logo: { '@type': 'ImageObject', url: `${SITE.url}/icon-512.png` },
            },
            image: `${SITE.url}/og/${post.slug}.png`,
            mainEntityOfPage: `${SITE.url}/blog/${post.slug}/`,
            keywords: (post.tags ?? []).join(', '),
          }).replace(/</g, '\\u003c'),
        }}
      />
      <PostContent post={post} prev={prev} next={next} num={posts.length - index} />
      <Footer />
    </main>
  )
}
