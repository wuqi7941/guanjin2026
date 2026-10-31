'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { bumpCounter, collectEgg } from '@/lib/eggs'
import { m, AnimatePresence } from 'framer-motion'
import { EASE_IN, EASE_OUT } from '@/lib/motion'

/* 墨染推开：切页时墨层从左缘浸染铺满旧页，新页由左向右揭开。
   2026-10-25：此前用 location.href 做整页重载，导致每次点导航都重新加载文档——
   音乐播放器被打断（audio 节点重建）、滚动与面板状态全丢、跳转还慢。
   改为捕获阶段 preventDefault + 墨层铺满后 router.push 客户端跳转：
   墨染效果不变，但文档不重建，播放器持续、跳页接近瞬时。 */
const WIPE_KEY = 'embers-wipe'

export function PageTransition() {
  const pathname = usePathname()
  const router = useRouter()
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle')
  /* 过渡的质感：ink=墨染（普通跳转），paper=纸页翻过去（上一篇/下一篇） */
  const [tone, setTone] = useState<'ink' | 'paper'>('ink')
  const leavingRef = useRef(false)
  const safetyRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const clearSafety = useCallback(() => {
    if (safetyRef.current) {
      clearTimeout(safetyRef.current)
      safetyRef.current = undefined
    }
  }, [])

  /* 开始过渡（点击捕获 / embers-navigate 事件共用）。
     tone='paper' 时用纸页翻过去的样式（上一篇/下一篇），否则是墨染。 */
  const beginWipe = useCallback(
    (href: string, tone: 'ink' | 'paper' = 'ink') => {
      if (leavingRef.current) return
      leavingRef.current = true
      setTone(tone)
      /* 减少动态效果：不写 WIPE_KEY，否则新页读到 'in' 还是要播一段揭开 */
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        router.push(href)
        return
      }
      try {
        sessionStorage.setItem(WIPE_KEY, 'in')
      } catch {
        /* ignore */
      }
      setPhase('out')
      /* 兜底：万一路由没有变化（同路径/被拦截），3s 后解除遮罩与锁 */
      clearSafety()
      safetyRef.current = setTimeout(() => {
        leavingRef.current = false
        setPhase('idle')
      }, 3000)
      /* 200ms ≈ 墨层铺满（0.16s）+ 余量：铺满后再换页，避免新页从墨层边缘露出 */
      window.setTimeout(() => router.push(href), 260)
    },
    [router, clearSafety],
  )

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (leavingRef.current) return
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement).closest('a')
      if (!a) return
      if (a.target && a.target !== '_self') return
      if (a.hasAttribute('download')) return
      const href = a.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      /* 静态资源不是「页面」：/feed.xml、*.json、*.pdf 等交给浏览器，别套墨染再 router.push */
      if (/\/(feed\.xml|sitemap\.xml|robots\.txt)$/i.test(href) || /\.(xml|json|txt|pdf|png|jpe?g|webp|svg|zip)$/i.test(href)) return

      let url: URL
      try {
        url = new URL(a.href)
      } catch {
        return
      }
      if (url.origin !== location.origin) return
      /* 只有纯锚点（同路径 + 带 hash）交给浏览器滚动；
         其余站内跳转——包括点当前页的导航——都走墨染，不再有"点了没动画"的情况 */
      if (url.pathname === location.pathname && url.search === location.search && url.hash) return

      /* 捕获阶段接管：preventDefault 后 next/link 会放弃自己的导航，
         由墨层铺满再 router.push，过渡与路由时机才可控。
         带 data-flip 的链接（上一篇/下一篇）换成纸页翻过去的样式。 */
      e.preventDefault()
      const isFlip = a.hasAttribute('data-flip')
      if (isFlip && bumpCounter('flip', 10) >= 10) collectEgg('flip')
      beginWipe(url.pathname + url.search + url.hash, isFlip ? 'paper' : 'ink')
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [beginWipe])

  /* 程序化导航（如文章页键盘翻页）：派发 embers-navigate 事件即走同一套墨染 */
  useEffect(() => {
    const onNav = (e: Event) => {
      const detail = (e as CustomEvent<string | { href: string; tone?: 'ink' | 'paper' }>).detail
      if (!detail) return
      if (typeof detail === 'string') beginWipe(detail)
      else if (detail.href) beginWipe(detail.href, detail.tone ?? 'ink')
    }
    window.addEventListener('embers-navigate', onNav)
    return () => window.removeEventListener('embers-navigate', onNav)
  }, [beginWipe])

  /* 到达新页：若由墨染跳转而来，播放「揭开」；否则保持空闲 */
  useEffect(() => {
    clearSafety()
    let wipe: string | null = null
    try {
      wipe = sessionStorage.getItem(WIPE_KEY)
    } catch {
      /* ignore */
    }
    if (wipe === 'in') {
      try {
        sessionStorage.removeItem(WIPE_KEY)
      } catch {
        /* ignore */
      }
      setPhase('in')
    } else {
      setPhase('idle')
    }
    leavingRef.current = false
  }, [pathname, clearSafety])

  useEffect(() => clearSafety, [clearSafety])

  return (
    <>
      {/* 过渡时盖一枚印：墨铺满的那一瞬，朱印落纸 */}
      {phase === 'out' && tone === 'ink' && (
        <m.div
          className="wipe-seal"
          initial={{ opacity: 0, scale: 1.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: -5 }}
          transition={{ duration: 0.24, ease: EASE_OUT }}
          aria-hidden
        >
          余
        </m.div>
      )}
    <AnimatePresence>
      {phase !== 'idle' && (
        <m.div
          key={phase}
          initial={{ scaleX: phase === 'out' ? 0 : 1 }}
          animate={{ scaleX: phase === 'out' ? 1 : 0 }}
          transition={{
            duration: phase === 'out' ? 0.22 : 0.28,
            ease: phase === 'out' ? EASE_IN : EASE_OUT,
          }}
          onAnimationComplete={() => {
            /* 只有「揭开」结束才算过渡完；out 结束就卸遮罩会在 router.push 之前
               露出旧页（≥40ms 空窗，看着就是闪一下） */
            if (phase === 'in') setPhase('idle')
          }}
          className={`${tone === 'paper' ? 'wipe-paper' : 'wipe-ink'} fixed inset-0 z-[var(--z-wipe)] pointer-events-auto`}
          aria-hidden
        />
      )}
    </AnimatePresence>
    </>
  )
}
