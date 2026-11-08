/* 天气提示 —— Cloudflare Pages Functions
 *
 * GET /api/weather → { ok, city, temp, feels, min, max, code, wind }
 *
 * 隐私边界（重要）：位置只从 Cloudflare 边缘的 request.cf 取——IP 定位本来就在边缘完成，
 * 上游天气服务只收到经纬度，收不到访客 IP、Cookie 或任何标识；前端也不存位置。
 * 响应必须是 private, no-store：/api/weather 是所有人共用的 URL，
 * 一旦标 public，边缘会把第一个访客的天气发给后面所有人。
 *
 * 主源 Open-Meteo（免费、无 key），失败降级 wttr.in，再失败返回 ok:false，
 * 前端静默不显示天气句，打字机照常轮播。没有任何密钥要配。
 */

interface CfGeo {
  latitude?: string
  longitude?: string
  city?: string
  country?: string
}

type PagesFunction = (ctx: { request: Request }) => Promise<Response>

interface OmResponse {
  current?: {
    temperature_2m?: number
    apparent_temperature?: number
    weather_code?: number
    wind_speed_10m?: number
  }
  daily?: {
    temperature_2m_min?: number[]
    temperature_2m_max?: number[]
  }
}

interface WttrResponse {
  current_condition?: Array<{ temp_C?: string; FeelsLikeC?: string; windspeedKmph?: string }>
  weather?: Array<{ mintempC?: string; maxtempC?: string }>
}

/* 县级地名反查：Cloudflare 的 cf.city 通常只到地级市，
   BigDataCloud 的 administrative 里最深那级才是区/县/旗。免费、无 key、只收经纬度。 */
interface BdcdResponse {
  locality?: string
  localityInfo?: {
    administrative?: Array<{ name?: string; adminLevel?: number }>
  }
}

async function countyOf(lat: number, lon: number): Promise<string> {
  const r = await fetchWithTimeout(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&localityLanguage=zh`,
    4500,
  )
  if (!r) return ''
  try {
    const d = (await r.json()) as BdcdResponse
    const info = d.localityInfo
    const adm = info && Array.isArray(info.administrative) ? info.administrative : []
    const deepest = adm
      .filter((a) => typeof a.name === 'string' && typeof a.adminLevel === 'number' && a.adminLevel >= 6)
      .sort((a, b) => (b.adminLevel ?? 0) - (a.adminLevel ?? 0))[0]?.name
    const pick = (d.locality || deepest || '').trim()
    /* 只认中文地名：把英文市名硬塞进中文句子，比不写还怪 */
    return /[\u4e00-\u9fff]/.test(pick) ? pick : ''
  } catch {
    return ''
  }
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'private, no-store',
      'x-content-type-options': 'nosniff',
    },
  })

async function fetchWithTimeout(url: string, ms: number): Promise<Response | null> {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), ms)
  try {
    const r = await fetch(url, {
      signal: ac.signal,
      headers: { 'user-agent': 'embers-blog/1.0 (+https://guanjin2011.de5.net)' },
    })
    return r.ok ? r : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export const onRequestGet: PagesFunction = async ({ request }) => {
  const cf = (request as Request & { cf?: CfGeo }).cf
  const lat = Number(cf?.latitude)
  const lon = Number(cf?.longitude)
  /* 本地 dev / 边缘没给地理信息时不猜城市，直接降级 */
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return json({ ok: false, reason: 'no-geo' })
  }

  const q = `latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}`
  /* 地名反查与天气查询并行，别让县级精度把首句多拖 4 秒 */
  const countyPromise = countyOf(lat, lon)
  const primary = await fetchWithTimeout(
    `https://api.open-meteo.com/v1/forecast?${q}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`,
    4500,
  )
  if (primary) {
    try {
      const d = (await primary.json()) as OmResponse
      const cur = d.current
      if (cur && typeof cur.temperature_2m === 'number' && Number.isFinite(cur.temperature_2m)) {
        return json({
          ok: true,
          city: cf?.city ?? '',
          county: await countyPromise,
          temp: cur.temperature_2m,
          feels: typeof cur.apparent_temperature === 'number' ? cur.apparent_temperature : cur.temperature_2m,
          code: typeof cur.weather_code === 'number' ? cur.weather_code : 0,
          wind: typeof cur.wind_speed_10m === 'number' ? cur.wind_speed_10m : 0,
          min: Array.isArray(d.daily?.temperature_2m_min) ? d.daily?.temperature_2m_min[0] : undefined,
          max: Array.isArray(d.daily?.temperature_2m_max) ? d.daily?.temperature_2m_max[0] : undefined,
        })
      }
    } catch {
      /* 上游返回形状不对，走备源 */
    }
  }

  /* 备源只取温度：wttr.in 的天气码不是 WMO 编码，不硬猜 */
  const backup = await fetchWithTimeout(`https://wttr.in/${lat.toFixed(3)},${lon.toFixed(3)}?format=j1`, 4500)
  if (backup) {
    try {
      const d = (await backup.json()) as WttrResponse
      const c = d.current_condition?.[0]
      const temp = Number(c?.temp_C)
      const feels = Number(c?.FeelsLikeC)
      if (Number.isFinite(temp)) {
        return json({
          ok: true,
          city: cf?.city ?? '',
          county: await countyPromise,
          temp,
          feels: Number.isFinite(feels) ? feels : temp,
          min: Number(d.weather?.[0]?.mintempC) || undefined,
          max: Number(d.weather?.[0]?.maxtempC) || undefined,
        })
      }
    } catch {
      /* ignore */
    }
  }

  return json({ ok: false, reason: 'upstream' })
}
