'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowUp } from 'lucide-react'
import { useScroll } from '@/hooks/useScroll'

const STORE_KEY = 'embers-scroll-pos'

/* 阅读体验：滚动位置记忆（返回不丢位置）+ 回顶按钮 + 滚动中性能标记（.scrolling） */
export function ScrollManager() {
  const pathname = usePathname()
  /* /play/ 是纯前端状态机：上次离开时的位置对应的是某个长结果页，回来视图已重置成入口，
     恢复位置只会看到一片空白。这类页面不记、也不恢复滚动位置。 */
  const isPlay = pathname === '/play' || pathname.startsWith('/play/')
  const [show, setShow] = useState(false)
  const stopTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  /* 滚动状态：滚动中给 <html> 加 .scrolling（关掉高成本 backdrop-filter），静止 300ms 后移除；同时更新回顶按钮 */
  useScroll((y) => {
    document.documentElement.classList.add('scrolling')
    if (stopTimer.current) clearTimeout(stopTimer.current)
    stopTimer.current = setTimeout(() => {
      document.documentElement.classList.remove('scrolling')
    }, 300)
    const pass = y > 320
    setShow((s) => (s === pass ? s : pass))
  })

  /* 卸载时把 .scrolling 摘掉：AuroraBackground 靠这个类决定暂停粒子，
     残留会把背景永久冻住 */
  useEffect(
    () => () => {
      if (stopTimer.current) clearTimeout(stopTimer.current)
      document.documentElement.classList.remove('scrolling')
    },
    [],
  )

  /* 恢复本页上次滚动位置 */
  useEffect(() => {
    const saved = sessionStorage.getItem(STORE_KEY)
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved)
        /* 旧版本格式 / 手改过的 sessionStorage 可能不是对象：
           直接当 map 用会在 delete 时抛错，恢复逻辑整块失效。 */
        const map: Record<string, number> =
          parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? (parsed as Record<string, number>)
            : {}
        const y = map[pathname]
        if (!isPlay && typeof y === 'number' && y > 0) {
          requestAnimationFrame(() => {
            window.scrollTo({ top: y, behavior: 'auto' })
          })
        }
        delete map[pathname]
        sessionStorage.setItem(STORE_KEY, JSON.stringify(map))
      } catch {
        /* ignore */
      }
    }
  }, [pathname, isPlay])

  /* 离开页面前把位置存进去，供返回时恢复。
     2026-10-25：站内跳转改成客户端路由后不再触发 pagehide，
     所以另外在「点击站内链接」时先存一次当前位置（捕获阶段，早于路由切换）。 */
  useEffect(() => {
    const save = () => {
      if (isPlay) return
      try {
        const saved = sessionStorage.getItem(STORE_KEY)
        const parsedMap: unknown = saved ? JSON.parse(saved) : {}
        const map: Record<string, number> =
          parsedMap && typeof parsedMap === 'object' && !Array.isArray(parsedMap)
            ? (parsedMap as Record<string, number>)
            : {}
        map[pathname] = window.scrollY
        sessionStorage.setItem(STORE_KEY, JSON.stringify(map))
      } catch {
        /* ignore */
      }
    }
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest('a')
      if (!a) return
      if (a.target && a.target !== '_self') return
      if (a.hasAttribute('download')) return
      const href = a.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      try {
        if (new URL(a.href).origin !== location.origin) return
      } catch {
        return
      }
      save()
    }
    document.addEventListener('click', onClick, true)
    window.addEventListener('pagehide', save)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('pagehide', save)
    }
  }, [pathname, isPlay])

  return (
    <button
      type="button"
      aria-label="回到顶部"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`back-top-btn fixed bottom-24 right-6 z-[75] grid place-items-center w-11 h-11 rounded-md border border-[var(--hairline-strong)] bg-[var(--surface-2)] text-[var(--ink-muted)] shadow-lg transition-all duration-300 hover:text-[var(--accent)] hover:border-[var(--accent)] hover:-translate-y-1 active:translate-y-0 ${
        show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-4.5 h-4.5" />
    </button>
  )
}