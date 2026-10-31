import { notFound } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { PostContent } from '@/components/PostContent'
import { AuroraBackground } from '@/components/AuroraBackground'
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
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      locale: 'zh_CN',
      siteName: '余烬 EMBERS',
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
      <PostContent post={post} prev={prev} next={next} />
      <Footer />
    </main>
  )
}
