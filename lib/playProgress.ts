'use client'

/* 试金石进度：按测试分别存在本机，纯前端，不上传。
   退出时给「保存 / 清空」的选项，回来能接着答；八字填的生日时辰、起卦数字、
   以及已经算出的结果都一起留着，不会一退出就归零。
   localStorage 是外部输入，读取一律先验形状——旧版本格式、手改、其他站同名 key
   都不能让它把整块 UI 带崩（沿用 lib/reading.ts 的做法）。 */

import type { MbtiQuestion, FullBazi, MeihuaResult, MbtiTier } from '@/lib/tests'

const KEY = 'embers-play-progress'
const MAX_AGE = 30 * 24 * 60 * 60 * 1000

export type PlayTestId = 'mbti' | 'fire' | 'wuxing' | 'daypillar' | 'meihua'
export type PlayView = 'quiz' | 'result' | 'pillar' | 'meihua' | 'meihuaResult'

export interface PlayResult {
  code: string
  name: string
  sub: string
  tags: string[]
  text: string
  ember: string
}

export interface PlayEntry {
  test: PlayTestId
  view: PlayView
  tier: MbtiTier
  step: number
  /* 稀疏数组序列化后空洞会变 null，恢复时再还原成空洞 */
  answers: (number | null)[]
  mbtiSet?: MbtiQuestion[]
  birth?: string
  hourIdx?: number
  hourText?: string
  pillar?: PlayResult | null
  bazi?: FullBazi | null
  mhInput?: string
  mhResult?: MeihuaResult | null
  savedAt: number
}

export type PlayMap = Record<string, PlayEntry>

const TESTS: PlayTestId[] = ['mbti', 'fire', 'wuxing', 'daypillar', 'meihua']
const VIEWS: PlayView[] = ['quiz', 'result', 'pillar', 'meihua', 'meihuaResult']
const TIERS: string[] = ['quick', 'std', 'full', 'deep']

function isPlayMap(v: unknown): v is PlayMap {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false
  return Object.entries(v as Record<string, unknown>).every(([k, e]) => {
    if (!TESTS.includes(k as PlayTestId) || !e || typeof e !== 'object' || Array.isArray(e)) return false
    const x = e as Partial<PlayEntry>
    return (
      x.test === k &&
      typeof x.view === 'string' &&
      VIEWS.includes(x.view as PlayView) &&
      typeof x.step === 'number' &&
      Number.isFinite(x.step) &&
      x.step >= 0 &&
      Array.isArray(x.answers) &&
      x.answers.every((a) => a === null || (typeof a === 'number' && Number.isInteger(a) && a >= 0)) &&
      /* 档位非法会让结果页的 MBTI_TIERS.find(...)!.label 直接炸；
         时辰越界会让 BRANCH_HOURS[hourIdx].h 取到 undefined。存档一律卡在合法区间。 */
      (x.tier === undefined || (typeof x.tier === 'string' && TIERS.includes(x.tier))) &&
      (x.hourIdx === undefined ||
        (typeof x.hourIdx === 'number' && Number.isInteger(x.hourIdx) && x.hourIdx >= -1 && x.hourIdx <= 11)) &&
      (x.birth === undefined || typeof x.birth === 'string') &&
      (x.mhInput === undefined || typeof x.mhInput === 'string') &&
      typeof x.savedAt === 'number'
    )
  })
}

export function readProgress(): PlayMap {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!isPlayMap(parsed)) return {}
    const now = Date.now()
    const out: PlayMap = {}
    for (const [k, e] of Object.entries(parsed)) {
      if (Number.isFinite(e.savedAt) && now - e.savedAt < MAX_AGE) out[k] = e
    }
    return out
  } catch {
    return {}
  }
}

export function saveProgress(entry: PlayEntry) {
  try {
    const map = readProgress()
    map[entry.test] = entry
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    /* 隐私模式 / 配额满：静默失败，测试照样能做完 */
  }
}

export function dropProgress(test?: PlayTestId) {
  try {
    if (!test) {
      localStorage.removeItem(KEY)
      return
    }
    const map = readProgress()
    delete map[test]
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

export const PLAY_LABEL: Record<PlayTestId, string> = {
  mbti: 'MBTI',
  fire: '你是哪种火',
  wuxing: '五行问',
  daypillar: '八字 · 日柱',
  meihua: '三数起卦',
}

export function playEntryHint(e: PlayEntry): string {
  if (e.view === 'result') return '上次的结果'
  if (e.view === 'meihuaResult') return '上次的卦象'
  if (e.view === 'pillar') return '生日时辰已留着'
  if (e.view === 'meihua') return '数字已留着'
  return `第 ${e.step + 1} 题`
}
