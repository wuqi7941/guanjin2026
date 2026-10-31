'use client'

import { useEffect, useRef } from 'react'

/* 顶部一条极细的朱红进度线：读到哪，线到哪。
   rAF 节流，直写 transform，不触发 React 重渲染。 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    let raf = 0
    let ticking = false

    const update = () => {
      ticking = false
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      const p = total > 0 ? Math.min(1, Math.max(0, el.scrollTop / total)) : 0
      bar.style.transform = `scaleX(${p})`
      bar.style.opacity = p > 0.005 ? '1' : '0'
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return <div ref={barRef} className="scroll-progress" aria-hidden />
}
