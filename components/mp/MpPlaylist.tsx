import { memo } from 'react'
import { Track } from '@/lib/playlist'

interface MpPlaylistProps {
  tracks: Track[]
  idx: number
  playing: boolean
  onPlay: (i: number) => void
}

/* 歌单列表：当前曲目标记 + 播放 EQ 动效（memo：进度更新不重渲 56 行） */
function MpPlaylistInner({ tracks, idx, playing, onPlay }: MpPlaylistProps) {
  return (
    <div className="py-1">
      {tracks.map((s, i) => (
        <button
          key={i}
          onClick={() => onPlay(i)}
          className={
            'w-full flex items-center gap-3 px-3 py-[7px] rounded-lg text-left transition-colors group ' +
            (i === idx ? 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]' : 'hover:bg-[var(--surface-2)]')
          }
        >
          <span
            className={
              'w-5 text-right font-mono text-[11px] shrink-0 ' +
              (i === idx ? 'text-[var(--accent)]' : 'text-[var(--ink-tertiary)]')
            }
          >
            {i + 1}
          </span>
          {i === idx && playing ? (
            <span className="flex items-end gap-[2px] h-3 w-3.5 shrink-0">
              {[0, 1, 2, 3].map((b) => (
                <span key={b} className="mp-eq-bar w-[2px] rounded-full bg-[var(--accent)]" />
              ))}
            </span>
          ) : (
            <span className="w-3.5 shrink-0" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] leading-5 truncate text-[var(--ink)]">
              {s.t}
            </span>
            <span className="block text-[11px] leading-4 text-[var(--ink-subtle)] truncate">{s.a}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

export const MpPlaylist = memo(MpPlaylistInner)