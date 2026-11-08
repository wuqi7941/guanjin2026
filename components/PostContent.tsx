'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { m } from 'framer-motion'
import { ArrowLeft, ArrowRight, Clock, Calendar, ListTree } from 'lucide-react'
import { EASE } from '@/lib/motion'
import { MarkdownRenderer } from './MarkdownRenderer'
import { Post, PostMeta } from '@/types/post'
import { slugifyHeading } from '@/lib/toc'
import { ReadingRitual } from './ReadingRitual'
import { BookmarkButton } from './BookmarkButton'
import { ListenButton } from './ListenButton'
import { RainToggle } from './RainToggle'
import { saveProgress, countFinished } from '@/lib/reading'
import { collectEgg } from '@/lib/eggs'
import { getAudioCtx } from '@/lib/sound'
import { useScroll } from '@/hooks/useScroll'

/* 评论区懒加载（自建 API + 表单），文章首屏不背这份代码 */
const Comments = dynamic(() => import('./Comments').then((mod) => mod.Comments), {
  ssr: false,
  loading: () => (
    <div className="min-h-[140px] flex items-center justify-center text-sm text-[var(--ink-tertiary)]">
      评论区加载中…
    </div>
  ),
})

interface PostContentProps {
  post: Post
  prev?: PostMeta | null
  next?: PostMeta | null
  /* 全站第几篇（从 1 起）：右上角那个 N° 不再写死 */
  num?: number
}

interface TocItem {
  id: string
  level: number
  text: string
}

/* 划过顶部那条线的一声：五声音阶里随机取一个，极轻，像手指擦过琴弦。
   浏览器要求先有一次点击/按键才允许出声，所以第一次可能是静的。 */
const THREAD_NOTES = [523.25, 587.33, 659.25, 783.99, 880]
let lastThreadAt = 0

function playThread() {
  const now = Date.now()
  if (now - lastThreadAt < 280) return
  lastThreadAt = now
  const ctx = getAudioCtx()
  if (!ctx) return
  try {
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = THREAD_NOTES[Math.floor(Math.random() * THREAD_NOTES.length)]
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.045, t + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 1)
  } catch {
    /* 没有音频环境时安静 */
  }
}

