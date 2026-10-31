'use client'

import { m } from 'framer-motion'

/* 静息火苗：几粒火星缓缓聚拢成一小簇，一动就散（桌面端，不打扰） */

const SPARKS = [
  { fx: -34, fy: 10, r: 4.0, d: 0 },
  { fx: 30, fy: 14, r: 3.0, d: 0.35 },
  { fx: -18, fy: 22, r: 2.6, d: 0.7 },
  { fx: 20, fy: 24, r: 3.2, d: 1.05 },
  { fx: -8, fy: 16, r: 2.8, d: 1.4 },
  { fx: 12, fy: 12, r: 3.4, d: 1.75 },
]

export function EmberRest() {
  return (
    <div className="pointer-events-none relative h-16 w-28" aria-hidden>
      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full bg-[radial-gradient(circle,rgba(196,99,74,0.38),transparent_70%)] blur-[3px]" />
      {SPARKS.map((s, i) => (
        <m.span
          key={i}
          className="absolute bottom-8 left-1/2 rounded-full bg-[var(--accent)]"
          style={{ width: s.r * 2, height: s.r * 2, marginLeft: -s.r, marginBottom: -s.r }}
          initial={{ x: s.fx, y: s.fy, opacity: 0 }}
          animate={{ x: [s.fx, 0, s.fx * 0.2], y: [s.fy, 0, -6], opacity: [0, 0.9, 0.35] }}
          transition={{ duration: 2.8, delay: s.d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
