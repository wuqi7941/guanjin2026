import { memo, useEffect, useState } from 'react'
import { Disc3 } from 'lucide-react'

interface MpCoverProps {
  cover: string
  title: string
  playing: boolean
}

/* 面板封面大图 + 播放中的 EQ 徽章（memo：进度更新不重渲） */
function MpCoverInner({ cover, title, playing }: MpCoverProps) {
  /* 外链封面可能 404/防盗链：加载失败回退到 No Cover 占位，
     否则一直显示破图（cover 字符串非空时原先走不到占位分支）。
     换歌时重置——上一首的封面失败不代表这一首也失败 */
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [cover])
  const showImg = cover && !failed

  return (
    <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--surface-2)] border border-[var(--hairline)]">
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[var(--ink-tertiary)]">
          <Disc3 className="w-10 h-10" />
          <span className="text-xs font-mono uppercase tracking-[0.2em]">No Cover</span>
        </div>
      )}
      {playing && showImg && (
        <span className="absolute bottom-2 right-2 flex items-end gap-[2px] h-4 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="mp-eq-bar w-[3px] rounded-full bg-white" />
          ))}
        </span>
      )}
    </div>
  )
}

export const MpCover = memo(MpCoverInner)