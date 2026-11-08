'use client'

import { EASE, EASE_DROP } from '@/lib/motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { m, AnimatePresence, useTransform } from 'framer-motion'
import { Typewriter } from './Typewriter'
import { HeroArt } from './HeroArt'
import { HeroWordmark } from './hero/Wordmark'
import { EmberRest } from './hero/EmberRest'
import { ArrowDown } from 'lucide-react'
import { useIdle } from '@/hooks/useIdle'
import { useParallax } from '@/hooks/useParallax'
import { useWeatherLine } from '@/hooks/useWeather'
import { collectEgg, isNightNow } from '@/lib/eggs'
import { chime } from '@/lib/sound'
import {
  HERO_TEXTS,
  IDLE_LINE,
  NIGHT_TYPE_LINE,
  TYPE_TRIGGERS,
  PHASE_TYPE,
  phaseOf,
  seasonOf,
  SEASON_TEXTS,
  SURPRISE_LINES,
  SOLAR_TERMS,
  pickRandom,
} from '@/lib/copy'

export function Hero() {
  const idle = useIdle(15000)
  const [night, setNight] = useState(false)
  const [sealLit, setSealLit] = useState(false)
  const [phaseLine, setPhaseLine] = useState<string | null>(null)
  const sealTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sealLitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleMarked = useRef(false)

  /* 鼠标微视差：标题反向、照片同向（仅桌面精指针，减动关闭） */
  const parallax = useParallax()
  const tx = useTransform(parallax.x, (v) => -v * 0.45)
  const ty = useTransform(parallax.y, (v) => -v * 0.45)

  useEffect(() => {
    if (isNightNow()) setNight(true)
    /* 按打开的时段换第一句（客户端取时间，避免水合不一致） */
    setPhaseLine(PHASE_TYPE[phaseOf()])
  }, [])

  /* 静息火苗点亮一次，记入彩蛋收集 */
  useEffect(() => {
    if (idle && !idleMarked.current) {
      idleMarked.current = true
      collectEgg('idle')
    }
  }, [idle])

  /* 深夜句优先；普通时段先报时，再随机插一句季节句；
     队列尾埋两句「惊喜句」（季节冷知识 / 站内小机关提示）——
     停留够久就会「时不时跳出来」。进站随机一次，轮播期间不再变。 */
  const baseTexts = useMemo(() => {
    const head = night ? [NIGHT_TYPE_LINE] : phaseLine ? [phaseLine] : []
    const seasonPick = pickRandom(SEASON_TEXTS[seasonOf()], 1)
    const today = new Date()
    const todayTerm = SOLAR_TERMS.find((t) => t.m === today.getMonth() + 1 && t.d === today.getDate())
    const surprisePool = SOLAR_TERMS.filter((t) => !(todayTerm && t.m === todayTerm.m && t.d === todayTerm.d)).map(
      (t) => t.line,
    )
    const surprise = pickRandom([...SURPRISE_LINES, ...surprisePool], 2)
    return [...head, ...seasonPick, ...HERO_TEXTS, ...surprise]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [night, phaseLine])

  /* 天气句异步到达时只插在时段句后面，不重洗随机队列——
     否则一次 fetch 就会把整轮句子换掉，正在打的字也要重来。 */
  const weatherLine = useWeatherLine()
  const texts = useMemo(
    () => (weatherLine ? [baseTexts[0], weatherLine, ...baseTexts.slice(1)] : baseTexts),
    [baseTexts, weatherLine],
  )

  /* 打字机触发词命中：收集「火苗」+ 唤一阵叶子雨 */
  const onTypeTrigger = useCallback(() => {
    collectEgg('type')
    window.dispatchEvent(new CustomEvent('embers-burst', { detail: 20 }))
  }, [])

  /* 长按印章 1.2s：点亮 + 轻响 + 收集 */
  const onSealDown = useCallback(() => {
    sealTimer.current = setTimeout(() => {
      setSealLit(true)
      chime()
      collectEgg('seal')
      if (sealLitTimer.current) clearTimeout(sealLitTimer.current)
      sealLitTimer.current = setTimeout(() => setSealLit(false), 2600)
    }, 1200)
  }, [])
  /* 长按中途切页：两个定时器都不能对已卸载组件 setState */
  useEffect(
    () => () => {
      if (sealTimer.current) clearTimeout(sealTimer.current)
      if (sealLitTimer.current) clearTimeout(sealLitTimer.current)
    },
    [],
  )
  const onSealUp = useCallback(() => {
    if (sealTimer.current) {
      clearTimeout(sealTimer.current)
      sealTimer.current = null
    }
  }, [])

  return (
    <section className="relative min-h-[86vh] flex items-center overflow-hidden px-6 hero-poster">
      <span className="poster-number" aria-hidden>
        N°001
      </span>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[1.15fr_0.85fr] gap-16 lg:gap-12 items-center pt-24 pb-20 md:pt-28 md:pb-24 relative z-10">
        <div className="relative text-left hero-letter">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span className="inline-flex items-center gap-3 px-0 text-xs font-mono tracking-[0.28em] uppercase text-[var(--ink-subtle)]">
              {/* 落印：等标题与落款都停稳，这枚印才砸下来——快落、硬停，不弹 */}
              <m.span
                className={'seal ' + (sealLit ? 'is-lit' : '')}
                role="button"
                /* 键盘也能盖印：按住 Enter/空格 1.2 秒等效长按（指针的 onPointerDown 同样逻辑） */
                tabIndex={0}
                aria-label="余印，长按试试"
                initial={{ opacity: 0, y: -16, scale: 1.14 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.46, delay: 1.05, ease: EASE_DROP }}
                onPointerDown={onSealDown}
                onPointerUp={onSealUp}
                onPointerLeave={onSealUp}
                onPointerCancel={onSealUp}
                onContextMenu={(e) => e.preventDefault()}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                    e.preventDefault()
                    onSealDown()
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSealUp()
                }}
              >
                余
              </m.span>
              余烬 EMBERS · 残火未冷
            </span>
          </m.div>

          {/* 活字标题（逐字落下） */}
          <m.h1 className="mt-8 mb-10" style={{ x: tx, y: ty }} aria-label="观烬 EMBERS">
            <HeroWordmark />
          </m.h1>

          <m.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.28, ease: EASE }}
            className="relative min-h-16 flex items-center text-lg sm:text-xl md:text-2xl text-[var(--ink-muted)] font-light max-w-xl pl-5"
          >
            {/* 毛笔竖线：手绘笔触 + 呼吸 */}
            <svg className="brush-line" viewBox="0 0 3 100" preserveAspectRatio="none" aria-hidden>
              <path
                d="M1.6 1 C0.7 30, 2.4 68, 1.5 99"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <Typewriter
              key={phaseLine ?? 'boot'}
              texts={texts}
              pauseLine={idle ? IDLE_LINE : undefined}
              interactive
              triggers={TYPE_TRIGGERS}
              priority={night ? NIGHT_TYPE_LINE : (phaseLine ?? undefined)}
              onTrigger={onTypeTrigger}
              typingSpeed={45}
              deletingSpeed={24}
              pauseDuration={2400}
            />
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
            className="mt-12 flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-5"
          >
            <a href="/blog/" className="btn-primary px-9 py-4 text-[15px] font-semibold tracking-wide text-center">
              阅读文章 → 观烬手记
            </a>
            <a href="/contact/" className="btn-secondary px-9 py-4 text-[15px] font-semibold tracking-wide text-center">
              联系我
            </a>
          </m.div>

          {/* 落款：把首页当成一封摊开的信 */}
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.85, ease: EASE }}
            className="letter-sign"
          >
            <span className="letter-sign-name">观烬</span>
            <span className="letter-sign-date">二〇二六年 · 秋</span>
            <span className="seal-mini" aria-hidden>
              余
            </span>
          </m.div>

          {/* 静息余烬：桌面端，无操作 15 秒后火星聚拢，一动就散 */}
          <AnimatePresence>
            {idle && (
              <m.div
                key="ember-rest"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 1.4, ease: EASE }}
                className="absolute -bottom-14 left-4 hidden lg:block"
              >
                <EmberRest />
              </m.div>
            )}
          </AnimatePresence>
        </div>

        {/* 拍立得照片 + 微视差（与标题反向） */}
        <m.div style={{ x: parallax.x, y: parallax.y }} className="relative flex justify-center lg:justify-end">
          <m.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.18, ease: EASE }}
            className="relative w-full max-w-[300px] md:max-w-[460px]"
          >
            <div className="polaroid border border-[var(--hairline)] bg-[var(--surface-1)] p-2.5 pb-0 shadow-[0_24px_48px_-28px_rgba(35,26,18,0.45)]">
              <div className="relative overflow-hidden">
                <HeroArt />
              </div>
              {/* 相纸手写说明 */}
              <div className="flex items-baseline justify-between px-1 py-3">
                <span className="font-display italic text-[13px] text-[var(--ink-muted)]">
                  光与琴键，余烬未冷
                </span>
                <span className="font-mono text-[9px] tracking-[0.18em] text-[var(--ink-tertiary)]">
                  A4 · 300DPI
                </span>
              </div>
            </div>
          </m.div>
        </m.div>
      </div>

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.3 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <m.a
          href="#latest"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: 2, repeatDelay: 0.4, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors"
        >
          <span className="kicker text-[10px]">SCROLL ↓</span>
          <ArrowDown className="w-4 h-4" />
        </m.a>
      </m.div>
    </section>
  )
}
