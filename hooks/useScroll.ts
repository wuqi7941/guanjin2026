'use client'

import { useEffect, useRef, useState } from 'react'

/* 统一滚动监听：rAF 节流；传 callback 时直写 DOM（不触发 React 渲染），否则以 state 返回 y。
   替代 MobileNav / ScrollManager / PostContent 三处分散的 scroll 实现。 */
export function useScroll(onScroll?: (y: number) => void) {
  const [y, setY] = useState(0)
  const cbRef = useRef(onScroll)
  cbRef.current = onScroll

  useEffect(() => {
    let raf = 0
    const handler = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const sy = window.scrollY
        if (cbRef.current) cbRef.current(sy)
        else setY((prev) => (prev === sy ? prev : sy))
      })
    }
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => {
      window.removeEventListener('scroll', handler)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return y
}
