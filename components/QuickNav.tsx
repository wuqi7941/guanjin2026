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

/* 提示由 MAP 派生，别再手写一份对不上的清单 */
const HINT = ['h', 'b', 't', 's', 'f'].map((k) => ({ key: k, label: MAP[k].label }))

const ARM_MS = 1200

export function QuickNav() {
  const [armed, setArmed] = useState(false)
  /* armed 同时放 ref：effect 只挂一次，靠 ref 读状态，
     避免 setArmed 触发重渲染 → cleanup 把刚设好的定时器清掉 */
  const armedRef = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const disarm = () => {
      armedRef.current = false
      setArmed(false)
      clearTimeout(timer.current)
    }

    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && el.closest('input, textarea, select, [contenteditable="true"]')) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (!armedRef.current) {
        if (e.key.toLowerCase() === 'g') {
          armedRef.current = true
          setArmed(true)
          clearTimeout(timer.current)
          timer.current = setTimeout(disarm, ARM_MS)
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
  }, [])

  if (!armed) return null

  return (
    <div className="quick-hint" role="status">
      {HINT.map((h) => (
        <span key={h.key}>
          <kbd>g</kbd>
          <kbd>{h.key}</kbd>
          {h.label}
        </span>
      ))}
    </div>
  )
}
