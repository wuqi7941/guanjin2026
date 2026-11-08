import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      /* 隐藏页不进索引：入口只靠站内暗门，不靠搜索引擎 */
      disallow: ['/eggs/', '/stats/'],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
