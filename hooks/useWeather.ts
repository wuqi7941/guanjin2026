'use client'

import { useCallback, useEffect, useState } from 'react'
import { weatherLine, type WeatherData } from '@/lib/weather'

/* 首页天气句：同源 /api/weather，结果按请求 URL 在本次会话缓存 30 分钟。
   位置来源按可信度排序：手动指定 > 浏览器已授权定位 > 出口 IP（不显示地名）。
   拿不到就返回 null，打字机照常轮播，不弹错误、不留空白、不占位。 */

const KEY = 'embers_weather_v2'
const PLACE_KEY = 'embers_weather_place'
const TTL = 30 * 60 * 1000

export interface WeatherPlace {
  name: string
  lat: number
  lon: number
}

interface CacheEntry {
  t: number
  d: WeatherData
  url: string
}

function readCache(url: string): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const p: unknown = JSON.parse(raw)
    if (!p || typeof p !== 'object' || Array.isArray(p)) return null
    const e = p as Partial<CacheEntry>
    if (typeof e.t !== 'number' || Date.now() - e.t > TTL || e.url !== url || !e.d || typeof e.d !== 'object') {
      return null
    }
    return e as CacheEntry
  } catch {
    return null
  }
}

function readPlace(): WeatherPlace | null {
  try {
    const raw = localStorage.getItem(PLACE_KEY)
    if (!raw) return null
    const p: unknown = JSON.parse(raw)
    if (!p || typeof p !== 'object' || Array.isArray(p)) return null
    const x = p as Partial<WeatherPlace>
    if (
      typeof x.name !== 'string' ||
      !x.name.trim() ||
      typeof x.lat !== 'number' ||
      typeof x.lon !== 'number' ||
      !Number.isFinite(x.lat) ||
      !Number.isFinite(x.lon) ||
      Math.abs(x.lat) > 90 ||
      Math.abs(x.lon) > 180
    ) {
      return null
    }
    return { name: x.name.slice(0, 16), lat: x.lat, lon: x.lon }
  } catch {
    return null
  }
}

function writePlace(p: WeatherPlace | null) {
  try {
    if (!p) localStorage.removeItem(PLACE_KEY)
    else localStorage.setItem(PLACE_KEY, JSON.stringify(p))
  } catch {
    /* 隐私模式：这一次仍生效，只是下次不记得 */
  }
}

/* 只在「已经授权」时才取坐标：绝不弹权限框打扰读者。
   没授权就走 IP 回退，端点会隐藏地名。 */
async function coordsIfGranted(): Promise<{ lat: number; lon: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return null
  try {
    const perm = await navigator.permissions?.query({ name: 'geolocation' as PermissionName })
    if (perm?.state !== 'granted') return null
    return await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
        () => resolve(null),
        { timeout: 4000, maximumAge: 10 * 60 * 1000 },
      )
    })
  } catch {
    return null
  }
}

export function useWeatherLine() {
  const [line, setLine] = useState<string | null>(null)
  const [place, setPlaceState] = useState<WeatherPlace | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    let ac: AbortController | null = null

    const run = async () => {
      const stored = readPlace()
      setPlaceState(stored)
      let url = '/api/weather'
      if (stored) {
        url += `?lat=${stored.lat.toFixed(4)}&lon=${stored.lon.toFixed(4)}&place=${encodeURIComponent(stored.name)}`
      } else {
        const c = await coordsIfGranted()
        if (c) url += `?lat=${c.lat.toFixed(4)}&lon=${c.lon.toFixed(4)}`
      }

      const cached = readCache(url)
      if (cached) {
        if (!cancelled) setLine(weatherLine(cached.d, new Date().getDate()))
        return
      }

      ac = new AbortController()
      const timer = window.setTimeout(() => ac?.abort(), 7000)
      try {
        const r = await fetch(url, { signal: ac.signal })
        if (!r.ok) return
        const d: WeatherData = await r.json()
        if (cancelled || !d || typeof d !== 'object') return
        try {
          sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d, url }))
        } catch {
          /* ignore */
        }
        setLine(weatherLine(d, new Date().getDate()))
      } catch {
        /* 静默降级 */
      } finally {
        window.clearTimeout(timer)
      }
    }

    run()
    return () => {
      cancelled = true
      ac?.abort()
    }
  }, [nonce])

  /* 手动指定 / 恢复自动：清掉旧缓存并立刻重取 */
  const setPlace = useCallback((p: WeatherPlace | null) => {
    writePlace(p)
    setPlaceState(p)
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    setNonce((n) => n + 1)
  }, [])

  return { line, place, setPlace }
}
