'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/* 顶部一条极细的朱红进度线：读到哪，线到哪。
   文章页自带一条更讲究的三色火线（PostContent），这里不重复画。 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const isArticle = pathname?.startsWith('/blog/') ?? false

  useEffect(() => {
    const bar = barRef.current
    if (!bar || isArticle) return

    let raf = 0
    let ticking = false
    /* 缓存可滚动高度：避免每帧读 scrollHeight 触发强制布局 */
    let max = 0

    const measure = () => {
      const el = document.documentElement
      max = Math.max(0, el.scrollHeight - el.clientHeight)
    }

    const update = () => {
      ticking = false
      if (!max) {
        bar.style.transform = 'scaleX(0)'
        bar.style.opacity = '0'
        return
      }
      const p = Math.min(1, Math.max(0, window.scrollY / max))
      bar.style.transform = `scaleX(${p})`
      bar.style.opacity = p > 0.005 ? '1' : '0'
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      raf = requestAnimationFrame(update)
    }
    const onResize = () => {
      measure()
      update()
    }

    measure()
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    /* 路由切换后内容高度会变，延迟重算一次 */
    const t = window.setTimeout(onResize, 350)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [pathname, isArticle])

  if (isArticle) return null

  return <div ref={barRef} className="scroll-progress" aria-hidden />
}
