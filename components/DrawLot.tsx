'use client'

import { useState } from 'react'
import { ScrollText } from 'lucide-react'
import { collectEgg } from '@/lib/eggs'

/* 抽一根签：从全部文章里随机抽一篇。
   点下去先停 0.5 秒（让按钮给个反馈），再走全站统一的墨染跳转。 */
export function DrawLot({ slugs }: { slugs: string[] }) {
  const [drawn, setDrawn] = useState(false)

  const draw = () => {
    if (!slugs.length || drawn) return
    setDrawn(true)
    const slug = slugs[Math.floor(Math.random() * slugs.length)]
    /* 暗语「缘分」：连续两次抽到同一篇 */
    try {
      if (localStorage.getItem('embers_last_draw') === slug) collectEgg('fate')
      localStorage.setItem('embers_last_draw', slug)
    } catch {
      /* ignore */
    }
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('embers-navigate', { detail: `/blog/${slug}/` }))
      window.setTimeout(() => setDrawn(false), 900)
    }, 480)
  }

  return (
    <button
      type="button"
      className={`draw-lot${drawn ? ' is-drawn' : ''}`}
      onClick={draw}
      aria-label="随机抽一篇文章"
      title="从全部文章里随机抽一篇"
    >
      <ScrollText className="w-3.5 h-3.5" aria-hidden />
      {drawn ? '正在拆签…' : '抽一根签'}
    </button>
  )
}
