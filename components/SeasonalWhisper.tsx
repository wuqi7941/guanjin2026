'use client'

import { useEffect, useState } from 'react'
import { getVisits } from '@/lib/eggs'
import { NIGHT_WHISPERS, PHASE_FOOTER, SOLAR_TERMS, phaseOf } from '@/lib/copy'

function solarToday(now: Date): string | null {
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  for (const t of SOLAR_TERMS) {
    const target = new Date(now.getFullYear(), t.m - 1, t.d).getTime()
    if (Math.abs(day - target) <= 86400000) return t.line
  }
  return null
}

function whisper(): string {
  const now = new Date()
  const h = now.getHours()

  /* 深夜（0-5 点）：专属低语优先 */
  if (h >= 0 && h < 5) {
    const line = NIGHT_WHISPERS[Math.floor(Math.random() * NIGHT_WHISPERS.length)]
    return getVisits() >= 3 ? `${line} 又见面了，夜里的老朋友。` : line
  }

  /* 当天恰逢节气（前后一天）：一年只见 24 次的稀有低语 */
  const term = solarToday(now)
  if (term) return term

  /* 第 N 次到访：偶尔露一句 */
  const visits = getVisits()
  if (visits >= 3 && Math.random() < 0.22) {
    return visits >= 10
      ? `第 ${visits} 次了。这个位置，快成你的专座了。`
      : `这是你第 ${visits} 次来到火边。`
  }

  /* 常规：季节 + 时段 */
  const m = now.getMonth() // 0-11
  let seasonLine = ''
  if (m >= 2 && m <= 4) seasonLine = '春来时，纸上的字也发了芽。'
  else if (m >= 5 && m <= 7) seasonLine = '夏天的蝉声，是另一种余烬。'
  else if (m >= 8 && m <= 10) seasonLine = '秋风起，该把去年的火翻出来晒晒。'
  else seasonLine = '雪落无声，火在灰里等着。'

  /* 时段句：比季节句更贴身，按打开的那一小时换 */
  const timeLine = PHASE_FOOTER[phaseOf(now)]

  return `${seasonLine} ${timeLine}`
}

const CACHE_KEY = 'embers_whisper'

/* 同一会话内不重掷：否则每切一次页面，页脚那句话就换一次 */
function pick(): string {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) return cached
  } catch {
    /* ignore */
  }
  const line = whisper()
  try {
    sessionStorage.setItem(CACHE_KEY, line)
  } catch {
    /* ignore */
  }
  return line
}

export function SeasonalWhisper() {
  const [text, setText] = useState('')

  useEffect(() => {
    setText(pick())
  }, [])

  /* 先占住一行的高度，避免水合后页脚整体往上跳（CLS） */
  return (
    <p className="mt-6 min-h-[1.5em] text-center text-xs font-display italic text-[var(--ink-tertiary)] tracking-wide select-none">
      {text}
    </p>
  )
}
