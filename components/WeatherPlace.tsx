'use client'

import { useState } from 'react'
import type { WeatherPlace as Place } from '@/hooks/useWeather'

interface Props {
  place: Place | null
  onSet: (p: Place | null) => void
}

/* 地区纠正：出口 IP 会骗人，让人自己写一次县名最准。
   一行等宽小字，展开才见输入，不抢首屏；写完只记在这台设备上。 */
export function WeatherPlace({ place, onSet }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    const v = name.trim()
    if (!v || busy) return
    setBusy(true)
    setErr('')
    try {
      const r = await fetch(`/api/geo?name=${encodeURIComponent(v)}`)
      const d = await r.json()
      if (!d.ok || typeof d.lat !== 'number' || typeof d.lon !== 'number') {
        setErr('没找到这个地方，换个写法试试。')
        return
      }
      onSet({ name: d.name || v, lat: d.lat, lon: d.lon })
      setOpen(false)
      setName('')
    } catch {
      setErr('这会儿查不了，稍后再试。')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-[10px] font-mono tracking-[0.16em] text-[var(--ink-tertiary)] hover:text-[var(--accent)] transition-colors select-none"
      >
        {place ? `地区 · ${place.name}` : '地区不对？改一下'}
        <span aria-hidden className="ml-1.5">
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open && (
        <div className="card-static rounded-[var(--radius-md)] p-4 w-full max-w-xs flex flex-col gap-3">
          <div className="field">
            <input
              id="weather-place"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  submit()
                }
              }}
              placeholder=" "
              autoComplete="off"
              className="field-input"
            />
            <label htmlFor="weather-place" className="field-label">
              县 / 区名，如 博白县
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={busy || !name.trim()}
              className="px-4 py-2 rounded-full bg-[var(--accent)] text-white text-xs font-medium hover:opacity-90 disabled:opacity-45 transition-opacity"
            >
              {busy ? '查着…' : '就用这里'}
            </button>
            {place && (
              <button
                type="button"
                onClick={() => {
                  onSet(null)
                  setOpen(false)
                }}
                className="px-2 py-2 text-[11px] font-mono text-[var(--ink-tertiary)] hover:text-[var(--accent)] transition-colors"
              >
                恢复自动
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setErr('')
              }}
              className="px-2 py-2 text-[11px] font-mono text-[var(--ink-tertiary)] hover:text-[var(--ink)] transition-colors"
            >
              取消
            </button>
          </div>
          {err && (
            <p className="text-[11px] text-[var(--accent)]" role="alert">
              {err}
            </p>
          )}
          <p className="text-[10px] leading-relaxed text-[var(--ink-tertiary)]">只记在这台设备上，不会上传。</p>
        </div>
      )}
    </div>
  )
}
