'use client'

import { EASE } from '@/lib/motion'
import { GISCUS } from '@/lib/site'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { m, AnimatePresence, useReducedMotion } from 'framer-motion'
import { CornerUpLeft, Feather, Github, Loader2, MessageCircle, Send, Trash2 } from 'lucide-react'


interface Reply {
  n: string
  t: string
  d: number
}

interface CommentItem {
  n: string
  t: string
  d: number
  r: Reply[]
}

const AV_EMOJI = ['🦊', '🐱', '🐼', '🐸', '🐙', '🦉', '🐰', '🐻', '🐯', '🦄', '🐳', '🦋']
const AV_COLORS = ['#ff6a3d', '#8b7bff', '#28e0b0', '#ffb020', '#ff5d8f', '#3fb6ff', '#a0d860', '#ff8f4d']

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function avatarOf(name: string): { emoji: string; color: string } {
  const h = hashStr(name || '匿名')
  return { emoji: AV_EMOJI[h % AV_EMOJI.length], color: AV_COLORS[h % AV_COLORS.length] }
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
  const { resolvedTheme } = useTheme()
  const reduce = !!useReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)

  const [mode, setMode] = useState<'giscus' | 'local'>('giscus')
  /* 偏好读取完成前不挂 giscus：偏好是「匿名」的用户，首屏不该先白加载一次 giscus 再卸载 */
  const [prefReady, setPrefReady] = useState(false)
  const [gsFailed, setGsFailed] = useState(false)
  const [gsNotice, setGsNotice] = useState(false)
  const [gsLoading, setGsLoading] = useState(true)

  const [items, setItems] = useState<CommentItem[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [confirmDel, setConfirmDel] = useState<number | null>(null)

  const KEY = `embers_cmt_${slug}`
  const themeRef = useRef(resolvedTheme)
  useEffect(() => {
    themeRef.current = resolvedTheme
  }, [resolvedTheme])

  /* 模式偏好 */
  useEffect(() => {
    try {
      if (localStorage.getItem('embers_cmt_mode') === 'local') setMode('local')
    } catch {
      /* ignore */
    }
    setPrefReady(true)
  }, [])

  const switchMode = (m: 'giscus' | 'local') => {
    setMode(m)
    /* 用户手动切回 GitHub 讨论：清掉失败标记，给它一次重新加载的机会 */
    if (m === 'giscus') setGsFailed(false)
    try {
      localStorage.setItem('embers_cmt_mode', m)
    } catch {
      /* ignore */
    }
  }

  /* Giscus：动态加载，20s 超时退回本地（自动回退不持久化偏好，见下方 gsFailed effect） */
  useEffect(() => {
    if (mode !== 'giscus' || gsFailed || !prefReady) return
    const host = hostRef.current
    if (!host) return
    let cancelled = false

    host.innerHTML = ''
    setGsNotice(false)
    setGsLoading(true)

    const s = document.createElement('script')
    s.src = 'https://giscus.app/client.js'
    s.setAttribute('data-repo', GISCUS.repo)
    s.setAttribute('data-repo-id', GISCUS.repoId)
    s.setAttribute('data-category', GISCUS.category)
    s.setAttribute('data-category-id', GISCUS.categoryId)
    s.setAttribute('data-mapping', 'specific')
    s.setAttribute('data-term', slug)
    s.setAttribute('data-strict', '0')
    s.setAttribute('data-reactions-enabled', '1')
    s.setAttribute('data-emit-metadata', '0')
    s.setAttribute('data-input-position', 'bottom')
    /* 主题默认取 light：站点 defaultTheme 就是 light，undefined（首帧）时按 dark 建页
       会让浅色用户长期看到深色评论区 */
    s.setAttribute('data-theme', themeRef.current === 'dark' ? 'dark' : 'light')
    s.setAttribute('data-lang', 'zh-CN')
    s.crossOrigin = 'anonymous'
    s.async = true
    s.onerror = () => {
      if (!cancelled) setGsFailed(true)
    }
    host.appendChild(s)

    const timer = window.setTimeout(() => {
      setGsLoading(false)
      if (!cancelled && !host.querySelector('iframe')) setGsFailed(true)
    }, 20000)

    /* iframe 起来后补发一次主题：建页那一刻 resolvedTheme 可能还没解析（undefined→light），
       暗色用户在这里补齐，不用等下一次切换主题 */
    let themeTimer: ReturnType<typeof setTimeout> | undefined
    const loaded = () => {
      if (cancelled) return
      setGsLoading(false)
      themeTimer = setTimeout(() => {
        host
          .querySelector('iframe')
          ?.contentWindow?.postMessage(
            { giscus: { setConfig: { theme: themeRef.current === 'dark' ? 'dark' : 'light' } } },
            'https://giscus.app',
          )
      }, 1200)
    }
    s.addEventListener('load', loaded)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      if (themeTimer) clearTimeout(themeTimer)
    }
  }, [mode, slug, gsFailed, prefReady])

  /* 主题切换：postMessage 更新 giscus iframe 主题，避免整块重建（reload 闪烁） */
  useEffect(() => {
    const iframe = hostRef.current?.querySelector('iframe')
    /* undefined（首帧未解析）按 light 发——与建页时的默认一致，别让一个中间态发 dark */
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: resolvedTheme === 'dark' ? 'dark' : 'light' } } },
      'https://giscus.app'
    )
  }, [resolvedTheme, mode])

  /* Giscus 失败 → 自动切本地。
     自动回退只改内存态：一次网络抖动不该永久偷走 GitHub 讨论（偏好只在用户手点 tab 时持久化）。 */
  useEffect(() => {
    if (gsFailed) {
      setGsNotice(true)
      setMode('local')
    }
  }, [gsFailed])

  /* 本地评论读写 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      const parsed: unknown = raw ? JSON.parse(raw) : null
      /* localStorage 是外部输入：形状不对（旧版格式/手改）时别让 .map/.r 崩掉评论区 */
      const ok =
        Array.isArray(parsed) &&
        parsed.every(
          (c) =>
            !!c &&
            typeof c === 'object' &&
            typeof (c as CommentItem).t === 'string' &&
            typeof (c as CommentItem).d === 'number' &&
            Array.isArray((c as CommentItem).r),
        )
      setItems(ok ? (parsed as CommentItem[]) : [])
    } catch {
      setItems([])
    }
  }, [KEY])

  const persist = (next: CommentItem[]) => {
    setItems(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  /* 提交反馈的定时器：卸载时清掉（350ms 内切走页面时，闭包里的 items 是旧的） */
  const publishTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(publishTimer.current), [])

  const publish = () => {
    const t = text.trim()
    if (!t || sending) return
    setSending(true)
    /* 模拟极短提交反馈，保持表单手感 */
    publishTimer.current = setTimeout(() => {
      /* 函数式更新：350ms 窗口里发生的删除/回复不会被这份旧快照覆盖 */
      setItems((prev) => {
        const next = [{ n: name.trim() || '匿名', t, d: Date.now(), r: [] }, ...prev]
        try {
          localStorage.setItem(KEY, JSON.stringify(next))
        } catch {
          /* ignore */
        }
        return next
      })
      setText('')
      setSending(false)
      setSent(true)
      window.setTimeout(() => setSent(false), 1600)
    }, 350)
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
    if (!t) return
    persist(
      items.map((c) =>
        c.d === d ? { ...c, r: [...c.r, { n: name.trim() || '匿名', t, d: Date.now() }] } : c
      )
    )
    setReplyingTo(null)
    setReplyText('')
  }

  const remove = (d: number) => persist(items.filter((c) => c.d !== d))

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
          不是留言板，是火堆旁。想说什么都行——观烬会回。
        </p>
      </header>

      <div
        role="tablist"
        aria-label="评论区模式"
        onKeyDown={(e) => {
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
          e.preventDefault()
          const next = mode === 'giscus' ? 'local' : 'giscus'
          switchMode(next)
          requestAnimationFrame(() => document.getElementById(`cmt-tab-${next}`)?.focus())
        }}
        className="inline-flex items-center gap-1 p-1 rounded-full border border-[var(--hairline)] bg-[var(--surface-2)]"
      >
        <button
          role="tab"
          id="cmt-tab-giscus"
          aria-selected={mode === 'giscus'}
          aria-controls="cmt-panel"
          tabIndex={mode === 'giscus' ? 0 : -1}
          type="button"
          onClick={() => switchMode('giscus')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono tracking-[0.08em] transition-colors duration-200 ${
            mode === 'giscus'
              ? 'bg-[var(--accent)] text-white'
              : 'text-[var(--ink-subtle)] hover:text-[var(--ink)]'
          }`}
        >
          <Github className="w-3.5 h-3.5" aria-hidden />
          GitHub 讨论
        </button>
        <button
          role="tab"
          id="cmt-tab-local"
          aria-selected={mode === 'local'}
          aria-controls="cmt-panel"
          tabIndex={mode === 'local' ? 0 : -1}
          type="button"
          onClick={() => switchMode('local')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono tracking-[0.08em] transition-colors duration-200 ${
            mode === 'local'
              ? 'bg-[var(--accent)] text-white'
              : 'text-[var(--ink-subtle)] hover:text-[var(--ink)]'
          }`}
        >
          <Feather className="w-3.5 h-3.5" aria-hidden />
          匿名留言
        </button>
      </div>

      {gsNotice && mode === 'local' && (
        <p className="mt-4 text-xs text-[var(--ink-subtle)]" role="status">
          GitHub 讨论暂时不可用，已切换到匿名留言。
        </p>
      )}

      <div className="mt-6" id="cmt-panel" role="tabpanel" aria-labelledby={`cmt-tab-${mode}`}>
        {mode === 'giscus' ? (
          gsFailed ? null : (
            <div
              ref={hostRef}
              className="min-h-[340px] rounded-2xl card-static p-2 overflow-hidden"
              aria-busy={gsLoading}
            />
          )
        ) : (
          <m.div {...anim} key="local">
            <div className="rounded-2xl card-static p-5 sm:p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  publish()
                }}
                className="flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <label htmlFor={`cmt-name-${slug}`} className="sr-only">
                    挑一个头像（昵称不显示）
                  </label>
                  <input
                    id={`cmt-name-${slug}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={20}
                    placeholder="挑个专属头像（昵称不显示）"
                    autoComplete="off"
                    className="flex-1 min-w-[200px] px-3.5 py-2.5 rounded-xl text-sm bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink)] placeholder:text-[var(--ink-tertiary)] outline-none transition-colors duration-200 focus:border-[var(--accent)]"
                  />
                  <span className="text-[11px] text-[var(--ink-tertiary)]">匿名留言 · 只显示头像</span>
                </div>
                <label htmlFor={`cmt-text-${slug}`} className="sr-only">
                  留言内容
                </label>
                <textarea
                  id={`cmt-text-${slug}`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="写点什么… 别太客气。"
                  className="px-3.5 py-3 rounded-xl text-sm leading-relaxed bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink)] placeholder:text-[var(--ink-tertiary)] outline-none resize-y transition-colors duration-200 focus:border-[var(--accent)]"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-mono text-[var(--ink-subtle)]">
                    {items.length > 0 ? `${items.length} 条留言` : '0 条留言'}
                  </span>
                  <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
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
                {items.length === 0 && (
                  <m.li
                    {...anim}
                    className="px-5 py-8 text-center text-sm text-[var(--ink-subtle)] rounded-2xl border border-dashed border-[var(--hairline)]"
                  >
                    {emptyState}
                  </m.li>
                )}
                {items.map((c) => {
                  const av = avatarOf(c.n)
                  return (
                    <m.li
                      key={c.d}
                      layout={reduce ? undefined : true}
                      {...anim}
                      className="flex gap-3.5"
                    >
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
                            <time dateTime={new Date(c.d).toISOString()} className="text-[11px] font-mono text-[var(--ink-tertiary)]">
                              {timeAgo(c.d)}
                            </time>
                            <span className="flex-1" />
                            <button
                              type="button"
                              onClick={() => replyTo(c.d)}
                              aria-label="回复这条留言"
                              className="flex items-center gap-1 text-[11px] font-mono text-[var(--ink-subtle)] hover:text-[var(--accent)] transition-colors duration-200"
                            >
                              <CornerUpLeft className="w-3 h-3" aria-hidden />
                              回复
                            </button>
                            {confirmDel === c.d ? (
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
                              const rav = avatarOf(x.n)
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
                                    <time dateTime={new Date(x.d).toISOString()} className="text-[10px] font-mono text-[var(--ink-tertiary)]">
                                      {timeAgo(x.d)}
                                    </time>
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
                                maxLength={200}
                                placeholder="回复…"
                                className="flex-1 min-w-0 px-3 py-2 rounded-lg text-[13px] bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink)] placeholder:text-[var(--ink-tertiary)] outline-none transition-colors duration-200 focus:border-[var(--accent)]"
                              />
                              <button
                                type="submit"
                                disabled={!replyText.trim()}
                                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                                  replyText.trim()
                                    ? 'bg-[var(--accent)] text-white hover:opacity-90'
                                    : 'opacity-45 cursor-not-allowed'
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
        )}
      </div>
    </section>
  )
}
