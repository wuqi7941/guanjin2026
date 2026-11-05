'use client'

/* 试金石：站内小测试（MBTI 三档 / 五行问 / 日柱 / 你是哪种火）。
   纯前端状态机，无后端；结果可复制分享。 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { m, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowLeft, RotateCcw, Copy, Check } from 'lucide-react'
import { EASE } from '@/lib/motion'
import {
  MBTI_TIERS,
  MBTI_TYPES,
  buildMbtiSet,
  FIRE_QUESTIONS,
  FIRE_RESULTS,
  WUXING_QUESTIONS,
  WUXING_RESULTS,
  WUXING_CN_TO_KEY,
  dayPillar,
  GAN_META,
  BRANCH_HOURS,
  hourPillar,
  fullBazi,
  meihuaNumbers,
  parseMeihuaInput,
  type FullBazi,
  type MeihuaResult,
  type MbtiTier,
  type FireKind,
  type WuxingKind,
} from '@/lib/tests'
import { exportReport } from '@/lib/report'
import {
  readProgress,
  saveProgress,
  dropProgress,
  PLAY_LABEL,
  playEntryHint,
  type PlayEntry,
  type PlayMap,
  type PlayTestId,
  type PlayView,
} from '@/lib/playProgress'

type TestId = 'mbti' | 'fire' | 'wuxing' | 'daypillar'
type View = 'hub' | 'tiers' | 'quiz' | 'result' | 'pillar' | 'meihua' | 'meihuaResult'

interface UnifiedResult {
  code: string
  name: string
  sub: string
  tags: string[]
  text: string
  ember: string
}

export function PlayHub() {
  const reduce = !!useReducedMotion()
  const [view, setView] = useState<View>('hub')
  const [test, setTest] = useState<TestId | null>(null)
  const [tier, setTier] = useState<MbtiTier>('std')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [copied, setCopied] = useState(false)
  const [overlay, setOverlay] = useState('')
  const [birth, setBirth] = useState('')
  const [hourIdx, setHourIdx] = useState(-1)
  const [hourText, setHourText] = useState('')
  const [bazi, setBazi] = useState<FullBazi | null>(null)
  const [mhInput, setMhInput] = useState('')
  const [mhResult, setMhResult] = useState<MeihuaResult | null>(null)
  /* 静态导出的 HTML 是构建时生成的：渲染期读当前日期会让服务端与客户端 hydrate 对不上；
     而且 toISOString 取 UTC，北京时间 00:00–08:00 会把「今天」算成昨天。
     改成挂载后用本地时区补上。 */
  const [today, setToday] = useState('')
  useEffect(() => {
    const d = new Date()
    const p = (n: number) => String(n).padStart(2, '0')
    setToday(`${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`)
  }, [])
  const [pillar, setPillar] = useState<UnifiedResult | null>(null)
  const [saved, setSaved] = useState<PlayMap>({})
  const [exitChoice, setExitChoice] = useState(false)

  const hubRef = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)

  /* 试金石是单页状态机：切视图、切题都不换路由，浏览器会保留上一段的滚动位置，
     于是从长结果页进新测试时停在下方一片空白。每次状态切换把测试区对齐到视口顶部。
     首次挂载不处理——否则刚进页面就被从标题处拽下去。 */
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    const el = hubRef.current
    if (!el) return
    /* scrollIntoView 遵守 html 的 scroll-padding-top（88px），自动避开固定导航；
       临时压掉 CSS 的 scroll-behavior:smooth，否则切换时变成一段慢滑动画。 */
    const root = document.documentElement
    const prev = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    el.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'auto' })
    root.style.scrollBehavior = prev
  }, [view, step])

  /* 导出兜底层：ESC 也能关，不用非得点空白处 */
  useEffect(() => {
    if (!overlay) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOverlay('')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [overlay])

  /* 进页面先把本机存档读出来，hub 顶部才有「继续」入口。
     localStorage 只在客户端读， SSR 阶段不碰。 */
  useEffect(() => {
    setSaved(readProgress())
  }, [])

  const [mbtiSet, setMbtiSet] = useState<ReturnType<typeof buildMbtiSet>>([])
  const questions = test === 'mbti' ? mbtiSet : test === 'fire' ? FIRE_QUESTIONS : WUXING_QUESTIONS
  const total = questions.length

  /* 答题 / 填生日 / 起卦 / 结果页都自动留一份存档，按测试分开互不覆盖。
     hub 与 tiers 不写——否则一进页面就把上次的进度冲成空。
     全部留在 localStorage，不上传；用户退出时仍可选择「清空答案」。 */
  useEffect(() => {
    const keepable: PlayView[] = ['quiz', 'result', 'pillar', 'meihua', 'meihuaResult']
    if (!keepable.includes(view as PlayView)) return
    const hasAny =
      step > 0 || answers.some((a) => typeof a === 'number') || !!birth || !!mhInput || !!pillar || !!mhResult
    if (!hasAny) return
    const key: PlayTestId = view === 'meihua' || view === 'meihuaResult' ? 'meihua' : (test ?? 'mbti')
    saveProgress({
      test: key,
      view: view as PlayView,
      tier,
      step,
      answers: answers.map((a) => (typeof a === 'number' ? a : null)),
      mbtiSet: key === 'mbti' ? mbtiSet : undefined,
      birth,
      hourIdx,
      hourText,
      pillar,
      bazi,
      mhInput,
      mhResult,
      savedAt: Date.now(),
    })
  }, [view, test, tier, step, answers, mbtiSet, birth, hourIdx, hourText, pillar, bazi, mhInput, mhResult])

  const result = useMemo<UnifiedResult | null>(() => {
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
      return { code, name: meta.name, sub: meta.fire, tags: meta.tags, text: meta.text, ember: meta.ember }
    }
    if (test === 'fire') {
      const tally: Record<FireKind, number> = { hearth: 0, candle: 0, bonfire: 0, spark: 0 }
      FIRE_QUESTIONS.forEach((q, i) => {
        const picked = answers[i]
        if (picked !== undefined) tally[q.options[picked].kind] += 1
      })
      const kind = (Object.keys(tally) as FireKind[]).reduce((a, b) => (tally[b] > tally[a] ? b : a))
      const meta = FIRE_RESULTS[kind]
      return { code: meta.en, name: meta.name, sub: meta.en, tags: [], text: meta.text, ember: '' }
    }
    if (test === 'wuxing') {
      const tally: Record<WuxingKind, number> = { metal: 0, wood: 0, water: 0, fire: 0, earth: 0 }
      WUXING_QUESTIONS.forEach((q, i) => {
        const picked = answers[i]
        if (picked !== undefined) tally[q.options[picked].kind] += 1
      })
      const kind = (Object.keys(tally) as WuxingKind[]).reduce((a, b) => (tally[b] > tally[a] ? b : a))
      const meta = WUXING_RESULTS[kind]
      return { code: meta.name, name: meta.gan, sub: `五行 · ${meta.name}`, tags: meta.tags, text: meta.text, ember: meta.ember }
    }
    return pillar
  }, [view, test, answers, mbtiSet, pillar])

  const savedList = Object.values(saved)
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, 3)

  /* 从存档回到原处：题目组合、已选答案、生日时辰、卦象、结果都还原 */
  const resume = (e: PlayEntry) => {
    const t: TestId | null = e.test === 'meihua' ? null : (e.test as TestId)
    const qs = Array.isArray(e.mbtiSet) ? e.mbtiSet : []
    const arr: number[] = []
    ;(e.answers ?? []).forEach((a, i) => {
      if (typeof a === 'number') arr[i] = a
    })
    const maxStep = e.test === 'mbti' ? qs.length || 16 : e.test === 'wuxing' ? 10 : 5
    const safeTier: MbtiTier =
      e.tier === 'quick' || e.tier === 'std' || e.tier === 'full' || e.tier === 'deep' ? e.tier : 'std'
    const safeHour = Number.isInteger(e.hourIdx)
      ? Math.max(-1, Math.min(11, e.hourIdx as number))
      : -1
    setTest(t)
    setTier(safeTier)
    setMbtiSet(qs)
    setAnswers(arr)
    setStep(Math.max(0, Math.min(e.step || 0, maxStep - 1)))
    setBirth(e.birth ?? '')
    setHourIdx(safeHour)
    setHourText(e.hourText ?? '')
    setBazi(e.bazi ?? null)
    setPillar(e.pillar ?? null)
    setMhInput(e.mhInput ?? '')
    setMhResult(e.mhResult ?? null)
    setExitChoice(false)
    setView(e.view as View)
  }

  const activeKey = (): PlayTestId =>
    view === 'meihua' || view === 'meihuaResult' ? 'meihua' : (test ?? 'mbti')

  /* 退出按钮的两个选项：留着 / 清空。
     八字生日时辰属于「完成测试也不清除的选项」，清空答案时不一起抹掉。 */
  const keepAndExit = () => {
    setSaved(readProgress())
    setExitChoice(false)
    setView('hub')
  }

  const discardAndExit = () => {
    dropProgress(activeKey())
    setSaved(readProgress())
    setStep(0)
    setAnswers([])
    setPillar(null)
    setBazi(null)
    setMhInput('')
    setMhResult(null)
    setHourText('')
    setExitChoice(false)
    setView('hub')
  }

  const start = (id: TestId, t?: MbtiTier) => {
    setTest(id)
    if (id === 'mbti') {
      setTier(t ?? 'std')
      setMbtiSet(buildMbtiSet(t ?? 'std'))
    }
    setStep(0)
    setAnswers([])
    setPillar(null)
    setView(id === 'daypillar' ? 'pillar' : 'quiz')
  }

  const calcPillar = () => {
    const p = dayPillar(birth)
    if (!p) return
    const meta = GAN_META[p.gan]
    let hText = ''
    let code = `${p.gan}${p.zhi}`
    if (hourIdx >= 0) {
      const h = hourPillar(p.gan, BRANCH_HOURS[hourIdx].h)
      if (h) {
        hText = `${h.gan}${h.zhi}时`
        code = `${p.gan}${p.zhi} · ${h.gan}${h.zhi}时`
      }
    }
    setHourText(hText)
    setBazi(fullBazi(birth, hourIdx))
    setPillar({
      code,
      name: `${meta.yinYang} · ${meta.wuxing}`,
      sub: meta.image,
      tags: meta.tags,
      text: meta.text,
      ember: meta.ember,
    })
    setView('result')
  }

  const mhParsed = parseMeihuaInput(mhInput)
  const castMeihua = () => {
    if (!mhParsed) return
    const r = meihuaNumbers(mhParsed[0], mhParsed[1], mhParsed[2])
    if (!r) return
    setMhResult(r)
    setView('meihuaResult')
  }

  const back = () => {
    if (step > 0) setStep(step - 1)
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
        : test === 'daypillar'
          ? `我的日柱是 ${result.code}（${result.name}）`
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
      : test === 'fire'
        ? (FIRE_QUESTIONS[step]?.options.map((o) => o.text) ?? [])
        : (WUXING_QUESTIONS[step]?.options.map((o) => o.text) ?? [])

  /* 退出选项：不给浏览器弹窗，就在原地给两个明确的选择。
     尺寸、圆角、字号沿用站里已有的按钮语言；窄屏两行排布，不挤成一团。 */
  const exitPanel = (
    <m.div {...anim} className="mb-6 card-static rounded-[var(--radius-md)] px-4 sm:px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--ink)]">退出后，已选的答案要留着吗？</p>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-tertiary)]">
            留着就回试金石点「继续」接着答；八字填的生日时辰、起卦数字也一起留着。
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExitChoice(false)}
          className="flex-none text-[11px] font-mono text-[var(--ink-tertiary)] hover:text-[var(--accent)] transition-colors"
        >
          继续
        </button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={keepAndExit}
          className="px-5 py-2.5 rounded-full bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.97]"
        >
          保存答案
        </button>
        <button
          type="button"
          onClick={discardAndExit}
          className="px-5 py-2.5 rounded-full border border-[var(--hairline-strong)] text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--ink-subtle)] transition-colors"
        >
          清空答案
        </button>
      </div>
    </m.div>
  )

  return (
    <div ref={hubRef} className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {view === 'hub' && (
          <m.div key="hub" {...anim} className="grid sm:grid-cols-2 gap-5">
            {savedList.length > 0 && (
              <div className="sm:col-span-2 card-static rounded-[var(--radius-md)] px-4 sm:px-5 py-4 flex flex-col gap-3">
                <p className="text-[10px] font-mono tracking-[0.2em] text-[var(--ink-tertiary)]">
                  上次没做完 · 答案都还在
                </p>
                {savedList.map((e) => (
                  <div key={e.test} className="flex items-center justify-between gap-3">
                    {/* 两行结构：标题一行、等宽元信息一行，320px 窄屏也不会挤成一坨 */}
                    <button type="button" onClick={() => resume(e)} className="group min-w-0 flex-1 text-left">
                      <span className="block text-sm font-medium text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors truncate">
                        {PLAY_LABEL[e.test]}
                        <span aria-hidden className="ml-1.5 text-[var(--accent)]">→</span>
                      </span>
                      <span className="block mt-0.5 text-[11px] font-mono tracking-wide text-[var(--ink-tertiary)]">
                        继续 · {playEntryHint(e)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        dropProgress(e.test)
                        setSaved(readProgress())
                      }}
                      aria-label={`清除${PLAY_LABEL[e.test]}的进度`}
                      className="flex-none px-2 py-1 text-[11px] font-mono text-[var(--ink-tertiary)] hover:text-[var(--accent)] transition-colors"
                    >
                      清除
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => setView('tiers')} className="acard text-left p-6 sm:p-7">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[var(--ink-tertiary)]">四档 · 2-30 分钟</span>
              <h2 className="acard-title mt-3">MBTI</h2>
              <p className="acard-excerpt mt-2">
                十六型人格测试。速测 16、标准 32、深测 48、深挖 200——题库里抽，每档都能测。
              </p>
              <span className="acard-go mt-4">
                开始
                <span aria-hidden>→</span>
              </span>
            </button>
            <button type="button" onClick={() => start('daypillar')} className="acard text-left p-6 sm:p-7">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[var(--ink-tertiary)]">真算法 · 10 秒</span>
              <h2 className="acard-title mt-3">八字 · 日柱</h2>
              <p className="acard-excerpt mt-2">
                输入公历生日，算出你的日柱干支——十天干日主，各有各的命。
              </p>
              <span className="acard-go mt-4">
                开始
                <span aria-hidden>→</span>
              </span>
            </button>
            <button type="button" onClick={() => start('wuxing')} className="acard text-left p-6 sm:p-7">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[var(--ink-tertiary)]">原创 · 约 2 分钟</span>
              <h2 className="acard-title mt-3">五行问</h2>
              <p className="acard-excerpt mt-2">
                十道五选一：金主义、木主仁、水主智、火主礼、土主信。你的底色是哪一行。
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
            <button type="button" onClick={() => setView('meihua')} className="acard text-left p-6 sm:p-7">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[var(--ink-tertiary)]">梅花易数 · 10 秒</span>
              <h2 className="acard-title mt-3">三数起卦</h2>
              <p className="acard-excerpt mt-2">
                心里想一件事，随口报三个数——上卦、下卦、动爻，一次起完。
              </p>
              <span className="acard-go mt-4">
                起卦
                <span aria-hidden>→</span>
              </span>
            </button>
            <p className="sm:col-span-2 text-xs leading-relaxed text-[var(--ink-subtle)] max-w-[56ch]">
              都是纯前端的小测试：答案不离开你的浏览器，不上传、不记录。
              日柱是真实的干支纪日换算（锚点经多源万年历核验），但完整八字要看年月时三柱——这里只管你出生那天。
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
              题库 200 题，按维度随机抽——同一档重测，题目也不完全一样。档位越高越准。
            </p>
            <div className="flex flex-col gap-3">
              {MBTI_TIERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => start('mbti', t.id)}
                  className="group text-left px-5 py-4 rounded-[var(--radius-md)] card-static transition-all duration-200 hover:border-[var(--accent)] active:scale-[0.99] flex items-center justify-between gap-3"
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

        {view === 'pillar' && (
          <m.div key="pillar" {...anim}>
            <button
              type="button"
              onClick={() => setExitChoice(true)}
              className="flex items-center gap-1.5 text-xs font-mono text-[var(--ink-subtle)] hover:text-[var(--accent)] transition-colors mb-8"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
              返回
            </button>
            {exitChoice && exitPanel}
            <h2 className="text-2xl font-semibold tracking-[-0.01em] text-[var(--ink)] mb-2">八字 · 日柱与时柱</h2>
            <p className="text-sm text-[var(--ink-subtle)] mb-3 max-w-[50ch]">
              输入公历出生日期（1990 年至今）；知道出生时辰的话一起选上，时柱用五鼠遁推算。
            </p>
            <p className="text-xs leading-relaxed text-[var(--ink-tertiary)] mb-8 max-w-[52ch]">
              本页按北京时间（UTC+8）计算。命理师常用「真太阳时」（出生地经度修正，
              可能比北京时间早或晚半小时以上）——若和大师排的不一致，多半差在这里：
              把大师给的时辰换算回北京时间再选即可。
            </p>
            <div className="flex flex-col gap-4">
              <label htmlFor="pillar-date" className="text-[11px] font-mono text-[var(--ink-tertiary)]">
                公历生日
              </label>
              <input
                id="pillar-date"
                type="date"
                value={birth}
                min="1990-01-01"
                max={today}
                onChange={(e) => setBirth(e.target.value)}
                className="px-4 py-3 rounded-[var(--radius-md)] text-[16px] sm:text-sm bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink)] outline-none transition-colors duration-200 focus:border-[var(--accent)] max-w-xs"
              />
              <label htmlFor="pillar-hour" className="text-[11px] font-mono text-[var(--ink-tertiary)]">
                出生时辰（可选，用于时柱）
              </label>
              <select
                id="pillar-hour"
                value={hourIdx}
                onChange={(e) => setHourIdx(Number(e.target.value))}
                className="px-4 py-3 rounded-[var(--radius-md)] text-[16px] sm:text-sm bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink)] outline-none transition-colors duration-200 focus:border-[var(--accent)] max-w-xs"
              >
                <option value={-1}>不知道 / 不说</option>
                {BRANCH_HOURS.map((b, i) => (
                  <option key={b.zhi} value={i}>
                    {b.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={calcPillar}
                disabled={!birth}
                className={`self-start inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                  birth ? 'bg-[var(--accent)] text-white hover:opacity-90' : 'opacity-45 cursor-not-allowed'
                }`}
              >
                排我的日柱
              </button>
            </div>
          </m.div>
        )}

        {view === 'meihua' && (
          <m.div key="meihua" {...anim}>
            <button
              type="button"
              onClick={() => setExitChoice(true)}
              className="flex items-center gap-1.5 text-xs font-mono text-[var(--ink-subtle)] hover:text-[var(--accent)] transition-colors mb-8"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
              返回
            </button>
            {exitChoice && exitPanel}
            <h2 className="text-2xl font-semibold tracking-[-0.01em] text-[var(--ink)] mb-2">梅花易数 · 三数起卦</h2>
            <p className="text-sm text-[var(--ink-subtle)] mb-3 max-w-[52ch]">
              心里想一件事，随口报三个数（一至九百九十九）。
              第一数定上卦，第二数定下卦，第三数定动爻——老法子是这么起的。
            </p>
            <p className="text-xs text-[var(--ink-tertiary)] mb-8 max-w-[52ch]">
              数字取余八定卦、余六定动爻；动爻所在的一卦为用，另一卦为体，按五行生克看吉凶。
            </p>
            <div className="flex flex-col gap-4 max-w-sm">
              <label htmlFor="mh-input" className="text-[11px] font-mono text-[var(--ink-tertiary)]">
                三个数（空格分开，或连写三位）
              </label>
              <input
                id="mh-input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={mhInput}
                onChange={(e) => setMhInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') castMeihua()
                }}
                placeholder="例如：3 5 7 或 357"
                className="px-4 py-3 rounded-[var(--radius-md)] text-[16px] sm:text-sm bg-[var(--surface-2)] border border-[var(--hairline)] text-[var(--ink)] placeholder:text-[var(--ink-tertiary)] outline-none transition-colors duration-200 focus:border-[var(--accent)]"
              />
              {/* 实时解析预览：让用户确认三个数分到了哪 */}
              <p className="text-xs font-mono text-[var(--ink-tertiary)] h-4" aria-live="polite">
                {mhParsed
                  ? `上卦数 ${mhParsed[0]} · 下卦数 ${mhParsed[1]} · 动爻数 ${mhParsed[2]}`
                  : mhInput.trim()
                    ? '没读懂——三个数用空格分开，或连写三位（如 357）'
                    : ''}
              </p>
              <button
                type="button"
                onClick={castMeihua}
                disabled={!mhParsed}
                className={`self-start inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                  mhParsed ? 'bg-[var(--accent)] text-white hover:opacity-90' : 'opacity-45 cursor-not-allowed bg-[var(--accent)] text-white'
                }`}
              >
                起卦
              </button>
            </div>
          </m.div>
        )}

        {view === 'meihuaResult' && mhResult && (
          <m.div key="meihuaResult" {...anim}>
            <button
              type="button"
              onClick={() => setView('meihua')}
              className="flex items-center gap-1.5 text-xs font-mono text-[var(--ink-subtle)] hover:text-[var(--accent)] transition-colors mb-8"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
              再起一卦
            </button>
            <p className="text-[10px] font-mono tracking-[0.24em] text-[var(--ink-tertiary)] mb-6 text-center">
              梅花易数 · 三数起卦
            </p>
            <p className="text-center text-sm text-[var(--ink-muted)] mb-8">
              数字 {mhResult.nums.join(' · ')}
            </p>

            <div className="flex items-start justify-center gap-10 sm:gap-16">
              {([
                { title: '本卦', upper: mhResult.upper, lower: mhResult.lower, lines: mhResult.lines, moving: mhResult.moving },
                { title: '变卦', upper: mhResult.bianUpper, lower: mhResult.bianLower, lines: mhResult.bianLines, moving: 0 },
              ] as const).map((g) => (
                <div key={g.title} className="text-center">
                  <p className="text-[11px] font-mono text-[var(--ink-tertiary)] mb-3">{g.title}</p>
                  <p className="text-xs text-[var(--ink-muted)] mb-3">
                    上{g.upper} · 下{g.lower}
                  </p>
                  <div className="flex flex-col gap-1.5 items-center">
                    {[...g.lines].reverse().map((v, ri) => {
                      const yaoIdx = g.lines.length - ri
                      const isMoving = g.moving === yaoIdx
                      return (
                        <div key={ri} className="flex items-center gap-2">
                          {v === 1 ? (
                            <span className="block h-[6px] w-16 rounded-full bg-[var(--ink)]" />
                          ) : (
                            <span className="flex items-center w-16 gap-2">
                              <span className="block h-[6px] w-[29px] rounded-full bg-[var(--ink)]" />
                              <span className="block h-[6px] w-[29px] rounded-full bg-[var(--ink)]" />
                            </span>
                          )}
                          <span
                            className={`w-6 text-[10px] font-mono ${isMoving ? 'text-[var(--accent)]' : 'text-transparent'}`}
                          >
                            {isMoving ? '动' : '·'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* 解析：组合意象 / 体用 / 变卦去向 */}
            <div className="mt-10 max-w-md mx-auto flex flex-col gap-4 text-left">
              <p className="text-sm sm:text-[15px] leading-[1.9] text-[var(--ink-muted)]">{mhResult.composition}</p>
              <p className="text-sm sm:text-[15px] leading-[1.9] text-[var(--ink-muted)]">{mhResult.bodyUse}</p>
              <p className="text-sm sm:text-[15px] leading-[1.9] text-[var(--ink-muted)]">{mhResult.bianText}</p>
            </div>

            <p
              className={`mt-8 text-center text-base font-display ${
                mhResult.tone === 'good' ? 'text-[var(--fire-top)]' : mhResult.tone === 'watch' ? 'text-[var(--ink-muted)]' : 'text-[var(--accent)]'
              }`}
            >
              {mhResult.verdict}
            </p>
            <p className="mt-6 text-xs leading-relaxed text-[var(--ink-tertiary)] text-center max-w-[52ch] mx-auto">
              卦象按先天八卦数与体用五行生克推。传统说法是「卦由心生，数由口出」——
              同一个数只起一次卦，问过的事，不必再问。
            </p>
          </m.div>
        )}

        {view === 'quiz' && test && (
          <m.div key="quiz" {...anim}>
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => setExitChoice(true)}
                className="flex items-center gap-1.5 text-xs font-mono text-[var(--ink-subtle)] hover:text-[var(--accent)] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
                退出
              </button>
              <span className="text-xs font-mono text-[var(--ink-tertiary)] tabular-nums">
                {step + 1} / {total}
              </span>
            </div>

            {exitChoice && exitPanel}

            {/* 进度条 */}
            <div className="h-[3px] bg-[var(--surface-2)] rounded-full overflow-hidden mb-6" aria-hidden>
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
                      className="group text-left px-5 py-4 rounded-[var(--radius-md)] card-static text-sm sm:text-[15px] leading-relaxed text-[var(--ink-muted)] transition-all duration-200 hover:text-[var(--ink)] hover:border-[var(--accent)] active:scale-[0.99] flex items-center gap-3"
                    >
                      <span className="flex-none w-6 h-6 grid place-items-center rounded-md bg-[var(--surface-2)] text-[11px] font-mono text-[var(--ink-tertiary)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {optText}
                    </button>
                  ))}
                </div>
                {/* 返回上一题 */}
                <button
                  type="button"
                  onClick={back}
                  disabled={step === 0}
                  className={`mt-6 inline-flex items-center gap-1.5 text-xs font-mono transition-colors ${
                    step === 0 ? 'opacity-30 cursor-default text-[var(--ink-tertiary)]' : 'text-[var(--ink-subtle)] hover:text-[var(--accent)]'
                  }`}
                >
                  <ArrowLeft className="w-3 h-3" aria-hidden />
                  上一题
                </button>
              </m.div>
            </AnimatePresence>
          </m.div>
        )}

        {view === 'result' && result && test && (
          <m.div key="result" {...anim} className="text-center">
            <p className="text-[10px] font-mono tracking-[0.24em] text-[var(--ink-tertiary)] mb-6">
              {test === 'mbti' ? `MBTI · ${MBTI_TIERS.find((t) => t.id === tier)?.label ?? 'MBTI'}` : test === 'daypillar' ? '八字 · 日柱' : test === 'wuxing' ? '五行问 · 结果' : '你是哪种火 · 结果'}
            </p>
            <p
              className={`font-display font-semibold text-[var(--ink)] leading-none ${
                test === 'mbti' || test === 'daypillar' ? 'text-5xl sm:text-6xl tracking-tight' : 'text-6xl sm:text-7xl'
              }`}
            >
              {result.code}
            </p>
            <p className="mt-4 text-lg text-[var(--accent)] font-display italic">
              {result.name} · {result.sub}
            </p>

            {/* 八字完整报告：四柱 + 五行分布 + 流年 + 梅花 */}
            {test === 'daypillar' && bazi && (
              <div className="mt-8 text-left max-w-md mx-auto w-full">
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {([['年柱', bazi.pillars.year], ['月柱', bazi.pillars.month], ['日柱', bazi.pillars.day], ['时柱', bazi.pillars.hour]] as const).map(
                    ([label, pz]) => (
                      <div key={label} className="card-static rounded-[var(--radius-md)] py-3 text-center">
                        <div className="text-[10px] font-mono text-[var(--ink-tertiary)] mb-1">{label}</div>
                        <div className="font-display text-2xl font-semibold text-[var(--ink)] leading-tight">
                          {pz ? pz.gan : '—'}
                          <br />
                          {pz ? pz.zhi : '—'}
                        </div>
                      </div>
                    ),
                  )}
                </div>

                <p className="text-[11px] font-mono text-[var(--ink-tertiary)] mb-2">五行分布 · 偏 {bazi.wuxingTop}</p>
                <div className="flex flex-col gap-1.5 mb-6">
                  {Object.entries(bazi.wuxingCount).map(([wx, n]) => (
                    <div key={wx} className="flex items-center gap-2">
                      <span className="w-5 text-sm font-display text-[var(--ink-muted)]">{wx}</span>
                      <div className="flex-1 h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--accent)] opacity-80"
                          style={{ width: `${(n / 8) * 100}%` }}
                        />
                      </div>
                      <span className="w-4 text-right text-xs font-mono text-[var(--ink-tertiary)]">{n}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] font-mono text-[var(--ink-tertiary)] mb-2">流年（以日主为基准）</p>
                <div className="flex flex-col gap-1 mb-6">
                  {bazi.liunian.map((ln) => (
                    <div key={ln.year} className="flex items-center gap-3 text-sm">
                      <span className="font-mono text-xs text-[var(--ink-tertiary)] w-10 tabular-nums">{ln.year}</span>
                      <span className="font-display text-[var(--ink)] w-10">{ln.ganZhi}</span>
                      <span
                        className={`text-xs ${
                          ln.tone === 'good'
                            ? 'text-[var(--fire-top)]'
                            : ln.tone === 'watch'
                              ? 'text-[var(--ink-tertiary)]'
                              : 'text-[var(--ink-muted)]'
                        }`}
                      >
                        {ln.label}
                      </span>
                    </div>
                  ))}
                </div>

                {bazi.meihua && (
                  <div className="card-static rounded-[var(--radius-md)] p-4 mb-2">
                    <p className="text-[11px] font-mono text-[var(--ink-tertiary)] mb-2">
                      梅花易数 · 时间起卦（趣味参考）
                    </p>
                    <p className="font-display text-lg text-[var(--ink)]">
                      上{bazi.meihua.upper} 下{bazi.meihua.lower} · 动爻{bazi.meihua.moving}
                    </p>
                    <p
                      className={`mt-1 text-sm ${
                        bazi.meihua.tone === 'good' ? 'text-[var(--fire-top)]' : 'text-[var(--ink-muted)]'
                      }`}
                    >
                      {bazi.meihua.verdict}
                    </p>
                  </div>
                )}

                <p className="text-[11px] leading-relaxed text-[var(--ink-tertiary)] mt-4">
                  年柱月柱的节气分界按平均日期近似（边界生日可能差一日）；日柱时柱精确。
                  排盘为趣味参考，不做真断命——命是自己写的，八字只是纸。
                </p>
              </div>
            )}

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

            {/* 主操作行：导出报告图 + 复制结果（APP 窄屏下也最先看到） */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  exportReport(
                    {
                      kicker: test === 'mbti' ? 'MBTI' : test === 'wuxing' ? '五行问' : test === 'daypillar' ? '八字 · 四柱' : '你是哪种火',
                      code: result.code,
                      name: result.name,
                      sub: result.sub,
                      tags: result.tags,
                      text: result.text,
                      ember: result.ember,
                      pillars:
                        test === 'daypillar' && bazi
                          ? [
                              `${bazi.pillars.year.gan}${bazi.pillars.year.zhi}`,
                              `${bazi.pillars.month.gan}${bazi.pillars.month.zhi}`,
                              `${bazi.pillars.day.gan}${bazi.pillars.day.zhi}`,
                              bazi.pillars.hour ? `${bazi.pillars.hour.gan}${bazi.pillars.hour.zhi}` : '——',
                            ]
                          : undefined,
                    },
                    `embers-${test}-${result.code}.png`,
                    setOverlay,
                  )
                }
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.97]"
              >
                导出报告图
              </button>
              <button
                type="button"
                onClick={copyResult}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--hairline-strong)] text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--ink-subtle)] transition-colors"
              >
                {copied ? <Check className="w-4 h-4" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />}
                {copied ? '已复制' : '复制文字'}
              </button>
            </div>

            <p className="mt-7 text-sm sm:text-[15px] leading-[1.95] text-[var(--ink-muted)] max-w-[46ch] mx-auto text-left">
              {result.text}
            </p>

            {test === 'daypillar' && bazi && (
              <p className="mt-4 text-sm sm:text-[15px] leading-[1.95] text-[var(--ink-muted)] max-w-[46ch] mx-auto text-left">
                <span className="text-[var(--accent)]">五行偏「{bazi.wuxingTop}」——</span>
                {WUXING_RESULTS[WUXING_CN_TO_KEY[bazi.wuxingTop] as keyof typeof WUXING_RESULTS].text}
              </p>
            )}

            {result.ember && (
              <p className="mt-6 font-display italic text-[var(--accent)] text-base">「{result.ember}」</p>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {test === 'daypillar' ? (
                <button
                  type="button"
                  onClick={() => setView('pillar')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--hairline-strong)] text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--ink-subtle)] transition-colors"
                >
                  改生日 / 时辰
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(answers.filter((a) => a !== undefined).length - 1)
                      setView('quiz')
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--hairline-strong)] text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--ink-subtle)] transition-colors"
                  >
                    修改答案
                  </button>
                  <button
                    type="button"
                    onClick={() => start(test, tier)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--hairline-strong)] text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--ink-subtle)] transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden />
                    再测一次
                  </button>
                </>
              )}
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

      {/* 导出兜底层：WebView 不支持下载时，显示图片让用户长按保存 */}
      {overlay && (
        <div
          className="fixed inset-0 z-[95] bg-black/85 flex flex-col items-center justify-center gap-4 px-6"
          onClick={() => setOverlay('')}
          role="dialog"
          aria-label="长按图片保存"
        >
          <p className="text-sm text-white/90 font-mono">长按图片保存 · 点空白处关闭</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* 点图片不能冒泡到遮罩的关闭：否则 APP 里刚按住想保存，层就没了 */}
          <img
            src={overlay}
            alt="测试报告"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[70vh] max-w-full rounded-lg shadow-2xl"
          />
          <button
            type="button"
            onClick={() => setOverlay('')}
            className="px-6 py-2.5 rounded-full bg-white/90 text-black text-sm"
          >
            关闭
          </button>
        </div>
      )}
    </div>
  )
}
