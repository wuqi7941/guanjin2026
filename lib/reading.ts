'use client'

import { collectEgg } from './eggs'

/* 阅读痕迹：进度与书签，纯本地（localStorage），不上传。
   进度用于「继续阅读」，书签用于收藏夹。都只存 slug，正文不落地。 */

const PROGRESS_KEY = 'embers_reading'
const BOOKMARK_KEY = 'embers_bookmarks'
const MAX_PROGRESS = 80

interface ProgressEntry {
  p: number
  t: number
}

type ProgressMap = Record<string, ProgressEntry>

/* localStorage 是外部输入：JSON.parse 成功不代表形状对。
   旧版本格式、用户手改、其他站同名 key 都能让 `as T` 强转骗过类型系统，
   然后在 .includes / Object.entries 上炸掉整块 UI。这里统一验形状。 */
const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string')

const isProgressMap = (v: unknown): v is ProgressMap =>
  !!v &&
  typeof v === 'object' &&
  !Array.isArray(v) &&
  Object.values(v as Record<string, unknown>).every(
    (e) =>
      !!e &&
      typeof e === 'object' &&
      typeof (e as ProgressEntry).p === 'number' &&
      typeof (e as ProgressEntry).t === 'number',
  )

function read<T>(key: string, fallback: T, valid?: (v: unknown) => v is T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (valid && !valid(parsed)) return fallback
    return parsed as T
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent('embers-reading'))
  } catch {
    /* 隐私模式/配额满：静默失败，不影响阅读 */
  }
}

export function saveProgress(slug: string, ratio: number) {
  if (!slug || !isFinite(ratio)) return
  const map = read<ProgressMap>(PROGRESS_KEY, {}, isProgressMap)
  map[slug] = { p: Math.max(0, Math.min(1, ratio)), t: Date.now() }
  const kept = Object.entries(map)
    .sort((a, b) => b[1].t - a[1].t)
    .slice(0, MAX_PROGRESS)
  write(PROGRESS_KEY, Object.fromEntries(kept))
}

export function getProgress(slug: string): number {
  const map = read<ProgressMap>(PROGRESS_KEY, {}, isProgressMap)
  return map[slug]?.p ?? 0
}

/* 最近一篇「读了但没读完」的文章。
   区间只在这里定一次——调用方不要再自己写一套阈值，
   否则会出现「getResume 给了候选、UI 又嫌它不合格」的静默失效。 */
export function getResume(min = 0.03, max = 0.95): { slug: string; p: number } | null {
  const map = read<ProgressMap>(PROGRESS_KEY, {}, isProgressMap)
  const ordered = Object.entries(map)
    .filter(([, v]) => v.p > min && v.p < max)
    .sort((a, b) => b[1].t - a[1].t)
  const first = ordered[0]
  return first ? { slug: first[0], p: first[1].p } : null
}

export function getBookmarks(): string[] {
  return read<string[]>(BOOKMARK_KEY, [], isStringArray)
}

export function isBookmarked(slug: string): boolean {
  return getBookmarks().includes(slug)
}

export function toggleBookmark(slug: string): boolean {
  const list = getBookmarks()
  const next = list.includes(slug) ? list.filter((s) => s !== slug) : [slug, ...list]
  write(BOOKMARK_KEY, next)

  /* 暗语「满架」：收藏收满十篇 */
  if (next.length >= 10) collectEgg('shelf')

  return next.includes(slug)
}

/* 读完的篇数（进度 > 90%），给暗语「夜读」用 */
export function countFinished(): number {
  const map = read<ProgressMap>(PROGRESS_KEY, {}, isProgressMap)
  return Object.values(map).filter((v) => v.p > 0.9).length
}

export function clearBookmarks() {
  write(BOOKMARK_KEY, [])
}
