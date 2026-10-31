import { memo } from 'react'
import { Music2 } from 'lucide-react'

export interface LrcLine {
  t: number
  txt: string
}

interface MpLyricsProps {
  lines: LrcLine[]
  active: number
}

/* 歌词列表：当前行高亮 + 邻近行渐变 + 由父组件滚动容器跟随（memo：进度更新不重渲歌词） */
function MpLyricsInner({ lines, active }: MpLyricsProps) {
  return (
    <div className="relative px-2 py-2">
      {lines.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center gap-1 text-center">
          <Music2 className="w-5 h-5 text-[var(--ink-tertiary)]" />
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--ink-tertiary)]">No Lyrics</p>
        </div>
      ) : (
        <div className="py-2">
          {lines.map((l, i) => (
            <p
              key={i}
              data-lrc-active={i === active ? 'true' : undefined}
              className={
                'mp-lrc-ln px-3 py-[5px] text-sm leading-6 transition-all duration-300 rounded-lg ' +
                (i === active
                  ? 'text-[var(--accent)] font-medium text-[15px]'
                  : Math.abs(i - active) <= 2
                    ? 'text-[var(--ink-subtle)]'
                    : 'text-[var(--ink-tertiary)]')
              }
            >
              {l.txt}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export const MpLyrics = memo(MpLyricsInner)