'use client'

import { useEffect, useRef, useState } from 'react'
import { m } from 'framer-motion'
import { X, Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import type { Track } from '@/lib/playlist'
import type { LrcLine } from './MpLyrics'
import { lockScroll } from '@/lib/scrollLock'

interface MpFullscreenProps {
  track: Track | null
  cover: string
  playing: boolean
  lrc: LrcLine[]
  activeLrc: number
  pct: number
  timeStr: string
  durationStr: string
  onClose: () => void
  onToggle: () => void
  onPrev: () => void
  onNext: () => void
  onSeekTo: (r: number) => void
  onSeekToTime: (s: number) => void
}

/* 沉浸歌词：墨色底 + 朱印高亮，与纸本界面刻意拉开（像夜里关灯听歌）。
   点任意一句跳转；Esc / 右上关闭；底部保留最必要的三个控制。
   渲染层只负责展示，状态全部来自 usePlayerStore。 */
export function MpFullscreen({
  track, cover, playing, lrc, activeLrc, pct, timeStr, durationStr,
  onClose, onToggle, onPrev, onNext, onSeekTo, onSeekToTime,
}: MpFullscreenProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  /* 焦点：dialog 打开把焦点交给关闭钮，关闭时还原到触发元素——读屏与键盘才不会掉进虚空 */
  useEffect(() => {
    /* 同 MpPanel：触发元素可能已卸载，兜底把焦点还给播放条 */
    const opener = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    return () => {
      if (opener && opener.isConnected) opener.focus?.()
      else document.querySelector<HTMLElement>('.mp-bar-text')?.focus?.()
    }
  }, [])

  /* 拖动中的本地进度：move 只走 UI，松手才 seek（与面板进度条同一套手感） */
  const [dragPct, setDragPct] = useState<number | null>(null)
  const draggingRef = useRef(false)

  /* Esc 关闭 + 锁页面滚动 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const unlock = lockScroll()
    return () => {
      document.removeEventListener('keydown', onKey)
      unlock()
    }
  }, [onClose])

  /* 当前行滚到中段 */
  useEffect(() => {
    const box = scrollerRef.current
    if (!box || activeLrc < 0) return
    const el = box.querySelector<HTMLElement>('[data-fs-active="true"]')
    if (!el) return
    box.scrollTo({
      top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2,
      behavior: 'smooth',
    })
  }, [activeLrc])

  /* 点任意一句跳转：click 直接用行的时间，无需经过位置反算 */
  return (
    <m.div
      className="mp-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      role="dialog"
      aria-modal="true"
      aria-label="沉浸歌词"
    >
      <div className="mp-full-inner">
        <header className="mp-full-head">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase">EMBERS · 歌词</span>
          <button ref={closeRef} type="button" onClick={onClose} className="mp-full-close" aria-label="退出沉浸歌词">
            <X className="w-4 h-4" />
          </button>
        </header>

        <div ref={scrollerRef} className="mp-full-scroll">
          {lrc.length > 0 ? (
            <div className={`mp-full-lines${lrc.length <= 7 ? ' is-short' : ''}`}>
              {lrc.map((l, i) => (
                <button
                  type="button"
                  key={`${l.t}-${i}`}
                  data-fs-active={i === activeLrc ? 'true' : undefined}
                  onClick={() => onSeekToTime(l.t)}
                  className={`mp-full-line ${i === activeLrc ? 'is-active' : ''}`}
                >
                  {l.txt}
                </button>
              ))}
            </div>
          ) : (
            <div className="mp-full-empty">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" className="mp-full-empty-cover" />
              ) : null}
              <p className="mp-full-empty-title">这首没有词</p>
              <p className="mp-full-empty-sub">只听琴声就好。</p>
            </div>
          )}
        </div>

        <footer className="mp-full-foot">
          <div className="mp-full-meta">
            <span className="mp-full-title">{track ? track.t : '余烬音乐'}</span>
            <span className="mp-full-artist">{track ? track.a : '挑一首歌'}</span>
          </div>

          <div
            ref={barRef}
            className="mp-full-bar"
            role="slider"
            aria-label="播放进度"
            aria-valuenow={Math.round(dragPct ?? pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            onPointerDown={(e) => {
              draggingRef.current = true
              ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
              const r = barRef.current?.getBoundingClientRect()
              if (r?.width) setDragPct(((e.clientX - r.left) / r.width) * 100)
            }}
            onPointerMove={(e) => {
              if (!draggingRef.current || e.buttons !== 1) return
              const r = barRef.current?.getBoundingClientRect()
              if (r?.width) setDragPct(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)))
            }}
            onPointerUp={(e) => {
              if (!draggingRef.current) return
              draggingRef.current = false
              ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
              const r = barRef.current?.getBoundingClientRect()
              if (r?.width) onSeekTo(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)))
              setDragPct(null)
            }}
            onPointerCancel={() => {
              draggingRef.current = false
              setDragPct(null)
            }}
            style={{ touchAction: 'none' }}
          >
            <span className="mp-full-bar-fill" style={{ width: `${dragPct ?? pct}%` }} />
          </div>

          <div className="mp-full-time">
            <span>{timeStr}</span>
            <span>{durationStr}</span>
          </div>

          <div className="mp-full-controls">
            <button type="button" onClick={onPrev} aria-label="上一首">
              <SkipBack className="w-5 h-5" />
            </button>
            <button type="button" onClick={onToggle} className="is-primary" aria-label={playing ? '暂停' : '播放'}>
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 translate-x-[1px]" />}
            </button>
            <button type="button" onClick={onNext} aria-label="下一首">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </footer>
      </div>
    </m.div>
  )
}
