import { memo, useRef, type RefObject, type PointerEvent } from 'react'
import { Shuffle, SkipBack, Play, Pause, SkipForward, Volume2 } from 'lucide-react'

interface MpControlsProps {
  pct: number
  time: string
  duration: string
  vol: number
  volPct: number
  shuffle: boolean
  playing: boolean
  seekBarRef: RefObject<HTMLDivElement>
  onSeekTo: (r: number) => void
  onToggleShuffle: () => void
  onPrev: () => void
  onToggle: () => void
  onNext: () => void
  onVol: (v: number) => void
}

/* 控制区：进度条（可拖拽滑动）+ 时间 + 随机/上一首/播放/下一首/音量
   memo：进度高频更新时只重渲本组件 */
export const MpControls = memo(function MpControls(props: MpControlsProps) {
  const {
    pct, time, duration, vol, volPct, shuffle, playing, seekBarRef,
    onSeekTo, onToggleShuffle, onPrev, onToggle, onNext, onVol,
  } = props

  const dragging = useRef(false)

  const ratioFromX = (clientX: number) => {
    const el = seekBarRef.current
    if (!el) return 0
    const r = el.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width))
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    onSeekTo(ratioFromX(e.clientX))
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    onSeekTo(ratioFromX(e.clientX))
  }
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = false
    ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
  }

  return (
    <>
      <div className="px-5 pt-2">
        <div
          ref={seekBarRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative h-5 flex items-center cursor-pointer group touch-none select-none"
          role="slider"
          aria-label="播放进度"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ touchAction: 'none' }}
        >
          <div className="w-full h-[3px] rounded-full bg-[var(--surface-4)] overflow-hidden group-hover:h-[5px] group-active:h-[5px] transition-all">
            <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex justify-between text-[10px] font-mono text-[var(--ink-tertiary)] pb-2">
          <span>{time}</span>
          <span>{duration}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-4 pb-4 pt-1">
        <button
          onClick={onToggleShuffle}
          className={
            'p-2 rounded-full transition-colors ' +
            (shuffle ? 'text-[var(--accent)]' : 'text-[var(--ink-subtle)] hover:text-[var(--ink)]')
          }
          aria-label="随机播放"
        >
          <Shuffle className="w-4 h-4" />
        </button>
        <button
          onClick={onPrev}
          className="p-2.5 sm:p-2 rounded-full text-[var(--ink-subtle)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
          aria-label="上一首"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={onToggle}
          className="w-11 h-11 shrink-0 mx-auto flex items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[0_4px_16px_color-mix(in_srgb,var(--accent)_22%,transparent)] hover:bg-[var(--accent-hover)] transition-colors"
          aria-label={playing ? '暂停' : '播放'}
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-[1px]" />}
        </button>
        <button
          onClick={onNext}
          className="p-2.5 sm:p-2 rounded-full text-[var(--ink-subtle)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
          aria-label="下一首"
        >
          <SkipForward className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5 pl-1">
          <Volume2 className="w-3.5 h-3.5 text-[var(--ink-subtle)] shrink-0" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={vol}
            onChange={(e) => onVol(parseFloat(e.target.value))}
            className="mp-range w-20 sm:w-16"
            aria-label="音量"
            style={{ touchAction: 'none', background: `linear-gradient(to right, var(--accent) ${volPct}%, var(--surface-4) ${volPct}%)` }}
          />
        </div>
      </div>
    </>
  )
})