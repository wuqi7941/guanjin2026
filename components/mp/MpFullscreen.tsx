'use client'

import { useEffect, useRef } from 'react'
import { m } from 'framer-motion'
import { X, Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import type { Track } from '@/lib/playlist'
import type { LrcLine } from './MpLyrics'

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

  /* Esc 关闭 + 锁页面滚动 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
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

  const seekAt = (clientX: number) => {
    const el = barRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    if (!r.width) return
    onSeekTo(Math.max(0, Math.min(1, (clientX - r.left) / r.width)))
  }

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
          <button type="button" onClick={onClose} className="mp-full-close" aria-label="退出沉浸歌词">
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
                  data-t={l.t}
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
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            onPointerDown={(e) => {
              ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
              seekAt(e.clientX)
            }}
            onPointerMove={(e) => {
              if (e.buttons === 1) seekAt(e.clientX)
            }}
            style={{ touchAction: 'none' }}
          >
            <span className="mp-full-bar-fill" style={{ width: `${pct}%` }} />
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
