/* 余烬评论 API —— Cloudflare Pages Functions + D1
 *
 * GET    /api/comments?slug=xxx       列出某篇文章的评论
 * POST   /api/comments                发评论 { slug, name, body, replyTo?, avatar }
 * DELETE /api/comments?id=123         删除自己的评论，凭据走 x-ember-secret 请求头
 *
 * 免登录：读者挑一个头像、昵称可留空。防刷靠 IP 哈希频率限制 + 长度限制，不存原始 IP。
 *
 * 2026-11 改动（可读性优先，行为向后兼容）：
 *   · 删掉 access-control-allow-origin: * —— 全站同源调用，开放通配等于允许任何站点
 *     借读者的 IP 刷评论、读评论区；
 *   · 删除凭据从 URL query 挪到请求头，不再进服务器日志 / Referer / 浏览器历史；
 *   · 限流从「先 SELECT 再 INSERT」改成单条条件 INSERT，两者之间不再有竞态窗口；
 *   · SALT 支持 env.IP_SALT 覆盖（老值保留为默认，已发出去的删除凭据不会因此失效）。
 */

interface Env {
  COMMENTS_DB: D1Database
  IP_SALT?: string
}

type PagesFunction<E> = (ctx: { request: Request; env: E }) => Promise<Response>

/* D1 的最小类型声明（不引 workers-types，保持依赖干净） */
interface D1Database {
  prepare(sql: string): {
    bind(...v: unknown[]): {
      all<T>(): Promise<{ results: T[] | null }>
      first<T>(): Promise<T | null>
      run(): Promise<{ success: boolean; meta: { changes: number; last_row_id: number } }>
    }
  }
}

/* 默认盐保留旧值：换成新盐会让所有历史 ip_hash 失效（限流窗口重置一次，
   影响只是「刚发过的人能立刻再发一条」，但没必要为了洁癖让老数据对不上）。
   想彻底私有化就在 CF Pages 的环境变量里加 IP_SALT。 */
const DEFAULT_SALT = 'embers-cmt-v1::guanjin2011.de5.net'
const NAME_MAX = 12
const BODY_MAX = 500
const BODY_MIN = 1
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 2
const PER_SLUG_MAX = 500
const AVATAR_MAX = 11

const json = (data: unknown, status = 200, cacheable = false) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      /* 只有列表 GET 允许边缘缓存 30 秒——评论不必毫秒级新鲜，
         但每个访客每次进文章都打 D1 就浪费了。
         POST 回包里带删除凭据 secret，DELETE 是写操作；两者成功时同样是 200，
         早先只按状态码判缓存会把它们也标成 public，一律改成 no-store。 */
      'cache-control':
        cacheable && status === 200
          ? 'public, max-age=30, stale-while-revalidate=300'
          : 'no-store',
      'x-content-type-options': 'nosniff',
    },
  })

async function ipHash(request: Request, salt: string): Promise<string> {
  const ip = request.headers.get('cf-connecting-ip') || '0.0.0.0'
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ip))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

