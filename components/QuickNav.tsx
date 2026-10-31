'use client'

import { useEffect, useRef, useState } from 'react'

/* 两键跳转：先按 g，再按一个字母。
   g h 首页 / g b 文章 / g t 年轮 / g s 星图 / g f 收藏夹 / g a 关于 / g c 联系 */
const MAP: Record<string, { href: string; label: string }> = {
  h: { href: '/', label: '首页' },
  b: { href: '/blog/', label: '文章' },
  t: { href: '/timeline/', label: '火的年轮' },
  s: { href: '/tags/', label: '标签星图' },
  f: { href: '/bookmarks/', label: '收藏夹' },
  a: { href: '/about/', label: '关于' },
  c: { href: '/contact/', label: '联系' },
}

const HINT = ['h', 'b', 't', 's', 'f']

export function QuickNav() {
  const [armed, setArmed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const disarm = () => {
      setArmed(false)
      clearTimeout(timer.current)
    }

    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && el.closest('input, textarea, select, [contenteditable="true"]')) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (!armed) {
        if (e.key.toLowerCase() === 'g') {
          setArmed(true)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => setArmed(false), 1200)
        }
        return
      }

      const hit = MAP[e.key.toLowerCase()]
      disarm()
      if (!hit) return
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('embers-navigate', { detail: hit.href }))
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(timer.current)
    }
  }, [armed])

  if (!armed) return null

  return (
    <div className="quick-hint" role="status">
      {HINT.map((k) => (
        <span key={k}>
          <kbd>g</kbd>
          <kbd>{k}</kbd>
          {MAP[k].label}
        </span>
      ))}
    </div>
  )
}
