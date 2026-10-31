'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { TagEdge, TagNode } from '@/lib/tagmap'

interface MiniPost {
  slug: string
  title: string
  date: string
}

/* 星图本体：悬停一个分区，和它一起出现过的分区会亮起来；
   点一个分区，下面列出这个分区的文章。 */
export function TagMap({
  nodes,
  edges,
  postsByTag,
}: {
  nodes: TagNode[]
  edges: TagEdge[]
  postsByTag: Record<string, MiniPost[]>
}) {
  const [active, setActive] = useState<string | null>(null)

  const pos = useMemo(() => {
    const m = new Map<string, TagNode>()
    nodes.forEach((n) => m.set(n.name, n))
    return m
  }, [nodes])

  const neighbours = useMemo(() => {
    if (!active) return new Set<string>()
    const s = new Set<string>()
    edges.forEach((e) => {
      if (e.a === active) s.add(e.b)
      if (e.b === active) s.add(e.a)
    })
    return s
  }, [active, edges])

  const posts = active ? postsByTag[active] ?? [] : []

  return (
    <div>
      <div className="tagmap-wrap">
        <svg viewBox="-300 -300 600 600" className="tagmap-svg" role="img" aria-label="标签星图">
          <g>
            {edges.map((e) => {
              const a = pos.get(e.a)
              const b = pos.get(e.b)
              if (!a || !b) return null
              const lit = active === e.a || active === e.b
              const dim = active && !lit
              return (
                <line
                  key={`${e.a}-${e.b}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={lit ? 'var(--accent)' : 'var(--ink-tertiary)'}
                  strokeWidth={lit ? Math.min(1.6, 0.3 + e.w * 0.12) : Math.min(1, 0.2 + e.w * 0.06)}
                  opacity={dim ? 0.08 : lit ? 0.55 : 0.16}
                />
              )
            })}
          </g>

          <g>
            {nodes.map((n, ni) => {
              const lit = active === n.name || neighbours.has(n.name)
              const dim = active && !lit
              return (
                <g
                  key={n.name}
                  className={`tagmap-node${ni >= 12 ? ' tagmap-minor' : ''}`}
                  onMouseEnter={() => setActive(n.name)}
                  onMouseLeave={() => setActive(null)}
                  onClick={() => setActive((v) => (v === n.name ? null : n.name))}
                  style={{ cursor: 'pointer', opacity: dim ? 0.35 : 1 }}
                >
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={n.r + (lit ? 3 : 0)}
                    fill={active === n.name ? 'var(--accent)' : 'var(--ink-muted)'}
                    opacity={0.85}
                  />
                  <text
                    x={n.x + n.r + 6}
                    y={n.y + 3}
                    fontSize={active === n.name ? 13 : 11}
                    fill={active === n.name ? 'var(--accent)' : 'var(--ink-muted)'}
                  >
                    {n.name}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <div className="tagmap-panel">
        {!active && <p className="text-sm text-[var(--ink-tertiary)]">悬停看关系，点一个分区看它的文章。</p>}

        {active && (
          <>
            <p className="tagmap-panel-title">
              {active} · <span className="tabular-nums">{posts.length}</span> 篇
              {neighbours.size > 0 && (
                <span className="tagmap-panel-rel">　常与 {Array.from(neighbours).slice(0, 5).join('、')} 同现</span>
              )}
            </p>
            <ul className="tagmap-posts">
              {posts.slice(0, 12).map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}/`} className="tagmap-post">
                    <span className="tagmap-post-date">{p.date.replace(/-/g, '.')}</span>
                    <span className="tagmap-post-title">{p.title}</span>
                  </Link>
                </li>
              ))}
              {posts.length > 12 && <li className="text-xs text-[var(--ink-tertiary)]">…还有 {posts.length - 12} 篇</li>}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
