import { useEffect, useRef, type RefObject } from 'react'
import { m } from 'framer-motion'
import { X, Music2, ListMusic, Maximize2 } from 'lucide-react'
import { Track } from '@/lib/playlist'
import { EASE_QUIET } from '@/lib/motion'
import { lockScroll } from '@/lib/scrollLock'
import { MpCover } from './MpCover'
import { MpLyrics, type LrcLine } from './MpLyrics'
import { MpPlaylist } from './MpPlaylist'
import { MpControls } from './MpControls'

interface MpPanelProps {
  track: Track | null
  error: string
  buffering: boolean
  tab: 'lyrics' | 'list'
  cover: string
  playing: boolean
  lrc: LrcLine[]
  activeLrc: number
  tracks: Track[]
  idx: number
  pct: number
  timeStr: string
  durationStr: string
  vol: number
  volPct: number
  shuffle: boolean
  scrollRef: RefObject<HTMLDivElement>
  seekBarRef: RefObject<HTMLDivElement>
  onClose: () => void
  onTab: (t: 'lyrics' | 'list') => void
  onPlay: (i: number) => void
  onSeekTo: (r: number) => void
  onToggleShuffle: () => void
  onPrev: () => void
  onToggle: () => void
  onNext: () => void
  onVol: (v: number) => void
  onFull: () => void
}

/* 播放器面板：头部 + 封面 + 歌词/歌单切换 + 控制条（纯展示，状态在 MusicPlayer） */
export function MpPanel({
  track, error, buffering, tab, cover, playing, lrc, activeLrc, tracks, idx,
  pct, timeStr, durationStr, vol, volPct, shuffle,
  scrollRef, seekBarRef,
  onClose, onTab, onPlay, onSeekTo, onToggleShuffle, onPrev, onToggle, onNext, onVol, onFull,
}: MpPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  /* 手机端面板是全屏的，锁住背后滚动；桌面端是浮窗，页面照常可滚。
     原实现只在挂载时判断一次断点：中途把窗口缩到手机宽度，
     面板已经全屏却没有锁滚动；反过来从手机拉宽，锁也解不掉。 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 639px)')
    let unlock: (() => void) | null = null
    const sync = () => {
      if (mq.matches && !unlock) unlock = lockScroll()
      else if (!mq.matches && unlock) {
        unlock()
        unlock = null
      }
    }
    sync()
    mq.addEventListener('change', sync)
    return () => {
      mq.removeEventListener('change', sync)
      unlock?.()
    }
  }, [])

  /* dialog 语义补全：打开时焦点进面板（交给关闭钮），关闭时还原到触发元素。
     触发元素可能已经被卸载（面板一开，条子上的按钮会被替换），
     这时直接 focus() 会落在 body 上，键盘用户等于被扔回页面顶部。 */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    return () => {
      if (opener && opener.isConnected) opener.focus?.()
      else document.querySelector<HTMLElement>('.mp-bar-text')?.focus?.()
    }
  }, [])

  return (
    <m.div
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.32, ease: EASE_QUIET }}
      role="dialog"
      aria-modal="true"
      aria-label="播放器"
      className="mp-panel sm:absolute sm:bottom-full sm:right-0 sm:mb-4 max-sm:fixed max-sm:inset-y-0 max-sm:right-0 max-sm:z-[78]"
    >
      <div className="flex items-start gap-3 px-5 pt-5 pb-2">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-[var(--ink)] truncate leading-6">
            {track ? track.t : '余烬音乐'}
            {buffering && (
              <span className="inline-block w-1.5 h-1.5 ml-2 rounded-full bg-[var(--accent)] align-middle animate-pulse" />
            )}
          </p>
          <p className="text-xs text-[var(--ink-subtle)] truncate leading-5">
            {track ? `${track.a}${error ? ` · ${error}` : ''}` : '点右下角小球，挑一首歌'}
          </p>
        </div>
        <button
          ref={closeRef}
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="p-2 rounded-full text-[var(--ink-subtle)] hover:text-[var(--ink)] hover:bg-[var(--surface-3)] transition-colors"
          aria-label="关闭播放器"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 pt-1 pb-3">
        <MpCover cover={cover} title={track?.t ?? ''} playing={playing} />
      </div>

      <div className="flex items-center gap-1 px-5 pt-1 pb-1">
        {(
          [
            { key: 'lyrics', label: '歌词', icon: Music2 },
            { key: 'list', label: '歌单', icon: ListMusic },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => onTab(t.key)}
            className={
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ' +
              (tab === t.key
                ? 'bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[var(--accent)] font-medium'
                : 'text-[var(--ink-subtle)] hover:text-[var(--ink)]')
            }
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
        <button
          onClick={onFull}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs text-[var(--ink-subtle)] hover:text-[var(--accent)] hover:bg-[var(--surface-2)] transition-colors"
          aria-label="沉浸歌词"
          title="沉浸歌词"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          沉浸
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto mp-scroll">
        {tab === 'lyrics' ? (
          <MpLyrics lines={lrc} active={activeLrc} />
        ) : (
          <MpPlaylist tracks={tracks} idx={idx} playing={playing} onPlay={onPlay} />
        )}
      </div>

      <MpControls
        pct={pct}
        time={timeStr}
        duration={durationStr}
        vol={vol}
        volPct={volPct}
        shuffle={shuffle}
        playing={playing}
        seekBarRef={seekBarRef}
        onSeekTo={onSeekTo}
        onToggleShuffle={onToggleShuffle}
        onPrev={onPrev}
        onToggle={onToggle}
        onNext={onNext}
        onVol={onVol}
      />
    </m.div>
  )
}