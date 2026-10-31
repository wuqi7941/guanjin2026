'use client'

import { useEffect, useState } from 'react'
import { EGGS, getCollectedEggs, type EggKey } from '@/lib/eggs'

/* 暗语全册的列表：名称 / 地点 / 做法 / 效果 + 本机点亮状态。
   与页脚收集册读同一份 localStorage，点亮这里也会跟着变。 */
export function EggBook() {
  const [got, setGot] = useState<EggKey[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const sync = () => setGot(getCollectedEggs())
    sync()
    setMounted(true)
    window.addEventListener('embers-egg', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('embers-egg', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 mb-5 pb-3 border-b border-[var(--hairline)]">
        <span className="exhibit-meta tabular-nums">
          {mounted ? String(got.length).padStart(2, '0') : '--'} / {String(EGGS.length).padStart(2, '0')} 已点亮
        </span>
        <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--ink-tertiary)]">
          LOCAL · 只记在这台设备
        </span>
      </div>

      <ol className="egg-list">
        {EGGS.map((egg, i) => {
          const on = got.includes(egg.key)
          return (
            <li key={egg.key} className={`egg-row${on ? ' is-on' : ''}`}>
              <span className="egg-no">{String(i + 1).padStart(2, '0')}</span>
              <span className="egg-dot" aria-hidden>
                {on ? '●' : '○'}
              </span>

              <div className="egg-body">
                <div className="egg-head">
                  <h2 className="egg-label">{egg.label}</h2>
                  <span className="egg-where">{egg.where}</span>
                </div>
                <p className="egg-how">{egg.how}</p>
                <p className="egg-effect">{egg.effect}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
