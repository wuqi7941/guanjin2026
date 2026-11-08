'use client'

import { useCallback, useEffect, useState } from 'react'
import { weatherLine, type WeatherData } from '@/lib/weather'

/* 首页天气句：直接向读者索取定位权限；拒绝就整条天气都不显示。
   手动指定地区优先级最高（不再弹权限框），只存在这台设备。
   拿得到坐标才请求天气，结果按 URL 在本次会话缓存 30 分钟。 */

const KEY = 'embers_weather_v2'
const PLACE_KEY = 'embers_weather_place'
const COORDS_KEY = 'embers_weather_coords'
const TTL = 30 * 60 * 1000

export interface WeatherPlace {
  name: string
  lat: number
  lon: number
}

interface Coords {
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
    /* 隐私模式：这一次仍生效 */
  }
}

function readCoords(): Coords | null {
  try {
    const raw = sessionStorage.getItem(COORDS_KEY)
    if (!raw) return null
    const p: unknown = JSON.parse(raw)
    if (!p || typeof p !== 'object' || Array.isArray(p)) return null
    const c = p as Partial<Coords> & { t?: number }
    if (
      typeof c.t !== 'number' ||
      Date.now() - c.t > TTL ||
      typeof c.lat !== 'number' ||
      typeof c.lon !== 'number' ||
      !Number.isFinite(c.lat) ||
      !Number.isFinite(c.lon)
    ) {
      return null
    }
    return { lat: c.lat, lon: c.lon }
  } catch {
    return null
  }
}

/* 主动索取定位：浏览器会弹一次权限框。拒绝 / 不支持 / 超时一律返回 null，
   调用方据此把天气整条撤掉，不再拿出口 IP 的温度糊弄人。 */
function requestCoords(): Promise<Coords | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return Promise.resolve(null)
  const cached = readCoords()
  if (cached) return Promise.resolve(cached)
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const c = { lat: p.coords.latitude, lon: p.coords.longitude }
        try {
          sessionStorage.setItem(COORDS_KEY, JSON.stringify({ ...c, t: Date.now() }))
        } catch {
          /* ignore */
        }
        resolve(c)
      },
      () => resolve(null),
      { timeout: 8000, maximumAge: TTL, enableHighAccuracy: false },
    )
  })
}

/* 同一份数据出两句不同文案，供打字机循环里交替出现，不至于像复读机 */
function makeLines(d: WeatherData): string[] {
  const day = new Date().getDate()
  const a = weatherLine(d, day)
  const b = weatherLine(d, day + 1)
  const arr = [a, b].filter((x): x is string => typeof x === 'string' && x.length > 0)
  return Array.from(new Set(arr))
}

export function useWeatherLine() {
  const [lines, setLines] = useState<string[]>([])
  const [place, setPlaceState] = useState<WeatherPlace | null>(null)
  const [denied, setDenied] = useState(false)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    let ac: AbortController | null = null

    const run = async () => {
      const stored = readPlace()
      setPlaceState(stored)
      let url: string | null = null

      if (stored) {
        setDenied(false)
        url = `/api/weather?lat=${stored.lat.toFixed(4)}&lon=${stored.lon.toFixed(4)}&place=${encodeURIComponent(stored.name)}`
      } else {
        const c = await requestCoords()
        if (!c) {
          /* 拒绝权限：不显示任何天气信息，也不再请求天气接口 */
          if (!cancelled) {
            setDenied(true)
            setLines([])
          }
          return
        }
        setDenied(false)
        url = `/api/weather?lat=${c.lat.toFixed(4)}&lon=${c.lon.toFixed(4)}`
      }

      const cached = readCache(url)
      if (cached) {
        if (!cancelled) setLines(makeLines(cached.d))
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
        setLines(makeLines(d))
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

  /* 手动指定 / 恢复自动：清缓存并立刻重取（指定后不再弹权限框） */
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

  return { lines, place, denied, setPlace }
}
