'use client'

/* 评论区：发在 Cloudflare D1 里（Pages Functions + 自建 API），免登录。
   读者自己起昵称，昵称决定头像；说过一次会被记住，下次自动带出来。
   （2026-11-02：giscus 分支整体移除，改用单一评论区。） */

import { EASE } from '@/lib/motion'
import { useEffect, useRef, useState } from 'react'
import { m, AnimatePresence, useReducedMotion } from 'framer-motion'
import { CornerUpLeft, Loader2, MessageCircle, Send, Trash2 } from 'lucide-react'

interface Reply {
  n: string
  t: string
  d: number
  avatar?: number
}

interface CommentItem {
  n: string
  t: string
  d: number
  r: Reply[]
  /* 云端主评论的真实 id：删除时用它 + 本地存的 secret */
  id?: number
  /* 头像索引：旧数据（2026-11-02 前）没有这个字段，按名字哈希兜底 */
  avatar?: number | null
}

interface CloudComment {
  id: number
  name: string
  body: string
  replyTo: number | null
  avatar: number | null
  createdAt: number
}

/* 头像不再自动哈希生成——读者从这 12 个里挑一个，名字和颜色固定成对 */
const AVATARS: Array<{ emoji: string; color: string }> = [
  { emoji: '🦊', color: '#ff6a3d' },
  { emoji: '🐱', color: '#ffb020' },
  { emoji: '🐻', color: '#a4703d' },
  { emoji: '🐸', color: '#a0d860' },
  { emoji: '🐼', color: '#8b7bff' },
  { emoji: '🐙', color: '#ff5d8f' },
  { emoji: '🦉', color: '#3fb6ff' },
  { emoji: '🐰', color: '#f7b3c8' },
  { emoji: '🐯', color: '#e8a34d' },
  { emoji: '🦄', color: '#b98ff2' },
  { emoji: '🐳', color: '#5ad0e8' },
  { emoji: '🦋', color: '#7ee081' },
]
const NAME_KEY = 'embers_cmt_name'
const AVATAR_KEY = 'embers_cmt_avatar'
const NAME_MAX = 12

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function avatarOf(name: string): { emoji: string; color: string } {
  /* 旧数据兜底：2026-11-02 前的评论没存 avatar，按名字哈希出一个近似观感 */
  const h = hashStr(name || '匿名')
  return AVATARS[h % AVATARS.length]
}

function timeAgo(ts: number): string {
  const d = Date.now() - ts
  if (d < 6e4) return '刚刚'
  if (d < 36e5) return `${Math.floor(d / 6e4)} 分钟前`
  if (d < 864e5) return `${Math.floor(d / 36e5)} 小时前`
  if (d < 6048e5) return `${Math.floor(d / 864e5)} 天前`
  const dt = new Date(ts)
  return `${dt.getMonth() + 1}月${dt.getDate()}日`
}

const emptyState = '还没有人说话。你是第一个。'

