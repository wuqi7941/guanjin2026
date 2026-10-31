'use client'

import { useEffect } from 'react'

/* 电影感：一层跟着指针走的暖光（soft-light 混合，不挡字）。
   只在有指针 + 未开减少动效时启用；触屏设备直接不挂监听。 */
export function GlowFollow() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return

    const root = document.documentElement
    let raf = 0
    let tx = 0.5
    let ty = 0.28
    let cx = tx
    let cy = ty

    const tick = () => {
      cx += (tx - cx) * 0.075
      cy += (ty - cy) * 0.075
      root.style.setProperty('--glow-x', (cx * 100).toFixed(2) + '%')
      root.style.setProperty('--glow-y', (cy * 100).toFixed(2) + '%')
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(tick) : 0
    }

    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth
      ty = e.clientY / window.innerHeight
      if (!raf) raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <div className="glow-follow" aria-hidden />
}
