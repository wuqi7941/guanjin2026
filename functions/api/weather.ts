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

/* BigDataCloud 用 zh 会吐繁体（黃浦區），统一成简体，纸墨排版才顺 */
function simplify(s: string): string {
  const map: Record<string, string> = {
    黃: '黄', 區: '区', 縣: '县', 臺: '台', 灣: '湾', 滬: '沪', 廣: '广', 東: '东',
    寧: '宁', 蘇: '苏', 陝: '陕', 龍: '龙', 鳳: '凤', 陽: '阳', 陰: '阴', 鎮: '镇',
    鄉: '乡', 橋: '桥', 門: '门', 開: '开', 關: '关', 雲: '云', 慶: '庆', 瀋: '沈',
  }
  return s.replace(/[黃區縣臺灣滬廣東寧蘇陝龍鳳陽陰鎮鄉橋門開關雲慶瀋]/g, (c) => map[c] ?? c)
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
    return /[\u4e00-\u9fff]/.test(pick) ? simplify(pick) : ''
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
  const url = new URL(request.url)
  const qLat = Number(url.searchParams.get('lat'))
  const qLon = Number(url.searchParams.get('lon'))
  const place = (url.searchParams.get('place') || '').trim().slice(0, 24)
  const hasCoords =
    url.searchParams.has('lat') &&
    url.searchParams.has('lon') &&
    Number.isFinite(qLat) &&
    Number.isFinite(qLon) &&
    Math.abs(qLat) <= 90 &&
    Math.abs(qLon) <= 180

  const cf = (request as Request & { cf?: CfGeo }).cf
  const ipLat = Number(cf?.latitude)
  const ipLon = Number(cf?.longitude)
  const lat = hasCoords ? qLat : ipLat
  const lon = hasCoords ? qLon : ipLon
  /* 本地 dev / 边缘没给地理信息时不猜城市，直接降级 */
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return json({ ok: false, reason: 'no-geo' })
  }

  /* IP 出口定位会被代理 / 运营商 NAT 带偏（人在广西，出口可能在江苏），
     所以只有「浏览器已授权定位」或「手动指定地区」才显示地名。
     纯 IP 回退只给温度，句子说「你那边」，绝不报一个错的区县。 */
  const geoSource = hasCoords ? (place ? 'manual' : 'coords') : 'ip'
  const displayPlace = place ? simplify(place) : ''
  const q = `latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}`
  /* 地名反查与天气查询并行；手动指定时不用反查，IP 回退时不反查 */
  const countyPromise = place || !hasCoords ? Promise.resolve('') : countyOf(lat, lon)
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
          city: hasCoords ? (cf?.city ?? '') : '',
          county: await countyPromise,
          place: displayPlace || (await countyPromise),
          geoSource,
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
          city: hasCoords ? (cf?.city ?? '') : '',
          county: await countyPromise,
          place: displayPlace || (await countyPromise),
          geoSource,
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