export function Comments({ slug }: { slug: string }) {
  const reduce = !!useReducedMotion()

  const [items, setItems] = useState<CommentItem[]>([])
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<number | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [confirmDel, setConfirmDel] = useState<number | null>(null)
  const [secrets, setSecrets] = useState<Record<string, string>>({})
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  const SECRETS_KEY = `embers_cmt_secret_${slug}`

  /* 昵称与头像：说过 / 选过一次就记住 */
  useEffect(() => {
    try {
      const savedName = localStorage.getItem(NAME_KEY)
      if (savedName) setName(savedName)
      const savedAv = parseInt(localStorage.getItem(AVATAR_KEY) || '', 10)
      if (Number.isInteger(savedAv) && savedAv >= 0 && savedAv < AVATARS.length) setAvatar(savedAv)
    } catch {
      /* ignore */
    }
  }, [])

  const commitName = (v: string) => {
    setName(v)
    try {
      localStorage.setItem(NAME_KEY, v)
    } catch {
      /* ignore */
    }
  }

  const commitAvatar = (i: number) => {
    setAvatar(i)
    try {
      localStorage.setItem(AVATAR_KEY, String(i))
    } catch {
      /* ignore */
    }
  }

  const rememberSecret = (id: number, secret: string) => {
    try {
      const raw = localStorage.getItem(SECRETS_KEY)
      const map: Record<string, string> = raw ? JSON.parse(raw) : {}
      map[String(id)] = secret
      localStorage.setItem(SECRETS_KEY, JSON.stringify(map))
      setSecrets(map)
    } catch {
      /* ignore */
    }
  }
  const ownSecret = (c: CommentItem): string | undefined =>
    c.id && secrets[String(c.id)] ? secrets[String(c.id)] : undefined

  /* 云端扁平列表 → 树（回复归位到父评论的 r 里），新的在前 */
  const toTree = (flat: CloudComment[]): CommentItem[] => {
    const top: CommentItem[] = []
    const byId = new Map<number, CommentItem>()
    for (const f of flat) {
      const item: CommentItem = { n: f.name, t: f.body, d: f.createdAt, r: [], id: f.id, avatar: f.avatar }
      const parent = f.replyTo ? byId.get(f.replyTo) : undefined
      if (parent) parent.r.push({ n: item.n, t: item.t, d: item.d, avatar: item.avatar ?? undefined })
      else top.push(item)
      byId.set(f.id, item)
    }
    return top.reverse()
  }

  /* 加载评论 */
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErr('')
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return
        setItems(toTree((j.comments ?? []) as CloudComment[]))
        try {
          setSecrets(JSON.parse(localStorage.getItem(SECRETS_KEY) || '{}'))
        } catch {
          /* ignore */
        }
      })
      .catch(() => !cancelled && setErr('评论加载失败，稍后再试'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const publish = () => {
    const t = text.trim()
    if (!t || sending) return
    if (avatar === null) {
      setErr('先挑一个头像，再说话')
      return
    }
    setSending(true)
    setErr('')
    fetch('/api/comments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, name: name.trim() || '匿名', body: t, avatar }),
    })
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) {
          setErr(j.error || '发布失败')
          return
        }
        rememberSecret(j.id, j.secret)
        setItems((prev) => [{ n: j.name, t: j.body, d: j.createdAt, r: [], id: j.id, avatar: j.avatar }, ...prev])
        setText('')
        setSent(true)
        window.setTimeout(() => setSent(false), 1600)
      })
      .catch(() => setErr('网络不通，稍后再试'))
      .finally(() => setSending(false))
  }

  const replyTo = (d: number) => {
    if (replyingTo === d) {
      setReplyingTo(null)
      setReplyText('')
      return
    }
    setReplyingTo(d)
    setReplyText('')
  }

  const submitReply = (d: number) => {
    const t = replyText.trim()
    if (!t || sending) return
    if (avatar === null) {
      setErr('先挑一个头像，再说话')
      return
    }
    const parent = items.find((c) => c.d === d)
    if (!parent?.id) {
      setErr('要回复的评论已不存在')
      return
    }
    setSending(true)
    setErr('')
    fetch('/api/comments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, name: name.trim() || '匿名', body: t, replyTo: parent.id, avatar }),
    })
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) {
          setErr(j.error || '回复失败')
          return
        }
        rememberSecret(j.id, j.secret)
        setItems((prev) =>
          prev.map((c) =>
            c.d === d ? { ...c, r: [...c.r, { n: j.name, t: j.body, d: j.createdAt, avatar: j.avatar }] } : c,
          ),
        )
        setReplyingTo(null)
        setReplyText('')
      })
      .catch(() => setErr('网络不通，稍后再试'))
      .finally(() => setSending(false))
  }

  const remove = (d: number) => {
    const target = items.find((c) => c.d === d)
    const secret = target?.id ? secrets[String(target.id)] : undefined
    if (!target?.id || !secret) {
      setErr('删除失败')
      return
    }
    fetch(`/api/comments?id=${target.id}&secret=${encodeURIComponent(secret)}`, { method: 'DELETE' })
      .then((r) => {
        if (!r.ok) setErr('删除失败')
        else setItems((prev) => prev.filter((c) => c.d !== d))
      })
      .catch(() => setErr('网络不通，稍后再试'))
  }

  const anim = reduce
    ? undefined
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.35, ease: EASE },
      }

  return (
    <section aria-label="评论区" className="mt-16 pt-10 border-t border-dashed border-[var(--hairline)]">
      <header className="mb-6">
        <h2 className="flex items-center gap-2.5 text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[var(--ink)]">
          <MessageCircle className="w-6 h-6 text-[var(--accent)]" aria-hidden />
          评论区
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-subtle)] max-w-[52ch]">
          不是留言板，是火堆旁。留个名字，或者不留——观烬会回。
        </p>
      </header>

      {loading && (
        <p className="mb-4 text-xs font-mono text-[var(--ink-tertiary)]" role="status">
          正在搬火堆…
        </p>
      )}
      {err && (
        <p className="mb-4 text-xs text-[var(--accent)]" role="alert">
          {err}
        </p>
      )}

      <m.div {...anim}>
        <div className="rounded-2xl card-static p-5 sm:p-6 min-h-[180px]">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              publish()
            }}
            className="flex flex-col gap-3"
          >
            {/* 头像：强制选择，选过的自动带出 */}
            <div role="radiogroup" aria-label="挑一个头像">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono text-[var(--ink-tertiary)]">
                  {avatar === null ? '挑一个头像（必选）' : '你的头像'}
                </span>
                {avatar !== null && (
                  <span className="text-[11px] text-[var(--ink-subtle)]">
                    {name.trim() ? `${name.trim().slice(0, NAME_MAX)} · ${AVATARS[avatar].emoji}` : '匿名 · ' + AVATARS[avatar].emoji}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((a, i) => {
                  const picked = avatar === i
                  return (
                    <button
                      key={a.emoji + i}
                      type="button"
                      role="radio"
                      aria-checked={picked}
                      aria-label={`头像：${a.emoji}`}
                      onClick={() => commitAvatar(i)}
                      className={`w-10 h-10 grid place-items-center rounded-xl text-lg transition-all duration-200 active:scale-[0.94] ${
                        picked
                          ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--surface-1)] scale-105'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ background: a.color, boxShadow: picked ? `0 4px 14px -6px ${a.color}` : undefined }}
                    >
                      <span aria-hidden>{a.emoji}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor={`cmt-name-${slug}`} className="text-[11px] font-mono text-[var(--ink-tertiary)]">
                昵称
              </label>
              <input
                id={`cmt-name-${slug}`}
                value={name}
                onChange={(e) => commitName(e.target.value)}
                maxLength={NAME_MAX}
                placeholder="留空就叫匿名"
                autoComplete="nickname"
                /* 手机端 16px：更小的字号会让 iOS 聚焦时自动放大页面 */
                className="w-40 px-3.5 py-2 rounded-xl text-[16px] sm:text-sm bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink)] placeholder:text-[var(--ink-tertiary)] outline-none transition-colors duration-200 focus:border-[var(--accent)]"
              />
              <span className="text-[11px] text-[var(--ink-tertiary)]">名字可留空，头像必须挑一个</span>
            </div>
            <label htmlFor={`cmt-text-${slug}`} className="sr-only">
              留言内容
            </label>
            <textarea
              id={`cmt-text-${slug}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                /* 桌面：Ctrl/Cmd+Enter 直接发送 */
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault()
                  publish()
                }
              }}
              rows={3}
              maxLength={500}
              placeholder="写点什么… 别太客气。（Ctrl+Enter 发送）"
              className="px-3.5 py-3 rounded-xl text-[16px] sm:text-sm leading-relaxed bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink)] placeholder:text-[var(--ink-tertiary)] outline-none resize-y transition-colors duration-200 focus:border-[var(--accent)]"
            />
            {text.length > 420 && (
              <p
                aria-live="polite"
                className={`text-[11px] font-mono -mt-1.5 text-right ${text.length >= 500 ? 'text-[var(--accent)]' : 'text-[var(--ink-tertiary)]'}`}
              >
                {500 - text.length}
              </p>
            )}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-[var(--ink-subtle)]">
                {items.length > 0 ? `${items.length} 条留言` : '0 条留言'}
              </span>
              <button
                type="submit"
                disabled={sending || !text.trim()}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                      sending || !text.trim()
                        ? 'opacity-45 cursor-not-allowed'
                        : 'bg-[var(--accent)] text-white hover:opacity-90'
                    }`}
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                ) : sent ? (
                  <span aria-live="polite">已丢进火里 ✓</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" aria-hidden />
                    发布
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <ul className="mt-6 flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {items.length === 0 && !loading && (
              <m.li
                {...anim}
                className="px-5 py-8 text-center text-sm text-[var(--ink-subtle)] rounded-2xl border border-dashed border-[var(--hairline)]"
              >
                {emptyState}
              </m.li>
            )}
                {items.map((c) => {
                  /* 新评论用选定的头像；旧数据（无 avatar 字段）按名字哈希兜底 */
                  const av = typeof c.avatar === 'number' && AVATARS[c.avatar] ? AVATARS[c.avatar] : avatarOf(c.n)
                  return (
                <m.li key={c.d} layout={reduce ? undefined : true} {...anim} className="flex gap-3.5">
                  <span
                    aria-hidden
                    className="flex-none w-10 h-10 grid place-items-center rounded-xl text-lg shadow-sm"
                    style={{ background: av.color, boxShadow: `0 4px 14px -6px ${av.color}` }}
                  >
                    {av.emoji}
                  </span>
                      <div className="flex-1 min-w-0">
                        <div className="rounded-xl rounded-tl-[4px] card-static px-4 py-3">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-[13px] font-medium text-[var(--ink)] truncate max-w-[10rem]">{c.n}</span>
                            {/* 悬停显示完整日期；自己的留言带「你」标 */}
                            <time
                              dateTime={new Date(c.d).toISOString()}
                              title={new Date(c.d).toLocaleString('zh-CN')}
                              className="text-[11px] font-mono text-[var(--ink-tertiary)]"
                            >
                              {timeAgo(c.d)}
                            </time>
                            {ownSecret(c) && (
                              <span
                                aria-hidden
                                className="px-1.5 py-px rounded text-[10px] font-mono leading-relaxed bg-[var(--accent-soft)] text-[var(--accent)]"
                              >
                                你
                              </span>
                            )}
                            <span className="flex-1" />
                            <button
                              type="button"
                              onClick={() => replyTo(c.d)}
                              aria-label="回复这条留言"
                              className="-my-1 px-1.5 py-1.5 flex items-center gap-1 text-[11px] font-mono text-[var(--ink-subtle)] hover:text-[var(--accent)] transition-colors duration-200"
                            >
                              <CornerUpLeft className="w-3 h-3" aria-hidden />
                              回复
                            </button>
                        {/* 只给自己的留言显示删除（凭发评时领到的 secret） */}
                        {!ownSecret(c) ? null : confirmDel === c.d ? (
                          <span className="flex items-center gap-2" role="group" aria-label="确认删除">
                            <button
                              type="button"
                              onClick={() => {
                                remove(c.d)
                                setConfirmDel(null)
                              }}
                              className="text-[11px] font-mono text-[var(--accent)] hover:opacity-80 transition-opacity duration-200"
                            >
                              确认删除
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDel(null)}
                              className="text-[11px] font-mono text-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors duration-200"
                            >
                              取消
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDel(c.d)}
                            aria-label="删除这条留言"
                            className="flex items-center gap-1 text-[11px] font-mono text-[var(--ink-tertiary)] hover:text-[var(--accent)] transition-colors duration-200"
                          >
                            <Trash2 className="w-3 h-3" aria-hidden />
                            删除
                          </button>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-[var(--ink-muted)] whitespace-pre-wrap break-words">
                        {c.t}
                      </p>
                    </div>

                    {c.r.length > 0 && (
                      <ul className="mt-2 ml-4 flex flex-col gap-2">
                            {c.r.map((x) => {
                              const rav =
                                typeof x.avatar === 'number' && AVATARS[x.avatar] ? AVATARS[x.avatar] : avatarOf(x.n)
                          return (
                            <li key={x.d} className="flex gap-2.5">
                              <span
                                aria-hidden
                                className="flex-none w-6 h-6 grid place-items-center rounded-lg text-xs"
                                style={{ background: rav.color }}
                              >
                                {rav.emoji}
                              </span>
                              <div className="flex-1 min-w-0 rounded-lg rounded-tl-[3px] bg-[var(--surface-2)] border border-[var(--hairline)] px-3 py-2">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-[12px] font-medium text-[var(--ink)] truncate max-w-[8rem]">
                                    {x.n}
                                  </span>
                                  <time
                                    dateTime={new Date(x.d).toISOString()}
                                    className="text-[10px] font-mono text-[var(--ink-tertiary)]"
                                  >
                                    {timeAgo(x.d)}
                                  </time>
                                </div>
                                <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-muted)] whitespace-pre-wrap break-words">
                                  {x.t}
                                </p>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    )}

                    <AnimatePresence>
                      {replyingTo === c.d && (
                        <m.form
                          {...anim}
                          onSubmit={(e) => {
                            e.preventDefault()
                            submitReply(c.d)
                          }}
                          className="mt-2.5 ml-4 flex gap-2 items-start"
                        >
                          <label htmlFor={`cmt-reply-${c.d}`} className="sr-only">
                            回复内容
                          </label>
                          <input
                            id={`cmt-reply-${c.d}`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                                e.preventDefault()
                                submitReply(c.d)
                              }
                            }}
                            maxLength={200}
                            placeholder="回复…"
                            className="flex-1 min-w-0 px-3 py-2 rounded-lg text-[16px] sm:text-[13px] bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink)] placeholder:text-[var(--ink-tertiary)] outline-none transition-colors duration-200 focus:border-[var(--accent)]"
                          />
                          <button
                            type="submit"
                            disabled={!replyText.trim()}
                            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                              replyText.trim() ? 'bg-[var(--accent)] text-white hover:opacity-90' : 'opacity-45 cursor-not-allowed'
                            }`}
                          >
                            发
                          </button>
                        </m.form>
                      )}
                    </AnimatePresence>
                  </div>
                </m.li>
              )
            })}
          </AnimatePresence>
        </ul>
      </m.div>
    </section>
  )
}
