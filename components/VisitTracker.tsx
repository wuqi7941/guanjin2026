'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/* 访问量埋点：进站记一笔，客户端换页也各记一笔。
   统计页自己不算（不然查一次数据就给自己添一笔）；
   失败完全静默——计数不该拖慢或打断阅读。

   去重口径（2026-11 改）：从「和上一条相同就跳过」改成「本次会话已记过的路径不重复记」。
   原先只比对 last，A→B→A 的往返会把 A 记两笔，统计里的「打开次数」被自己的导航行为灌水。 */
export function VisitTracker() {
  const pathname = usePathname()
  const seen = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!pathname) return
    if (pathname.startsWith('/stats')) return
    if (seen.current.has(pathname)) return
    seen.current.add(pathname)
    fetch('/api/visit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {})
  }, [pathname])

  return null
}
