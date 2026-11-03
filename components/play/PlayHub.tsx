'use client'

/* 试金石：站内小测试（MBTI 三档 / 你是哪种火）。
   纯前端状态机，无后端；结果可复制分享。 */

import { useMemo, useState } from 'react'
import { m, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowLeft, RotateCcw, Copy, Check } from 'lucide-react'
import { EASE } from '@/lib/motion'
import {
  MBTI_TIERS,
  MBTI_TYPES,
  buildMbtiSet,
  FIRE_QUESTIONS,
  FIRE_RESULTS,
  type MbtiTier,
  type FireKind,
} from '@/lib/tests'

type TestId = 'mbti' | 'fire'
type View = 'hub' | 'tiers' | 'quiz' | 'result'

const FIRE_META = { title: '你是哪种火', sub: '五个问题，四种火——炉火、烛火、篝火、星火。', count: 5, tag: '约 1 分钟' }

export function PlayHub() {
  const reduce = !!useReducedMotion()
  const [view, setView] = useState<View>('hub')
  const [test, setTest] = useState<TestId | null>(null)
  const [tier, setTier] = useState<MbtiTier>('std')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [copied, setCopied] = useState(false)

  /* 当套题：MBTI 进 quiz 前由 buildMbtiSet 生成；火测固定题序 */
  const [mbtiSet, setMbtiSet] = useState<ReturnType<typeof buildMbtiSet>>([])
  const questions = test === 'mbti' ? mbtiSet : FIRE_QUESTIONS
  const total = questions.length

  const result = useMemo(() => {
    if (view !== 'result' || !test) return null
    if (test === 'mbti') {
      let E = 0, I = 0, S = 0, N = 0, T = 0, F = 0, J = 0, P = 0
      mbtiSet.forEach((q, i) => {
        const picked = answers[i]
        if (picked === undefined) return
        const dim = picked === 0 ? q.a.dim : q.b.dim
        if (dim === 'E') E++
        if (dim === 'I') I++
        if (dim === 'S') S++
        if (dim === 'N') N++
        if (dim === 'T') T++
        if (dim === 'F') F++
        if (dim === 'J') J++
        if (dim === 'P') P++
      })
      const code = `${E >= I ? 'E' : 'I'}${S >= N ? 'S' : 'N'}${T >= F ? 'T' : 'F'}${J >= P ? 'J' : 'P'}`
      const meta = MBTI_TYPES[code]
      /* 统一形状：code 主码、sub 副标、tags 特质、text 分析、ember 烬语 */
      return { code, name: meta.name, sub: meta.fire, tags: meta.tags, text: meta.text, ember: meta.ember }
    }
    const tally: Record<FireKind, number> = { hearth: 0, candle: 0, bonfire: 0, spark: 0 }
    FIRE_QUESTIONS.forEach((q, i) => {
      const picked = answers[i]
      if (picked === undefined) return
      tally[q.options[picked].kind] += 1
    })
    const kind = (Object.keys(tally) as FireKind[]).reduce((a, b) => (tally[b] > tally[a] ? b : a))
    const meta = FIRE_RESULTS[kind]
    return { code: meta.en, name: meta.name, sub: meta.en, tags: [] as string[], text: meta.text, ember: '' }
  }, [view, test, answers, mbtiSet])

  const start = (id: TestId, t?: MbtiTier) => {
    setTest(id)
    if (id === 'mbti') {
      setTier(t ?? 'std')
      setMbtiSet(buildMbtiSet(t ?? 'std'))
    }
    setStep(0)
    setAnswers([])
    setView('quiz')
  }

  const pick = (idx: number) => {
    const next = [...answers]
    next[step] = idx
    setAnswers(next)
    if (step + 1 >= total) setView('result')
    else setStep(step + 1)
  }

  const copyResult = () => {
    if (!result || !test) return
    const label =
      test === 'mbti'
        ? `我的 MBTI 是 ${result.code}「${result.name}」`
        : `我是「${result.name} · ${result.code}」`
    const url = 'https://guanjin2011.de5.net/play/'
    navigator.clipboard?.writeText(`${label}\n——余烬 EMBERS 试金石 ${url}`).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const anim = reduce
    ? undefined
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.32, ease: EASE },
      }

  const currentOptions =
    test === 'mbti'
      ? [mbtiSet[step]?.a.text, mbtiSet[step]?.b.text].filter(Boolean)
      : (FIRE_QUESTIONS[step]?.options.map((o) => o.text) ?? [])

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {view === 'hub' && (
          <m.div key="hub" {...anim} className="grid sm:grid-cols-2 gap-5">
            <button type="button" onClick={() => setView('tiers')} className="acard text-left p-6 sm:p-7">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[var(--ink-tertiary)]">三档 · 2-8 分钟</span>
              <h2 className="acard-title mt-3">MBTI</h2>
              <p className="acard-excerpt mt-2">
                十六型人格测试。速测 16 题、标准 32 题、深测 48 题——题库里抽，每档都能测。
              </p>
              <span className="acard-go mt-4">
                开始
                <span aria-hidden>→</span>
              </span>
            </button>
            <button type="button" onClick={() => start('fire')} className="acard text-left p-6 sm:p-7">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[var(--ink-tertiary)]">原创 · 约 1 分钟</span>
              <h2 className="acard-title mt-3">你是哪种火</h2>
              <p className="acard-excerpt mt-2">
                五个问题，四种火——炉火、烛火、篝火、星火。站里自己写的，没有科学依据，但有态度。
              </p>
              <span className="acard-go mt-4">
                开始
                <span aria-hidden>→</span>
              </span>
            </button>
            <p className="sm:col-span-2 text-xs leading-relaxed text-[var(--ink-subtle)] max-w-[56ch]">
              都是纯前端的小测试：答案不离开你的浏览器，不上传、不记录。
              想留下就自己复制结果。
            </p>
          </m.div>
        )}

        {view === 'tiers' && (
          <m.div key="tiers" {...anim}>
            <button
              type="button"
              onClick={() => setView('hub')}
              className="flex items-center gap-1.5 text-xs font-mono text-[var(--ink-subtle)] hover:text-[var(--accent)] transition-colors mb-8"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
              返回
            </button>
            <h2 className="text-2xl font-semibold tracking-[-0.01em] text-[var(--ink)] mb-2">MBTI · 选一档</h2>
            <p className="text-sm text-[var(--ink-subtle)] mb-8 max-w-[50ch]">
              题库 48 题，按维度随机抽——同一档重测，题目也不完全一样。档位越高越准。
            </p>
            <div className="flex flex-col gap-3">
              {MBTI_TIERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => start('mbti', t.id)}
                  className="group text-left px-5 py-4 rounded-xl card-static transition-all duration-200 hover:border-[var(--accent)] active:scale-[0.99] flex items-center justify-between gap-3"
                >
                  <span>
                    <span className="block text-[15px] font-semibold text-[var(--ink)]">{t.label}</span>
                    <span className="block text-xs font-mono text-[var(--ink-tertiary)] mt-1">{t.tag}</span>
                  </span>
                  <span className="text-[var(--ink-tertiary)] group-hover:text-[var(--accent)] transition-colors" aria-hidden>
                    →
                  </span>
                </button>
              ))}
            </div>
          </m.div>
        )}

        {view === 'quiz' && test && (
          <m.div key="quiz" {...anim}>
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => setView(test === 'mbti' ? 'tiers' : 'hub')}
                className="flex items-center gap-1.5 text-xs font-mono text-[var(--ink-subtle)] hover:text-[var(--accent)] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
                返回
              </button>
              <span className="text-xs font-mono text-[var(--ink-tertiary)] tabular-nums">
                {step + 1} / {total}
              </span>
            </div>

            {/* 进度条 */}
            <div className="h-[3px] bg-[var(--surface-2)] rounded-full overflow-hidden mb-10" aria-hidden>
              <div
                className="h-full bg-gradient-to-r from-[var(--fire-top)] to-[var(--fire-bot)] transition-all duration-300"
                style={{ width: `${((step + 1) / total) * 100}%` }}
              />
            </div>

            <AnimatePresence mode="wait">
              <m.div key={step} {...anim}>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.01em] text-[var(--ink)] mb-8 leading-relaxed">
                  {questions[step]?.q}
                </h2>
                <div className="flex flex-col gap-3">
                  {currentOptions.map((optText, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => pick(i)}
                      className="group text-left px-5 py-4 rounded-xl card-static text-sm sm:text-[15px] leading-relaxed text-[var(--ink-muted)] transition-all duration-200 hover:text-[var(--ink)] hover:border-[var(--accent)] active:scale-[0.99] flex items-center gap-3"
                    >
                      <span className="flex-none w-6 h-6 grid place-items-center rounded-md bg-[var(--surface-2)] text-[11px] font-mono text-[var(--ink-tertiary)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {optText}
                    </button>
                  ))}
                </div>
              </m.div>
            </AnimatePresence>
          </m.div>
        )}

        {view === 'result' && result && test && (
          <m.div key="result" {...anim} className="text-center">
            <p className="text-[10px] font-mono tracking-[0.24em] text-[var(--ink-tertiary)] mb-6">
              {test === 'mbti' ? `MBTI · ${MBTI_TIERS.find((t) => t.id === tier)!.label}` : FIRE_META.title} · 结果
            </p>
            <p
              className={`font-display font-semibold text-[var(--ink)] leading-none ${
                test === 'mbti' ? 'text-6xl sm:text-7xl tracking-tight' : 'text-5xl sm:text-6xl'
              }`}
            >
              {test === 'mbti' ? result.code : result.name}
            </p>
            <p className="mt-4 text-lg text-[var(--accent)] font-display italic">「{result.name}」 · {result.sub}</p>

            {result.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {result.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full border border-[var(--hairline)] bg-[var(--surface-2)] text-xs text-[var(--ink-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-7 text-sm sm:text-[15px] leading-[1.95] text-[var(--ink-muted)] max-w-[46ch] mx-auto text-left">
              {result.text}
            </p>

            {result.ember && (
              <p className="mt-6 font-display italic text-[var(--accent)] text-base">「{result.ember}」</p>
            )}

            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => start(test, tier)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--hairline-strong)] text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--ink-subtle)] transition-colors"
              >
                <RotateCcw className="w-4 h-4" aria-hidden />
                再测一次
              </button>
              <button
                type="button"
                onClick={copyResult}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent)] text-white text-sm hover:opacity-90 transition-opacity active:scale-[0.97]"
              >
                {copied ? <Check className="w-4 h-4" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />}
                {copied ? '已复制' : '复制结果'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setView('hub')}
              className="mt-8 text-xs font-mono text-[var(--ink-subtle)] hover:text-[var(--accent)] transition-colors"
            >
              ← 回试金石
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