const clean = (s: unknown, max: number) =>
  String(s ?? '')
    .replace(/[\u0000-\u001f]+/g, ' ')
    .trim()
    .slice(0, max)

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, {
    status: 204,
    /* 有意不发 access-control-allow-origin：同源请求不需要预检，
       发出去只会让跨源站点也能调这个接口。 */
    headers: { allow: 'GET, POST, DELETE, OPTIONS' },
  })

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const slug = new URL(request.url).searchParams.get('slug') || ''
  if (!/^[a-z0-9-]{1,64}$/.test(slug)) return json({ error: 'bad slug' }, 400)

  const { results } = await env.COMMENTS_DB.prepare(
    'SELECT id, name, body, reply_to, avatar, created_at FROM comments WHERE slug = ? ORDER BY created_at ASC, id ASC LIMIT 500',
  )
    .bind(slug)
    .all<{ id: number; name: string; body: string; reply_to: number | null; avatar: number | null; created_at: number }>()

  return json({
    comments: (results ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      body: r.body,
      replyTo: r.reply_to,
      avatar: r.avatar,
      createdAt: r.created_at,
    })),
  }, 200, true)
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let input: { slug?: string; name?: string; body?: string; replyTo?: number; avatar?: number }
  try {
    input = await request.json()
  } catch {
    return json({ error: 'bad json' }, 400)
  }

  const slug = clean(input.slug, 64)
  if (!/^[a-z0-9-]{1,64}$/.test(slug)) return json({ error: 'bad slug' }, 400)

  const name = clean(input.name, NAME_MAX) || '匿名'
  const body = clean(input.body, BODY_MAX)
  if (body.length < BODY_MIN) return json({ error: '内容是空的' }, 400)
  const replyTo = typeof input.replyTo === 'number' && input.replyTo > 0 ? Math.floor(input.replyTo) : null
  /* 头像：0–11 的索引，必填（前端强制选择），越界一律拒绝 */
  const avatar =
    typeof input.avatar === 'number' && Number.isInteger(input.avatar) && input.avatar >= 0 && input.avatar <= AVATAR_MAX
      ? input.avatar
      : null

  const ip = await ipHash(request, env.IP_SALT || DEFAULT_SALT)

  /* 回复目标必须真实存在（这条先查，因为要给出明确错误） */
  if (replyTo != null) {
    const parent = await env.COMMENTS_DB.prepare('SELECT id FROM comments WHERE id = ? AND slug = ?')
      .bind(replyTo, slug)
      .first<{ id: number }>()
    if (!parent) return json({ error: '要回复的评论不存在' }, 400)
  }

  const secret = crypto.randomUUID()
  const createdAt = Date.now()

  /* 限流 + 单篇上限 + 写入，压进一条语句。
     原先「SELECT 数一下再 INSERT」两步之间有窗口，并发双击可以同时越过 2 条/分钟。
     现在 WHERE 子句里的两个子查询和 INSERT 在同一个事务里求值，changes = 0 就是被拦了。 */
  const r = await env.COMMENTS_DB.prepare(
    `INSERT INTO comments (slug, name, body, reply_to, secret, ip_hash, avatar, created_at)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?
     WHERE (SELECT COUNT(*) FROM comments WHERE ip_hash = ? AND created_at > ?) < ?
       AND (SELECT COUNT(*) FROM comments WHERE slug = ?) < ?`,
  )
    .bind(
      slug, name, body, replyTo, secret, ip, avatar, createdAt,
      ip, createdAt - RATE_WINDOW_MS, RATE_MAX,
      slug, PER_SLUG_MAX,
    )
    .run()

  if (!r.success) return json({ error: '写入失败' }, 500)

  if (!r.meta.changes) {
    /* 没写进去：再查一次是为了给出人话，不是二次校验（这次结果不参与放行） */
    const recent = await env.COMMENTS_DB.prepare(
      'SELECT COUNT(*) AS n FROM comments WHERE ip_hash = ? AND created_at > ?',
    )
      .bind(ip, createdAt - RATE_WINDOW_MS)
      .first<{ n: number }>()
    if ((recent?.n ?? 0) >= RATE_MAX) return json({ error: '说太多啦，歇一分钟' }, 429)
    return json({ error: '这一页的火堆已经堆满了' }, 409)
  }

  return json({ id: r.meta.last_row_id, name, body, replyTo, avatar, createdAt, secret }, 200)
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const id = Number(url.searchParams.get('id'))
  /* 凭据只从请求头取。走 query 会留在 Cloudflare 日志、浏览器历史和 Referer 里。
     为了兼容已经写进老版本 localStorage 的调用方，这里保留一次 query 兜底——
     下一次前端发版后可以删掉。 */
  const secret = request.headers.get('x-ember-secret') || url.searchParams.get('secret') || ''
  if (!id || !secret) return json({ error: '缺参数' }, 400)

  const row = await env.COMMENTS_DB.prepare('SELECT id, secret FROM comments WHERE id = ?').bind(id).first<{
    id: number
    secret: string
  }>()
  if (!row) return json({ error: '评论不存在' }, 404)
  if (row.secret !== secret) return json({ error: '不是你的评论' }, 403)

  const r = await env.COMMENTS_DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run()
  if (!r.success) return json({ error: '删除失败' }, 500)
  return json({ ok: true })
}
