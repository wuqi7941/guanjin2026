'use client'

import { useEffect } from 'react'
import { bumpVisit, collectEgg, isNightNow } from '@/lib/eggs'

/* 无 UI：到访计数 + 与时间有关的暗语（深夜 / 重逢 / 初雪 / 四点零四） */
export function EggTracker() {
  useEffect(() => {
    const n = bumpVisit()
    if (n >= 3) collectEgg('reunion')
    if (isNightNow()) collectEgg('night')

    const now = new Date()
    /* 十二月里来过一次 */
    if (now.getMonth() === 11) collectEgg('snow')
    /* 04:04 —— 《凌晨四点的城市》是这么来的 */
    if (now.getHours() === 4 && now.getMinutes() === 4) collectEgg('fourofour')

    /* 页面开着跨过 04:04 也算 */
    const timer = window.setInterval(() => {
      const t = new Date()
      if (t.getHours() === 4 && t.getMinutes() === 4) collectEgg('fourofour')
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  return null
}
