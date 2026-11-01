'use client'

import { useEffect, useRef, useState } from 'react'
import { m } from 'framer-motion'
import { Play, Pause, SkipForward, AlignLeft } from 'lucide-react'
import { collectEgg } from '@/lib/eggs'
import type { Track } from '@/lib/playlist'

interface MpBarProps {
  track: Track | null
  cover: string
  playing: boolean
  pct: number
  onOpen: () => void
  onToggle: () => void
  onNext: () => void
  onFull: () => void
}

/* 迷你播放条：有歌之后取代右下角小球（球是"入口"，条是"控制"）。
   点曲名展开面板，右端直接进沉浸歌词；顶边一条发丝进度。
   彩蛋「燎原」：连点封面三下。
   封面不再兼作"展开"按钮——否则单击延迟展开会和第三下打架
   （实测第三下正好卡在 380ms，面板一开条子就卸载，三连击永远点不完）。
   展开交给右侧那片曲名/歌手文字，面积更大、点了立刻响应。 */
const TAP_WINDOW = 900

export function MpBar({ track, cover, playing, pct, onOpen, onToggle, onNext, onFull }: MpBarProps) {
  const taps = useRef(0)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  /* 换歌时重置封面加载失败标记：新歌的封面可能是好的 */
  const [coverFailed, setCoverFailed] = useState(false)

  useEffect(() => {
    setCoverFailed(false)
  }, [cover])
  useEffect(() => () => clearTimeout(resetTimer.current), [])

  const onTapCover = () => {
    taps.current += 1
    clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => {
      taps.current = 0
    }, TAP_WINDOW)
    if (taps.current >= 3) {
      clearTimeout(resetTimer.current)
      taps.current = 0
      collectEgg('hold')
      window.dispatchEvent(new CustomEvent('embers-burst', { detail: 18 }))
    }
  }

  return (
    <m.div
      className="mp-bar"
      initial={{ y: 72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 72, opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="mp-bar-progress" aria-hidden>
        <span className="mp-bar-progress-fill" style={{ width: `${pct}%` }} />
      </span>

      <button
        type="button"
        className="mp-bar-cover"
        aria-label={track ? `正在播放：${track.t}` : '播放器封面'}
        title={track ? track.t : '播放器封面'}
        onClick={onTapCover}
      >
        {/* 封面可能 404/防盗链：失败时回退占位，别一直挂破图 */}
        {cover && !coverFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" onError={() => setCoverFailed(true)} />
        ) : (
          <span className="mp-bar-cover-ph" />
        )}
        {playing && (
          <span className="mp-bar-eq" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="mp-eq-bar" />
            ))}
          </span>
        )}
      </button>

      <button type="button" className="mp-bar-text" onClick={onOpen}>
        <span className="mp-bar-title">{track ? track.t : '余烬音乐'}</span>
        <span className="mp-bar-artist">{track ? track.a : '挑一首歌'}</span>
      </button>

      <button type="button" className="mp-bar-btn" onClick={onFull} aria-label="沉浸歌词" title="沉浸歌词">
        <AlignLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        className="mp-bar-btn"
        onClick={onNext}
        aria-label="下一首"
        title="下一首"
        data-hide-sm=""
      >
        <SkipForward className="w-4 h-4" />
      </button>

      <button
        type="button"
        className="mp-bar-btn is-primary"
        onClick={onToggle}
        aria-label={playing ? '暂停' : '播放'}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-[1px]" />}
      </button>
    </m.div>
  )
}
