/* 天气提示文案：把 /api/weather 的数值翻成一句有温度的话。
   纯函数、零依赖、不碰浏览器 API，方便单独跑用例。
   地名优先县级（区/县/旗），拿不到才退回地级市，再拿不到就说「你那边」。 */

export interface WeatherData {
  ok: boolean
  /* 手动指定或浏览器定位反查出的可信地名 */
  place?: string
  /* ip = 只用出口 IP（不显示地名）；coords / manual = 地名可信 */
  geoSource?: 'ip' | 'coords' | 'manual' | string
  county?: string
  city?: string
  temp?: number
  feels?: number
  min?: number
  max?: number
  code?: number
  wind?: number
}

function placeOf(d: WeatherData): string {
  /* 自己指定的地名最可信，优先用 */
  const manual = typeof d.place === 'string' ? d.place.trim() : ''
  if (manual && /[\u4e00-\u9fff]/.test(manual)) return manual.slice(0, 12)
  /* 出口 IP 定位会被代理 / NAT 带偏（人在广西，出口在江苏）。
     拿不到可信坐标就一律说「你那边」，绝不报一个错的区县。 */
  if (d.geoSource !== 'coords' && d.geoSource !== 'manual') return '你那边'
  const county = typeof d.county === 'string' ? d.county.trim() : ''
  if (county && /[\u4e00-\u9fff]/.test(county)) return county.slice(0, 12)
  /* 反查失败也不退回出口城市名——那又是错的地名 */
  return '你那边'
}

/* 保暖/防暑/提醒的句子：每档两句，按日期换着来，别让常客天天读同一句。
   纸墨口气，不喊口号，也不写成天气播报。 */
type LineFn = (place: string, t: number) => string

const BANDS: Array<{ max: number; fns: LineFn[] }> = [
  {
    max: 0,
    fns: [
      (p, t) => `${p}今天 ${t}°，冷得实在。把外套扣到最上面一颗，别让风钻进字里。`,
      (p, t) => `${p}今天 ${t}°，手会僵。先烤烤手，再烤烤心——火还温着。`,
    ],
  },
  {
    max: 8,
    fns: [
      (p, t) => `${p}今天 ${t}°，风里有冬意。围巾别落在椅背上。`,
      (p, t) => `${p}今天 ${t}°，凉得清脆。多穿一件，字才写得稳。`,
    ],
  },
  {
    max: 15,
    fns: [
      (p, t) => `${p}今天 ${t}°，凉。带件外套吧，冷了容易走神。`,
      (p, t) => `${p}今天 ${t}°，早晚更冷。别硬扛，添件衣服不算认输。`,
    ],
  },
  {
    max: 22,
    fns: [
      (p, t) => `${p}今天 ${t}°，早晚差得远。衣服别脱太早，火要慢慢添柴。`,
      (p, t) => `${p}今天 ${t}°，风软。适合走一段不赶时间的路。`,
    ],
  },
  {
    max: 30,
    fns: [
      (p, t) => `${p}今天 ${t}°，不冷不热。正好把步子放慢一点。`,
      (p, t) => `${p}今天 ${t}°，天光够用。别急着赶路，先看看窗外。`,
    ],
  },
  {
    max: Infinity,
    fns: [
      (p, t) => `${p}今天 ${t}°，热。记得喝水，别在太阳底下站太久。`,
      (p, t) => `${p}今天 ${t}°，火不必烧这么旺。找个阴凉处，慢慢来。`,
    ],
  },
]

/* WMO 天气码 → 一句带在温度后面的提醒。只取最要紧的一条。 */
function phenomenon(code?: number, wind?: number): string {
  if (typeof code === 'number') {
    if (code >= 95) return '有雷雨，别在树下停。'
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return '有雪，路滑，走慢些。'
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return '有雨，带把伞，别让纸淋湿。'
    if (code === 45 || code === 48) return '有雾，路上看仔细。'
  }
  if (typeof wind === 'number' && wind >= 30) return '风大，帽子戴稳。'
  return ''
}

export function weatherLine(d: WeatherData, salt = 0): string | null {
  if (!d || !d.ok || typeof d.temp !== 'number' || !Number.isFinite(d.temp)) return null

  const place = placeOf(d)
  const t = Math.round(d.temp)
  const feels = typeof d.feels === 'number' && Number.isFinite(d.feels) ? Math.round(d.feels) : t

  const band = BANDS.find((b) => t <= b.max) ?? BANDS[BANDS.length - 1]
  const idx = Math.abs(Math.round(salt) + t) % band.fns.length
  const base = band.fns[idx](place, t)

  /* 附加提醒只留一条，按「天气现象 > 体感偏冷 > 温差大」的优先级 */
  const extra =
    phenomenon(d.code, d.wind) ||
    (feels <= t - 3 ? '体感还要再低几度，别只看这个数字。' : '') ||
    (typeof d.min === 'number' && typeof d.max === 'number' && d.max - d.min >= 10
      ? '今天温差大，留一件能脱的。'
      : '')

  return extra ? base + extra : base
}
