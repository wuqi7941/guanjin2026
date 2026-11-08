'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/* 访问量埋点：进站记一笔，客户端换页也各记一笔。
   统计页自己不算（不然查一次数据就给自己添一笔）；
   同一路径的重复 effect（StrictMode / 重复渲染）只记一次。
   失败完全静默——计数不该拖慢或打断阅读。 */
export function VisitTracker() {
  const pathname = usePathname()
  const last = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return
    if (pathname.startsWith('/stats')) return
    if (last.current === pathname) return
    last.current = pathname
    fetch('/api/visit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {})
  }, [pathname])

  return null
}
