'use client'

import { useEffect } from 'react'
import { collectEgg, type EggKey } from '@/lib/eggs'

/* 页面打开即点亮（目前只给 404 用：暗语「迷路」）。
   404 是静态导出，错误路径由 Cloudflare Pages 回落到 /404.html，
   所以只能放在页面里随挂载触发。 */
export function EggOnMount({ egg }: { egg: EggKey }) {
  useEffect(() => {
    collectEgg(egg)
  }, [egg])
  return null
}
