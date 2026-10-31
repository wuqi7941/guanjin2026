import { getSearchDocs } from '@/lib/posts'

/* 静态导出时生成 /search-index.json：纯文本索引，搜索弹窗按需拉取 */
export const dynamic = 'force-static'

export function GET() {
  return new Response(JSON.stringify(getSearchDocs()), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}
