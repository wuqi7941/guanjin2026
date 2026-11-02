/* 余烬评论 API —— Cloudflare Pages Functions + D1
 *
 * GET    /api/comments?slug=xxx       列出某篇文章的评论
 * POST   /api/comments                发评论 { slug, name, body, replyTo? }
 * DELETE /api/comments?id=&secret=    删除自己的评论（secret 是发评时下发的凭据）
 *
 * 免登录：读者填昵称即可。防刷靠 IP 哈希频率限制 + 长度限制，不存原始 IP。
 */

interface Env {
  COMMENTS_DB: D1Database
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

interface CommentRow {
  id: number
  slug: string
  name: string
  body: string
  reply_to: number | null
  secret: string
  created_at: number
}

const SALT = 'embers-cmt-v1::guanjin2011.de5.net'
const NAME_MAX = 12
const BODY_MAX = 500
const BODY_MIN = 1
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 2
const PER_SLUG_MAX = 500

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type',
    },
  })

async function ipHash(request: Request): Promise<string> {
  const ip = request.headers.get('cf-connecting-ip') || '0.0.0.0'
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(SALT + ip))
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
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
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
  })
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
  const AVATAR_MAX = 11
  const avatar =
    typeof input.avatar === 'number' && Number.isInteger(input.avatar) && input.avatar >= 0 && input.avatar <= AVATAR_MAX
      ? input.avatar
      : null

  const ip = await ipHash(request)

  /* 频率限制：同一个出口 IP 一分钟最多 2 条 */
  const { results: recent } = await env.COMMENTS_DB.prepare(
    'SELECT created_at FROM comments WHERE ip_hash = ? AND created_at > ?',
  )
    .bind(ip, Date.now() - RATE_WINDOW_MS)
    .all<{ created_at: number }>()
  if ((recent ?? []).length >= RATE_MAX) return json({ error: '说太多啦，歇一分钟' }, 429)

  /* 回复目标必须真实存在 */
  if (replyTo != null) {
    const parent = await env.COMMENTS_DB.prepare('SELECT id FROM comments WHERE id = ? AND slug = ?')
      .bind(replyTo, slug)
      .first<{ id: number }>()
    if (!parent) return json({ error: '要回复的评论不存在' }, 400)
  }

  /* 单篇防御性上限 */
  const cnt = await env.COMMENTS_DB.prepare('SELECT COUNT(*) AS n FROM comments WHERE slug = ?')
    .bind(slug)
    .first<{ n: number }>()
  if ((cnt?.n ?? 0) >= PER_SLUG_MAX) return json({ error: '这一页的火堆已经堆满了' }, 409)

  const secret = crypto.randomUUID()
  const createdAt = Date.now()

  const r = await env.COMMENTS_DB.prepare(
    'INSERT INTO comments (slug, name, body, reply_to, secret, ip_hash, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(slug, name, body, replyTo, secret, ip, avatar, createdAt)
    .run()

  if (!r.success) return json({ error: '写入失败' }, 500)
  return json({ id: r.meta.last_row_id, name, body, replyTo, avatar, createdAt, secret }, 200)
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const id = Number(url.searchParams.get('id'))
  const secret = url.searchParams.get('secret') || ''
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
