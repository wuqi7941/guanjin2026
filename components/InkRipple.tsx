'use client'

import { useEffect, useState } from 'react'
import { m, AnimatePresence, useReducedMotion } from 'framer-motion'
import { EASE_OUT } from '@/lib/motion'

interface Ripple {
  id: number
  x: number
  y: number
  strong: boolean
}

let seq = 0

/* 点击墨点波纹：任何一次点击都从指尖绽开一圈墨环 + 三粒小墨点。
   按钮/链接上最明显；点在空白处时更淡，只留一点回声。
   输入框内不响应（别打扰打字）。 */
export function InkRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const reduce = !!useReducedMotion()

  useEffect(() => {
    /* 减动环境：墨环本身就是一次动画，直接整个功能让位 */
    if (reduce) return
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null
      if (!el) return
      if (el.closest('input, textarea, select, [contenteditable="true"]')) return
      const strong = !!el.closest('button, a, .btn-primary, .btn-secondary, .ink-ripple, [role="button"]')
      const id = ++seq
      setRipples((r) => [...r.slice(-4), { id, x: e.clientX, y: e.clientY, strong }])
      window.setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 700)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [reduce])

  return (
    <div className="fixed inset-0 z-[95] pointer-events-none overflow-hidden" aria-hidden>
      <AnimatePresence>
        {ripples.map((r) => (
          <m.span
            key={r.id}
            className="absolute block"
            style={{ left: r.x, top: r.y, opacity: r.strong ? 1 : 0.45 }}
            initial={{ opacity: r.strong ? 0.55 : 0.28, scale: r.strong ? 0.35 : 0.3 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: r.strong ? 0.55 : 0.45, ease: EASE_OUT }}
          >
            <span className="absolute -left-6 -top-6 block w-12 h-12 rounded-full border border-[var(--accent)]" />
            {[0, 120, 240].map((deg) => (
              <span
                key={deg}
                className="absolute block w-[3px] h-[3px] rounded-full bg-[var(--accent)]"
                style={{ transform: `rotate(${deg}deg) translateX(10px)` }}
              />
            ))}
          </m.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