function extractToc(content: string): TocItem[] {
  const items: TocItem[] = []
  let fenced = false
  for (const line of content.split('\n')) {
    /* 围栏代码块要整体跳过：代码注释里的 `## 用法` 会被当成标题收进目录，
       点过去却找不到锚点（渲染器不会给代码块里的行生成 id）。 */
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced
      continue
    }
    if (fenced) continue
    /* h4 也要收：MarkdownRenderer 给 h4 同样生成了 id，目录里漏掉就成了孤岛 */
    const m = line.match(/^(#{2,4})\s+(.+)$/)
    if (m && m[2].trim()) {
      items.push({
        level: m[1].length,
        text: m[2].trim(),
        id: slugifyHeading(m[2].trim()),
      })
    }
  }
  return items
}

export function PostContent({ post, prev, next, num }: PostContentProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const [printDate, setPrintDate] = useState('')
  const lastSaveRef = useRef(0)
  const bottomFiredRef = useRef(false)
  const [tools, setTools] = useState(false)
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const silenceFired = useRef(false)

  /* 暗语「沉默」：打开文章后一分钟没滚没动 */
  const armSilence = useCallback(() => {
    if (silenceFired.current) return
    clearTimeout(silenceTimer.current)
    silenceTimer.current = setTimeout(() => {
      if (silenceFired.current) return
      silenceFired.current = true
      collectEgg('silence')
    }, 60_000)
  }, [])

  useEffect(() => {
    /* 暗语「周年」：在发布日期的同月同日打开它 */
    const today = new Date()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    if (post.date.slice(5) === `${mm}-${dd}`) collectEgg('anniversary')

    armSilence()
    return () => clearTimeout(silenceTimer.current)
  }, [post.date, armSilence])

  /* 阅读进度条：rAF 节流直写 transform（useScroll 统一滚动监听）。
     顺带把进度写进 localStorage（每 1.5s 最多一次），供「继续阅读」使用。
     滚到最底（且文章确实比屏幕长）点亮暗语「到底」；顺带处理夜读 / 雨停 / 沉默。 */
  useScroll((y) => {
    const el = document.documentElement
    const total = el.scrollHeight - el.clientHeight
    const p = total > 0 ? Math.min(1, Math.max(0, y / total)) : 0
    if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
    const now = Date.now()
    if (now - lastSaveRef.current > 1500) {
      lastSaveRef.current = now
      saveProgress(post.slug, p)
    }

    /* 一滚动就重新计时 */
    if (y > 40) armSilence()

    if (!bottomFiredRef.current && total > el.clientHeight * 0.6 && y >= total - 24) {
      bottomFiredRef.current = true
      /* 先落盘：saveProgress 有 1.5s 节流，紧随其后的 countFinished 可能读不到这一篇 */
      saveProgress(post.slug, 1)
      collectEgg('bottom')

      /* 夜读：暗色主题下读完三篇 */
      if (el.classList.contains('dark') && countFinished() >= 3) collectEgg('nightread')
      if (countFinished() >= 10) collectEgg('tenth')

      /* 雨停：开着雨声读到最底 */
      const w = window as unknown as Record<string, unknown>
      if (w.__embersRain) {
        const stopRain = w.__embersRainStop as (() => void) | undefined
        if (typeof stopRain === 'function') stopRain()
        collectEgg('rainoff')
      }
    }
  })

  /* 打印落款日期（打印当天：客户端计算，避免水合不一致） */
  useEffect(() => {
    const d = new Date()
    setPrintDate(`${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`)
  }, [])

  /* 键盘翻页：← 上一篇 / → 下一篇（播放器面板打开时不拦截，那里是快进快退） */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      const ae = document.activeElement
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || (ae as HTMLElement).isContentEditable)) return
      if (document.querySelector('.mp-panel')) return
      /* 搜索弹窗 / 沉浸歌词开着时别翻页：左右键是列表导航和音量 */
      if (document.querySelector('.search-overlay, .mp-full')) return
      const target = e.key === 'ArrowLeft' ? prev : next
      if (!target) return
      e.preventDefault()
      window.dispatchEvent(
        new CustomEvent('embers-navigate', { detail: { href: `/blog/${target.slug}/`, tone: 'paper' as const } }),
      )
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  const toc = useMemo(() => extractToc(post.content), [post.content])
  const isLong = useMemo(() => post.content.replace(/\s/g, '').length > 8000, [post.content])

  return (
    <article className="pt-32 max-sm:pt-24 pb-24 px-6">
      <div
        ref={barRef}
        className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left bg-gradient-to-r from-[var(--fire-top)] via-[var(--accent)] to-[var(--fire-bot)]"
        style={{ transform: 'scaleX(0)' }}
        onMouseEnter={playThread}
        aria-hidden
      />

      <div className={`relative ${isLong ? 'max-w-[720px] mx-auto' : 'max-w-3xl mx-auto'}`}>
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {/* 手机上收成一枚圆箭头：导航栏已有「文章」，这行文字等于重复 */}
          <Link href="/blog/" className="post-back" aria-label="返回文章列表">
            <ArrowLeft className="w-4 h-4" />
            <span className="post-back-text">返回文章列表</span>
          </Link>
        </m.div>

        <m.header
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative mb-14 group"
        >
          <span
            className="poster-number"
            aria-hidden
            style={{
              fontSize: 'clamp(3rem, 10vw, 7rem)',
              /* .poster-number 只在 hero 里是 absolute，文章页要自己给 */
              position: 'absolute',
              opacity: 0.07,
              left: 'auto',
              right: 0,
              top: 'auto',
              bottom: 0,
            }}
          >
            N°{String(num ?? 1).padStart(2, '0')}
          </span>

          {/* 编辑栏目标签：杂志页眉（分类 · 手记） */}
          <div className="post-kicker">
            <span className="post-kicker-cat">{post.tags[0] ?? '随笔'}</span>
            <span className="ink-line flex-1" aria-hidden />
            <span className="post-kicker-type">NOTES — 手记</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-7">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-[2px] text-[11px] font-mono tracking-wider text-[var(--ink-subtle)] border border-[var(--hairline)] bg-[var(--surface-2)]"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className={`post-headline text-[var(--ink)] mb-8 ${isLong ? 'is-long' : ''}`}>
            {post.title}
            {post.featured && <span className="seal-mini ml-3 align-middle">得意</span>}
          </h1>

          <p className="max-h-0 mt-0 opacity-0 -translate-y-1 font-display italic text-[var(--accent)] text-lg leading-snug transition-all duration-500 ease-out group-hover:max-h-16 group-hover:mt-4 group-hover:opacity-100 group-hover:translate-y-0">
            残火未冷，字字有余温。
          </p>

          <div className="ink-line mb-4" aria-hidden />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-mono text-[var(--ink-subtle)]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={post.date}>{post.date.replace(/-/g, '.')}</time>
            </span>
            <span className="w-1 h-1 rounded-full bg-[var(--ink-tertiary)]" />
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTime}
            </span>
            {post.wordCount && (
              <>
                <span className="w-1 h-1 rounded-full bg-[var(--ink-tertiary)]" />
                <span className="index-num">{post.wordCount}</span>
              </>
            )}
            <span className="ml-auto flex items-center gap-2 relative">
              <BookmarkButton slug={post.slug} title={post.title} />
              <button
                type="button"
                className="listen-btn"
                aria-expanded={tools}
                aria-label="更多阅读工具"
                onClick={() => setTools((v) => !v)}
              >
                ···
              </button>
              {tools && (
                <span className="post-tools-pop">
                  {post.featured && <ListenButton />}
                  <RainToggle />
                </span>
              )}
            </span>
          </div>
        </m.header>

        {toc.length > 1 && (
          /* 长目录（7 节以上，全站 soul-17=8 节、piano-06=7 节）默认折叠：
             手机上先滚过七八节标题才见正文，太亏。阈值对齐过全站实际分布。 */
          toc.length > 6 ? (
            <details className="mb-12 p-6 sm:p-7 rounded-[var(--radius-md)] card-static max-w-[720px] mx-auto group">
              <summary className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[var(--ink-subtle)] cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
                <ListTree className="w-3.5 h-3.5" />
                目录 · 共 {toc.length} 节
                <span className="ml-auto text-[10px] group-open:hidden">展开</span>
                <span className="ml-auto hidden text-[10px] group-open:inline">收起</span>
              </summary>
              <ul className="mt-5 space-y-2 border-l border-[var(--hairline)]">
                {toc.map((item) => (
                  <li key={item.id} style={{ paddingLeft: item.level === 3 ? '1.75rem' : '1rem' }}>
                    <a
                      href={`#${item.id}`}
                      className="text-sm leading-relaxed text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          ) : (
            <m.nav
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              className="mb-12 p-6 sm:p-7 rounded-[var(--radius-md)] card-static max-w-[720px] mx-auto"
              aria-label="文章目录"
            >
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[var(--ink-subtle)] mb-4">
                <ListTree className="w-3.5 h-3.5" />
                目录
              </div>
              <ul className="space-y-2 border-l border-[var(--hairline)]">
                {toc.map((item) => (
                  <li key={item.id} style={{ paddingLeft: item.level === 3 ? '1.75rem' : '1rem' }}>
                    <a
                      href={`#${item.id}`}
                      className="text-sm leading-relaxed text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </m.nav>
          )
        )}

        {/* 打印时的页眉：像手稿那样先写标题、日期、署名 */}
        <div className="print-only print-manuscript-head">
          {post.title} · {post.date.replace(/-/g, '.')} · 观烬
        </div>

        <m.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className={`${isLong ? 'p-8 sm:p-12' : 'p-7 sm:p-10'} rounded-[var(--radius-md)] card-static`}
        >
          <MarkdownRenderer content={post.content} variant={isLong ? 'novel' : 'default'} />
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
          className="mt-12 flex items-end justify-end gap-4 select-none"
        >
          <div className="text-right">
            <p className="font-display italic text-[var(--ink-subtle)] text-lg leading-relaxed">观烬 落笔</p>
            <p className="font-mono text-[11px] tracking-[0.2em] text-[var(--ink-tertiary)] uppercase mt-1">EMBERS · 余烬</p>
          </div>
          <span className="seal-stamp" aria-hidden>观</span>
        </m.div>

        {/* 页边留白：宽屏时正文右侧的一条竖线，只写一句话 */}
        <div className="post-margin-note no-print" aria-hidden>
          <span className="post-margin-line" />
          <span className="post-margin-text">
            这一页的右边，
            <br />
            留给以后想起的自己。
          </span>
        </div>

        {/* 余温：读到最底才浮现，像把手指从还温着的纸上拿开 */}
        <div className="post-afterglow no-print">
          <span className="post-afterglow-seal" aria-hidden>
            余温
          </span>
          <p className="post-afterglow-text">
            这一篇大约读了 {post.readingTime}。火熄了，字还是温的。
          </p>
        </div>

        {/* 打印落款：纸上留一行火印（屏幕隐藏） */}
        <p className="print-only mt-12 text-center font-display italic text-[var(--ink-subtle)] text-sm">
          此火印于 {printDate} · 余烬 EMBERS
        </p>

        <ReadingRitual />

        <m.div
          className="no-print"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
        >
          <Comments slug={post.slug} />
        </m.div>

        {(prev || next) && (
          <>
            <p className="no-print mt-14 mb-4 text-center text-[11px] font-mono tracking-[0.2em] text-[var(--ink-tertiary)] select-none">
              ← / → 键也可翻页
            </p>
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              className="no-print grid sm:grid-cols-2 gap-4"
            >
            {prev ? (
              <Link
                href={`/blog/${prev.slug}/`}
                data-flip
                className="group p-5 rounded-[var(--radius-md)] card-static hover:border-[var(--hairline-strong)] transition-colors"
              >
                <span className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--ink-subtle)] mb-3">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  上一篇                </span>
                <span className="block text-base font-medium text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                  {prev.title}
                </span>
                <span className="block mt-2 text-xs font-mono text-[var(--ink-tertiary)]">
                  {prev.date.replace(/-/g, '.')}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/blog/${next.slug}/`}
                data-flip
                className="group p-5 rounded-[var(--radius-md)] card-static hover:border-[var(--hairline-strong)] transition-colors text-right"
              >
                <span className="flex items-center justify-end gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--ink-subtle)] mb-3">
                  下一篇                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="block text-base font-medium text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                  {next.title}
                </span>
                <span className="block mt-2 text-xs font-mono text-[var(--ink-tertiary)]">
                  {next.date.replace(/-/g, '.')}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </m.div>
          </>
        )}
      </div>
    </article>
  )
}
