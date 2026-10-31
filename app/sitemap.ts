import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'
import { SITE } from '@/lib/site'

export const dynamic = 'force-static'

const BASE = SITE.url

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  return [
    { url: `${BASE}/`, lastModified: new Date(), priority: 1, changeFrequency: 'weekly' },
    { url: `${BASE}/blog/`, lastModified: new Date(), priority: 0.9, changeFrequency: 'weekly' },
    { url: `${BASE}/about/`, lastModified: new Date(), priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/contact/`, lastModified: new Date(), priority: 0.5, changeFrequency: 'yearly' },
    { url: `${BASE}/timeline/`, lastModified: new Date(), priority: 0.6, changeFrequency: 'weekly' },
    { url: `${BASE}/tags/`, lastModified: new Date(), priority: 0.6, changeFrequency: 'weekly' },
    ...posts.map((post) => ({
      url: `${BASE}/blog/${post.slug}/`,
      lastModified: new Date(post.date),
      priority: 0.6,
      changeFrequency: 'monthly' as const,
    })),
  ]
}
