'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Search, X, CornerDownLeft } from 'lucide-react'
import { collectEgg } from '@/lib/eggs'
import { unlockCopy } from './CopyGuard'

interface Doc {
  slug: string
  title: string
  date: string
  tags: string[]
  excerpt: string
  body: string
}

/* 暗门口令：搜索框里敲出这三个字，进 /eggs/ 暗语全册 */
const DOOR = '观烬'

/* 索引只在第一次打开搜索时下载，之后驻留内存（约 200KB） */
let cache: Doc[] | null = null
let inflight: Promise<Doc[]> | null = null

function loadIndex(): Promise<Doc[]> {
  if (cache) return Promise.resolve(cache)
  if (!inflight) {
    inflight = fetch('/search-index.json')
      .then((r) => r.json())
      .then((list: Doc[]) => {
        cache = list
        return list
      })
      .catch(() => {
        inflight = null
        return []
      })
  }
  return inflight
}

interface Hit {
  doc: Doc
  score: number
  snippet: string
}

/* 打分：标题 > 分区 > 摘要 > 正文；正文按出现次数小幅加权 */
function search(list: Doc[], raw: string): Hit[] {
  const q = raw.trim().toLowerCase()
  if (q.length < 1) return []
  const hits: Hit[] = []

  for (const doc of list) {
    const title = doc.title.toLowerCase()
    let score = 0
    if (title === q) score += 240
    else if (title.startsWith(q)) score += 120
    else if (title.includes(q)) score += 80

    if (doc.tags.some((t) => t.toLowerCase().includes(q))) score += 40

    const excerpt = doc.excerpt.toLowerCase()
    if (excerpt.includes(q)) score += 24

    const body = doc.body.toLowerCase()
    let count = 0
    let at = body.indexOf(q)
    while (at >= 0 && count < 12) {
      count++
      at = body.indexOf(q, at + q.length)
    }
    if (count > 0) score += 10 + Math.min(count, 8)

    if (score === 0) continue

    /* 摘要片：优先正文命中处，否则用文章摘要 */
    let snippet = doc.excerpt
    const hitAt = body.indexOf(q)
    if (hitAt >= 0) {
      const start = Math.max(0, hitAt - 34)
      const end = Math.min(doc.body.length, hitAt + q.length + 46)
      snippet = (start > 0 ? '…' : '') + doc.body.slice(start, end).replace(/\n/g, ' ') + (end < doc.body.length ? '…' : '')
    }
    hits.push({ doc, score, snippet })
  }

  return hits.sort((a, b) => b.score - a.score || b.doc.date.localeCompare(a.doc.date)).slice(0, 12)
}

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <mark className="search-mark">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [docs, setDocs] = useState<Doc[]>(cache ?? [])
  const [ready, setReady] = useState(!!cache)
  const [active, setActive] = useState(0)
  /* 搜索记忆：上次搜过的词（本地），空着时给一个"接着搜"的入口 */
  const [lastQuery, setLastQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const hits = useMemo(() => search(docs, q), [docs, q])

  const openDialog = useCallback(() => {
    setOpen(true)
    try {
      setLastQuery(localStorage.getItem('embers_last_query') ?? '')
    } catch {
      /* ignore */
    }
    if (!cache) {
      loadIndex().then((list) => {
        setDocs(list)
        setReady(true)
      })
    }
  }, [])

  const closeDialog = useCallback(() => {
    setOpen(false)
    setQ('')
    setActive(0)
  }, [])

  const goPath = useCallback(
    (path: string) => {
      closeDialog()
      /* 走全站统一的墨染过渡（PageTransition 监听 embers-navigate），
         否则从搜索进文章会是全站唯一一个硬跳转 */
      window.dispatchEvent(new CustomEvent('embers-navigate', { detail: path }))
    },
    [closeDialog],
  )

  const go = useCallback(
    (slug: string) => {
      try {
        const v = q.trim()
        if (v) localStorage.setItem('embers_last_query', v)
      } catch {
        /* ignore */
      }
      goPath(`/blog/${slug}/`)
    },
    [goPath, q],
  )

  /* 暗门：在搜索框敲出「观烬」——三个字敲完就自己开，同时解开复制锁 */
  useEffect(() => {
    if (q.trim() !== DOOR) return
    unlockCopy()
    const t = window.setTimeout(() => goPath('/eggs/'), 900)
    return () => window.clearTimeout(t)
  }, [q, goPath])

  /* 打开方式：导航按钮事件 / Ctrl+⌘+K / 单独一个斜杠 */
  useEffect(() => {
    const onOpen = () => openDialog()
    window.addEventListener('embers-search', onOpen)
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        openDialog()
        return
      }
      if (!typing && e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        openDialog()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('embers-search', onOpen)
      window.removeEventListener('keydown', onKey)
    }
  }, [openDialog])

  /* 鼠标移到导航的放大镜上就开始下载索引，第一下搜索不用再等 */
  useEffect(() => {
    const prefetch = () => {
      if (cache) return
      loadIndex().then((list) => {
        setDocs(list)
        setReady(true)
      })
    }
    window.addEventListener('embers-search-prefetch', prefetch)
    return () => window.removeEventListener('embers-search-prefetch', prefetch)
  }, [])

  /* 焦点陷阱：Tab 只在弹窗内循环，不跑到背后的页面 */
  const onPanelKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const panel = panelRef.current
    if (!panel) return
    const items = Array.from(
      panel.querySelectorAll<HTMLElement>('button:not([disabled]), input, [href], [tabindex]:not([tabindex="-1"])'),
    ).filter((el) => el.offsetParent !== null)
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    const activeEl = document.activeElement
    if (!e.shiftKey && activeEl === last) {
      e.preventDefault()
      first.focus()
    } else if (e.shiftKey && activeEl === first) {
      e.preventDefault()
      last.focus()
    }
  }

  /* 打开时锁滚动 + 聚焦输入框 */
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(() => inputRef.current?.focus(), 60)
    return () => {
      document.body.style.overflow = prev
      window.clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    setActive(0)
  }, [q])

  /* 彩蛋「寻火」：在搜索框里敲出「余烬」 */
  useEffect(() => {
    if (q.includes('余烬')) collectEgg('search')
  }, [q])

  /* 键盘上下选择 */
  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      closeDialog()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(hits.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (q.trim() === DOOR) {
        goPath('/eggs/')
        return
      }
      const hit = hits[active]
      if (hit) go(hit.doc.slug)
    }
  }

  /* 选中项滚进视野 */
  useEffect(() => {
    const box = listRef.current
    if (!box) return
    const el = box.children[active] as HTMLElement | undefined
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [active])

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeDialog}
        >
          <m.div
            ref={panelRef}
            className="search-panel"
            role="dialog"
            aria-modal="true"
            aria-label="全站搜索"
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onKeyDown={onPanelKey}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="search-input-row">
              <Search className="w-4 h-4 shrink-0 text-[var(--ink-tertiary)]" aria-hidden />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="搜标题、分区、正文…"
                className="search-input"
                aria-label="搜索关键词"
                autoComplete="off"
                spellCheck={false}
              />
              <button type="button" onClick={closeDialog} className="search-close" aria-label="关闭搜索">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={listRef} className="search-results">
              {q.trim() === DOOR ? (
                <button type="button" className="search-door" onClick={() => goPath('/eggs/')}>
                  <span className="search-door-mark" aria-hidden>
                    烬
                  </span>
                  <span className="search-door-text">
                    <span className="search-door-title">门开了</span>
                    <span className="search-door-sub">暗语全册 · 十三枚的触发方式</span>
                  </span>
                </button>
              ) : (
                <>
                  {!ready && <p className="search-hint">正在载入索引…</p>}

                  {ready && q.trim() === '' && (
                    <div className="search-hint">
                      <p>全站 {docs.length} 篇，输入关键词开始。</p>
                      <p className="search-hint-keys">
                        <kbd>↑</kbd>
                        <kbd>↓</kbd> 选择 · <kbd>Enter</kbd> 打开 · <kbd>Esc</kbd> 关闭
                      </p>
                      {lastQuery && (
                        <button type="button" className="search-last" onClick={() => setQ(lastQuery)}>
                          上次搜过「{lastQuery}」，接着搜
                        </button>
                      )}
                    </div>
                  )}

                  {ready && q.trim() !== '' && hits.length === 0 && (
                    <p className="search-hint">没有找到「{q.trim()}」。换个词试试，比如「琴」「深夜」「高考」。</p>
                  )}

                  {hits.map((hit, i) => (
                    <button
                      type="button"
                      key={hit.doc.slug}
                      className={`search-hit ${i === active ? 'is-active' : ''}`}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(hit.doc.slug)}
                    >
                      <span className="search-hit-title">
                        <Highlight text={hit.doc.title} q={q.trim()} />
                      </span>
                      <span className="search-hit-meta">
                        {hit.doc.date.replace(/-/g, '.')}
                        {hit.doc.tags[0] ? ` · ${hit.doc.tags[0]}` : ''}
                      </span>
                      <span className="search-hit-snippet">
                        <Highlight text={hit.snippet} q={q.trim()} />
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>

            <div className="search-foot">
              <span>
                {q.trim() === DOOR
                  ? '正在进入…'
                  : `${ready ? `${docs.length} 篇索引` : '载入中'}${
                      q.trim() && hits.length > 0 ? ` · ${hits.length} 条结果` : ''
                    }`}
              </span>
              <span className="search-foot-enter">
                <CornerDownLeft className="w-3 h-3" aria-hidden />
                Enter
              </span>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
