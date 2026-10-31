'use client'

import { useEffect, useRef, useState } from 'react'

interface UseInViewOptions {
  /** true：进入视口后停止观察（一次触发）；false：进出都更新 */
  once?: boolean
  /** 触发的可见比例 */
  threshold?: number
  rootMargin?: string
}

/* 统一视口观察：替代各组件分散的 IntersectionObserver 实现 */
export function useInView<T extends HTMLElement = HTMLDivElement>(options: UseInViewOptions = {}) {
  const { once = true, threshold = 0.05, rootMargin = '0px' } = options
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) obs.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [once, threshold, rootMargin])

  return { ref, inView }
}
