'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { m, useReducedMotion } from 'framer-motion'
import { useInView } from '@/hooks/useInView'

interface TypewriterProps {
  texts: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
  className?: string
  /* 静息时替换为整句显示（如发呆句）；为空则正常轮播 */
  pauseLine?: string
  /* 值变化时立即快速切换（深夜句等状态变化即时响应） */
  priority?: string
  /* 可输入：点击打字机出现输入框（桌面亦可直接敲字符键进入） */
  interactive?: boolean
  /* 触发词 → 回应句（如 huo → 「火，收下了。」） */
  triggers?: Record<string, string>
  onTrigger?: (word: string) => void
}

/* 切换句时快速删除（状态响应速度）；输入空闲自动收起时长 */
const FAST_DELETE = 14
const IDLE_EXIT = 8000

export function Typewriter({
  texts,
  typingSpeed = 52,
  deletingSpeed = 26,
  pauseDuration = 2400,
  className = '',
  pauseLine,
  priority,
  interactive = false,
  triggers,
  onTrigger,
}: TypewriterProps) {
  const reduce = !!useReducedMotion()
  const [displayText, setDisplayText] = useState(reduce ? texts[0] ?? '' : '')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  /* 输入态：非 null 时输入框可见并承接键盘 */
  const [userText, setUserText] = useState<string | null>(null)
  /* 触发回应句：打完短暂停留后回到轮播 */
  const [response, setResponse] = useState<string | null>(null)

  const fastRef = useRef(false)
  const holdRef = useRef(false)
  const activeRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const idleTimerRef = useRef<number | undefined>(undefined)
  const responseTimerRef = useRef<number | undefined>(undefined)

  const active = userText !== null

  /* 离开视口：暂停打字循环，避免空转 setState（滚动回来自动恢复） */
  const { ref: rootRef, inView } = useInView<HTMLSpanElement>({ once: false, threshold: 0.1 })

  /* 目标句序列：回应句 > 静息句 > 正常轮播 */
  const effectiveTexts = useMemo(() => {
    const temp = response ?? pauseLine
    return temp ? [temp] : texts
  }, [response, pauseLine, texts])

  /* —— 输入框管理 —— */
  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = undefined
    }
  }, [])

  const exitInteractive = useCallback(() => {
    activeRef.current = false
    clearIdleTimer()
    setUserText(null)
    inputRef.current?.blur()
  }, [clearIdleTimer])

  const armExit = useCallback(() => {
    clearIdleTimer()
    idleTimerRef.current = window.setTimeout(exitInteractive, IDLE_EXIT)
  }, [clearIdleTimer, exitInteractive])

  /* 激活输入（点击打字机；同步渲染后聚焦，保证移动端手势内唤起键盘） */
  const activate = useCallback(
    (initial = '') => {
      if (activeRef.current) return
      activeRef.current = true
      flushSync(() => setUserText(initial))
      inputRef.current?.focus()
      armExit()
    },
    [armExit],
  )

  /* 桌面：未激活时直接敲字符键即进入（不抢空格滚动；输入框/面板占用键盘时不接管） */
  useEffect(() => {
    if (!interactive || reduce || !inView) return
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const onKey = (e: KeyboardEvent) => {
      if (activeRef.current) return
      const ae = document.activeElement as HTMLElement | null
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (document.querySelector('.mp-panel')) return
      /* g 前缀跳转折叠中：这一下不是给打字机的 */
      if ((window as unknown as Record<string, unknown>).__embersQuick) return
      if (e.key.length === 1 && e.key !== ' ' && !e.repeat) {
        e.preventDefault()
        activate(e.key)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [interactive, reduce, inView, activate])

  /* 卸载时清计时器 */
  useEffect(() => {
    return () => {
      clearIdleTimer()
      if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current)
    }
  }, [clearIdleTimer])

  /* 触发词检查 → 回应句 */
  useEffect(() => {
    if (userText === null || !triggers) return
    const lower = userText.toLowerCase()
    for (const [word, reply] of Object.entries(triggers)) {
      if (lower.endsWith(word)) {
        activeRef.current = false
        clearIdleTimer()
        setUserText(null)
        inputRef.current?.blur()
        setResponse(reply)
        onTrigger?.(word)
        break
      }
    }
  }, [userText, triggers, onTrigger, clearIdleTimer])

  /* 回应句打完停留后回到轮播（计时器独立于逐字状态，避免被删除动画清掉） */
  useEffect(() => {
    if (!response || active) return
    if (displayText !== response) return
    if (responseTimerRef.current) return
    responseTimerRef.current = window.setTimeout(() => {
      responseTimerRef.current = undefined
      setResponse(null)
    }, 3200)
  }, [response, active, displayText])

  /* response 被替换/清空时，清掉未到期的计时器 */
  useEffect(() => {
    return () => {
      if (responseTimerRef.current) {
        window.clearTimeout(responseTimerRef.current)
        responseTimerRef.current = undefined
      }
    }
  }, [response])

  /* priority 变化（如深夜句）：立即快速切到首句 */
  useEffect(() => {
    if (!priority) return
    holdRef.current = true
    fastRef.current = true
    setCurrentIndex(0)
    setIsPaused(false)
    setIsDeleting(true)
  }, [priority])

  /* —— 轮播打字状态机 —— */
  useEffect(() => {
    if (reduce) return
    if (!inView) return
    if (active) return
    const currentText = effectiveTexts[currentIndex % effectiveTexts.length]
    if (!currentText) return

    /* 目标句变化（静息/回应/恢复）：立即快速删除旧句，不做停顿 */
    if (!isDeleting && displayText && !currentText.startsWith(displayText)) {
      fastRef.current = true
      setIsPaused(false)
      setIsDeleting(true)
      return
    }

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, pauseDuration)
      return () => clearTimeout(pauseTimer)
    }

    if (isDeleting) {
      if (displayText === '') {
        setIsDeleting(false)
        fastRef.current = false
        if (holdRef.current) {
          holdRef.current = false
        } else {
          setCurrentIndex((prev) => (prev + 1) % effectiveTexts.length)
        }
        return
      }

      const deleteTimer = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1))
      }, fastRef.current ? FAST_DELETE : deletingSpeed)
      return () => clearTimeout(deleteTimer)
    }

    if (displayText === currentText) {
      setIsPaused(true)
      return
    }

    const typeTimer = setTimeout(() => {
      setDisplayText(currentText.slice(0, displayText.length + 1))
    }, typingSpeed)

    return () => clearTimeout(typeTimer)
  }, [displayText, currentIndex, isDeleting, isPaused, effectiveTexts, typingSpeed, deletingSpeed, pauseDuration, inView, reduce, active])

  return (
    <span
      ref={rootRef}
      onClick={() => {
        if (interactive && !activeRef.current) activate()
      }}
      className={`flex items-center w-full border-b transition-colors duration-300 ${
        interactive ? 'cursor-text' : ''
      } ${
        active
          ? 'border-solid border-[color-mix(in_srgb,var(--accent)_65%,transparent)]'
          : 'border-dashed border-[var(--hairline)] hover:border-[color-mix(in_srgb,var(--accent)_35%,transparent)]'
      } ${className}`}
    >
      {!active && (
        /* 轮播显示（点击整行任一位置都可进入输入） */
        <span className="inline-flex items-baseline">
          <span>{displayText}</span>
          <m.span
            animate={!reduce && inView ? { opacity: [1, 0] } : undefined}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            className="inline-block w-[3px] h-[1em] bg-current ml-1 align-middle"
          />
        </span>
      )}

      <input
        ref={inputRef}
        value={active ? userText ?? '' : ''}
        onChange={(e) => {
          setUserText(e.target.value)
          armExit()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            exitInteractive()
            return
          }
          if (e.key === 'Enter') {
            e.preventDefault()
            setUserText('')
            armExit()
          }
        }}
        onBlur={() => {
          if (activeRef.current) exitInteractive()
        }}
        tabIndex={-1}
        placeholder={active ? '敲几个字试试…' : ''}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="打字机输入框"
        className={`bg-transparent min-w-0 p-0 text-lg sm:text-xl md:text-2xl font-light text-[var(--ink)] placeholder:text-[var(--ink-tertiary)] placeholder:opacity-50 caret-[var(--accent)] outline-none focus:outline-none focus-visible:outline-none transition-opacity duration-200 ${
          active ? 'flex-1 opacity-100' : 'w-px h-px opacity-0 p-0'
        }`}
      />

      {active && (
        <span className="ml-3 shrink-0 hidden sm:inline font-mono text-[10px] tracking-[0.18em] opacity-45 select-none">
          Esc 收起 · 8 秒自动
        </span>
      )}
    </span>
  )
}
