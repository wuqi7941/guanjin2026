/* 地区名 → 经纬度：给天气提示做手动纠正用。
 *
 * GET /api/geo?name=博白县 → { ok, name, lat, lon }
 *
 * 为什么要有这个：Cloudflare 的 request.cf 是「出口 IP」的位置，
 * 代理 / 运营商 NAT 会把人算到千里之外（人在广西博白，出口在江苏江宁）。
 * 让访客自己写一次县名，比猜出口准得多；结果只存在他自己浏览器里。
 * 上游只收到地名，收不到 IP、Cookie 或任何标识。
 */

type PagesFunction = (ctx: { request: Request }) => Promise<Response>

interface GeoHit {
  name?: string
  latitude?: number
  longitude?: number
  country?: string
  country_code?: string
  admin1?: string
  admin2?: string
  admin3?: string
  admin4?: string
}

interface GeoResponse {
  results?: GeoHit[]
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

const TRAD: Record<string, string> = {
  黃: '黄', 區: '区', 縣: '县', 臺: '台', 灣: '湾', 廣: '广', 東: '东', 寧: '宁',
  蘇: '苏', 陝: '陕', 龍: '龙', 陽: '阳', 鎮: '镇', 鄉: '乡', 雲: '云', 慶: '庆',
}
const simplify = (s: string) => s.replace(/[黃區縣臺灣廣東寧蘇陝龍陽鎮鄉雲慶]/g, (c) => TRAD[c] ?? c)

export const onRequestGet: PagesFunction = async ({ request }) => {
  const name = (new URL(request.url).searchParams.get('name') || '').trim().slice(0, 24)
  if (!name) return json({ ok: false, reason: 'empty' })

  /* Open-Meteo 的地名库认「博白」不认「博白县」：先查原名，再去掉行政后缀重试 */
  const suffixMatch = name.match(/[县区市旗盟]$/)
  const suffix = suffixMatch ? suffixMatch[0] : ''
  const base = suffix ? name.slice(0, -suffix.length) : name
  const queries = Array.from(new Set([name, base])).filter(Boolean)

  let hit: GeoHit | undefined
  let upstreamFailed = false
  for (const q of queries) {
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), 3500)
    try {
      const r = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=zh&format=json`,
        {
          signal: ac.signal,
          headers: { 'user-agent': 'embers-blog/1.0 (+https://guanjin2011.de5.net)' },
        },
      )
      if (!r.ok) {
        upstreamFailed = true
        break
      }
      const d = (await r.json()) as GeoResponse
      const list = (Array.isArray(d.results) ? d.results : []).filter(
        (x) => typeof x.latitude === 'number' && typeof x.longitude === 'number',
      )
      const cn = list.filter(
        (x) => x.country_code === 'CN' || (x.country ?? '').includes('中国') || /china/i.test(x.country ?? ''),
      )
      hit = cn[0] ?? list[0]
      if (hit) break
    } catch {
      upstreamFailed = true
      break
    } finally {
      clearTimeout(timer)
    }
  }
  if (!hit) return json({ ok: false, reason: upstreamFailed ? 'upstream' : 'not-found' })

  /* 上游只给到 admin2（玉林市），县级名靠输入里的后缀补回来，句子才写「博白县」 */
  const raw =
    [hit.admin3, hit.admin4, hit.name].find((v) => !!v && (v.includes(base) || base.includes(v))) ??
    hit.admin3 ??
    hit.admin4 ??
    hit.name ??
    name
  let display = String(raw)
  if (suffix && !display.endsWith(suffix) && display.includes(base)) display += suffix

  return json({
    ok: true,
    name: simplify(display).slice(0, 16),
    lat: hit.latitude,
    lon: hit.longitude,
  })
}
