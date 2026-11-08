'use client'

import { m } from 'framer-motion'
import { useInView } from '@/hooks/useInView'

/* 静息火苗：几粒火星缓缓聚拢成一小簇，一动就散（桌面端，不打扰）。
   2026-11：加视口判断。6 条 repeat:Infinity 的动画原先在整篇长文都滚过去之后
   还在跑——它们早就不在屏幕上了，合成层却一直有活干。 */
const SPARKS = [
  { fx: -34, fy: 10, r: 4.0, d: 0 },
  { fx: 30, fy: 14, r: 3.0, d: 0.35 },
  { fx: -18, fy: 22, r: 2.6, d: 0.7 },
  { fx: 20, fy: 24, r: 3.2, d: 1.05 },
  { fx: -8, fy: 16, r: 2.8, d: 1.4 },
  { fx: 12, fy: 12, r: 3.4, d: 1.75 },
]

export function EmberRest() {
  const { ref, inView } = useInView<HTMLDivElement>({ once: false, threshold: 0.01 })

  return (
    <div ref={ref} className="pointer-events-none relative h-16 w-28" aria-hidden>
      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full bg-[radial-gradient(circle,rgb(var(--accent-rgb)/0.38),transparent_70%)] blur-[3px]" />
      {SPARKS.map((s, i) => (
        <m.span
          key={i}
          className="absolute bottom-8 left-1/2 rounded-full bg-[var(--accent)]"
          style={{ width: s.r * 2, height: s.r * 2, marginLeft: -s.r, marginBottom: -s.r }}
          initial={{ x: s.fx, y: s.fy, opacity: 0 }}
          animate={
            inView
              ? { x: [s.fx, 0, s.fx * 0.2], y: [s.fy, 0, -6], opacity: [0, 0.9, 0.35] }
              : { x: 0, y: 0, opacity: 0.22 }
          }
          /* 离开视口时连 repeat 也一起去掉：只把目标换成静态值、transition 还挂着
             Infinity 的话，framer 会继续逐帧跑一条「从当前值到同值」的循环。 */
          transition={
            inView
              ? { duration: 2.8, delay: s.d, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  )
}
