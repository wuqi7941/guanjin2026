'use client'

import { useEffect, useState } from 'react'
import { weatherLine, type WeatherData } from '@/lib/weather'

/* 首页天气句：只请求同源 /api/weather，结果在本次会话里缓存 30 分钟。
   拿不到（本地 dev 没有 Functions / 上游超时 / 设备无地理信息）就返回 null，
   打字机照常轮播，不弹错误、不留空白、不占位。 */

const KEY = 'embers_weather'
const TTL = 30 * 60 * 1000

interface CacheEntry {
  t: number
  d: WeatherData
}

function readCache(): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const p: unknown = JSON.parse(raw)
    if (!p || typeof p !== 'object' || Array.isArray(p)) return null
    const e = p as Partial<CacheEntry>
    if (typeof e.t !== 'number' || Date.now() - e.t > TTL || !e.d || typeof e.d !== 'object') return null
    return e as CacheEntry
  } catch {
    return null
  }
}

export function useWeatherLine(): string | null {
  const [line, setLine] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    /* 失败结果也缓存：上游挂了的时候不该每次刷新都去撞一次 */
    const cached = readCache()
    if (cached) {
      setLine(weatherLine(cached.d, new Date().getDate()))
      return
    }

    const ac = new AbortController()
    const timer = window.setTimeout(() => ac.abort(), 7000)
    fetch('/api/weather', { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: WeatherData | null) => {
        if (cancelled || !d || typeof d !== 'object') return
        try {
          sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d }))
        } catch {
          /* 隐私模式：不影响这一次显示 */
        }
        setLine(weatherLine(d, new Date().getDate()))
      })
      .catch(() => {
        /* 静默降级 */
      })
      .finally(() => window.clearTimeout(timer))

    return () => {
      cancelled = true
      ac.abort()
      window.clearTimeout(timer)
    }
  }, [])

  return line
}
