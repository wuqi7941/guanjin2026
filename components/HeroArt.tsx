'use client'

import { EASE } from '@/lib/motion'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { Expand, X } from 'lucide-react'
import { PianoKeyboard } from './PianoKeyboard'
import { useInView } from '@/hooks/useInView'
import { lockScroll } from '@/lib/scrollLock'


const MODES = ['photo', 'piano'] as const

/* 实拍照片：黄昏枫树与落叶（无边框展示） */
function PhotoScene() {
  return (
    <m.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, ease: EASE }}
      className="absolute inset-0"
    >
      <Image
        src="/hero-photo.webp"
        alt="黄昏的枫树，枝条稀疏，落叶纷纷"
        fill
        priority
        sizes="(max-width: 768px) 300px, 440px"
        className="object-cover bg-[var(--surface-2)]"
      />
    </m.div>
  )
}

export function HeroArt() {
  const reduce = !!useReducedMotion()
  const [mode, setMode] = useState<typeof MODES[number]>('photo')
  const [fullOpen, setFullOpen] = useState(false)
  /* 离开视口：停动画，回来恢复 */
  const { ref: rootRef, inView } = useInView<HTMLDivElement>({ once: false, threshold: 0.05 })

  /* 全屏打开时锁滚动 + Esc 关闭 + 焦点进出 dialog */
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!fullOpen) return
    const opener = document.activeElement as HTMLElement | null
    const unlock = lockScroll()
    const t = window.setTimeout(() => closeRef.current?.focus(), 50)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      unlock()
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      opener?.focus?.()
    }
  }, [fullOpen])

  return (
    <div ref={rootRef} className="relative w-full" style={{ aspectRatio: '440 / 500' }}>
      <button
        type="button"
        onClick={() => setMode((m) => (m === 'photo' ? 'piano' : 'photo'))}
        aria-label={mode === 'photo' ? '切换到钢琴' : '回到照片'}
        className="absolute top-2 right-2 z-20 inline-flex items-center gap-1 rounded-[3px] border border-[var(--hairline-strong)] bg-[var(--surface-1)]/95 shadow-sm px-2 py-1 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink)] backdrop-blur-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        {mode === 'photo' ? '见琴' : '归影'}
      </button>

      <AnimatePresence initial={false} mode="popLayout">
        <m.div
          key={mode}
          initial={reduce ? false : { opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.65, ease: EASE }}
          className="absolute inset-0"
        >
          {mode === 'photo' ? (
            <PhotoScene />
          ) : (
            <>
              <PianoKeyboard variant="hero" />
              <button
                type="button"
                onClick={() => setFullOpen(true)}
                aria-label="全屏弹奏"
                className="absolute bottom-2 right-2 z-20 inline-flex items-center gap-1 rounded-[3px] border border-[var(--hairline-strong)] bg-[var(--surface-1)]/95 shadow-sm px-2 py-1 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink)] backdrop-blur-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <Expand className="w-3 h-3" />
                全屏
              </button>
            </>
          )}
        </m.div>
      </AnimatePresence>

      {/* 全屏键盘（手机大键滑奏 / 桌面沉浸弹奏）——portal 到 body，避免被 Hero 的 isolation 困住层级 */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {fullOpen && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="fixed inset-0 z-[86] embers-bg flex flex-col items-center justify-center px-4 sm:px-8"
              >
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setFullOpen(false)}
                  aria-label="关闭全屏钢琴"
                  className="absolute top-4 right-4 z-[var(--z-content)] inline-flex items-center gap-1.5 rounded-[3px] border border-[var(--hairline-strong)] bg-[var(--surface-1)]/95 shadow-sm px-3 py-1.5 font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--ink)] backdrop-blur-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  <X className="w-3.5 h-3.5" />
                  收起
                </button>

                <div className="w-full max-w-[560px]">
                  <PianoKeyboard variant="full" />
                </div>

                <p className="mt-6 text-center font-display italic text-[var(--ink-tertiary)] text-sm select-none">
                  点按或按住滑动——像真的划过琴键。横屏更舒展。
                </p>
              </m.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  )
}
