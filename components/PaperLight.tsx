'use client'

import { useEffect } from 'react'

/* 光在纸上走：滚动时一层极淡的斜光缓慢下移，像台灯从纸面上扫过。
   只写一个 CSS 变量（rAF 节流），不触发 React 渲染。 */
export function PaperLight() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.documentElement
    let raf = 0

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        root.style.setProperty('--paper-shift', String(Math.round(window.scrollY * 0.14)))
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <div className="paper-light" aria-hidden />
}
