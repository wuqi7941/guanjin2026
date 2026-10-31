import { getDailyLines } from '@/lib/lines'

/* 静态导出时生成 /daily-lines.json：每天一句用的句子表（约 207 条，20KB 上下） */
export const dynamic = 'force-static'

export function GET() {
  return new Response(JSON.stringify(getDailyLines()), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}
