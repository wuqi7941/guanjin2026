'use client'

import { useEffect } from 'react'
import { useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

/* 鼠标微视差：返回可绑到 style 的 x/y MotionValue。
   仅桌面精指针启用；减动 / 触屏返回恒 0（无副作用）。 */
export function useParallax(strength = 1) {
  const reduce = !!useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 55, damping: 18, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 55, damping: 18, mass: 0.6 })

  useEffect(() => {
    if (reduce) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 9 * strength)
      my.set((e.clientY / window.innerHeight - 0.5) * 6 * strength)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [mx, my, reduce, strength])

  return { x: sx, y: sy }
}
