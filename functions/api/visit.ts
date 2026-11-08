/* 访问量统计 —— Cloudflare Pages Functions + D1
 *
 * POST /api/visit  { path }   每次页面进入记一笔
 * GET  /api/visit             总数 / 今日 / 近 30 天 / 最近 12 笔
 *
 * 隐私：不存原始 IP，只存 sha256(SALT + cf-connecting-ip) 用于 60 秒防刷；
 *       不存 UA、Cookie、昵称或任何能把两笔记录关联到同一个人的标识。
 * 响应 private, no-store：计数页要看到刚点进来的那一笔。
 */

interface Env {
  COMMENTS_DB: D1Database
}

type PagesFunction<E> = (ctx: { request: Request; env: E }) => Promise<Response>

/* D1 的最小类型声明（不引 workers-types，保持依赖干净）。
   prepare() 本身就带 all/first/run，bind() 只是加参数后返回同类 statement——
   无参查询直接 .first() 是合法的，之前把方法只挂在 bind 返回值上会报类型错。 */
interface D1Statement {
  bind(...v: unknown[]): D1Statement
  all<T>(): Promise<{ results: T[] | null }>
  first<T>(): Promise<T | null>
  run(): Promise<{ success: boolean }>
}
interface D1Database {
  prepare(sql: string): D1Statement
}

const SALT = 'embers-visit-v1::guanjin2011.de5.net'
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 20

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'private, no-store',
      'x-content-type-options': 'nosniff',
    },
  })

/* 北京时间（UTC+8）的日历日 */
function beijingDay(ts: number): string {
  return new Date(ts + 8 * 3600 * 1000).toISOString().slice(0, 10)
}

async function ipHash(request: Request): Promise<string> {
  const ip = request.headers.get('cf-connecting-ip') || '0.0.0.0'
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(SALT + ip))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let input: { path?: unknown }
  try {
    input = await request.json()
  } catch {
    input = {}
  }
  const path = (typeof input.path === 'string' ? input.path : '/')
    .replace(/[\u0000-\u001f]+/g, '')
    .slice(0, 120) || '/'

  const ip = await ipHash(request)
  const now = Date.now()

  /* 防脚本刷量：同一出口 IP 一分钟最多 20 笔，正常翻页碰不到 */
  const { results: recent } = await env.COMMENTS_DB.prepare(
    'SELECT ts FROM visits WHERE ip_hash = ? AND ts > ?',
  )
    .bind(ip, now - RATE_WINDOW_MS)
    .all<{ ts: number }>()
  if ((recent ?? []).length >= RATE_MAX) return json({ ok: false, error: 'slow down' }, 429)

  const r = await env.COMMENTS_DB.prepare(
    'INSERT INTO visits (ts, day, path, ip_hash) VALUES (?, ?, ?, ?)',
  )
    .bind(now, beijingDay(now), path, ip)
    .run()
  if (!r.success) return json({ ok: false }, 500)
  return json({ ok: true })
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const now = Date.now()
  const total = await env.COMMENTS_DB.prepare('SELECT COUNT(*) AS n FROM visits').first<{ n: number }>()
  const today = await env.COMMENTS_DB.prepare('SELECT COUNT(*) AS n FROM visits WHERE day = ?')
    .bind(beijingDay(now))
    .first<{ n: number }>()
  /* 「来过的人」：同一 IP 在同一天里多次进入只算一次，跨天算两次。
     只用不可逆哈希做去重，不还原任何人的身份。 */
  const unique = await env.COMMENTS_DB.prepare(
    'SELECT COUNT(*) AS n FROM (SELECT DISTINCT day, ip_hash FROM visits)',
  ).first<{ n: number }>()

  const { results: days } = await env.COMMENTS_DB.prepare(
    'SELECT day, COUNT(*) AS n FROM visits WHERE ts > ? GROUP BY day ORDER BY day ASC',
  )
    .bind(now - 30 * 86400000)
    .all<{ day: string; n: number }>()
  const { results: recent } = await env.COMMENTS_DB.prepare(
    'SELECT ts, path FROM visits ORDER BY ts DESC LIMIT 12',
  ).all<{ ts: number; path: string }>()

  return json({
    total: total?.n ?? 0,
    today: today?.n ?? 0,
    unique: unique?.n ?? 0,
    days: (days ?? []).map((d) => ({ day: d.day, n: d.n })),
    recent: (recent ?? []).map((r) => ({ ts: r.ts, path: r.path })),
  })
}
