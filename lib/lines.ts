import { getSearchDocs } from './posts'

/* 每日一句：构建期从每篇文章的正文里挑出一句最有分量的话，
   生成 /daily-lines.json；客户端按当天的日期取一条。
   这样不必每次部署才换句子——一年 365 天，207 篇轮着来。 */

export interface DailyLine {
  text: string
  slug: string
  title: string
  date: string
}

const SENTENCE_END = /(?<=[。！？])/

/* 挑句子的偏好：带「我 / 他们 / 没有 / 如果」的更像在说话；
   长度 18–40 字最好念；太短没味道，太长像段落。 */
function scoreLine(s: string): number {
  let n = 0
  if (s.includes('我')) n += 3
  if (s.includes('他们')) n += 2
  if (s.includes('没有')) n += 2
  if (s.includes('如果')) n += 2
  if (s.includes('不是')) n += 1
  if (s.includes('不知道')) n += 1
  if (s.includes('——')) n -= 1
  if (s.length >= 18 && s.length <= 40) n += 2
  n -= Math.abs(s.length - 26) / 10
  return n
}

export function getDailyLines(): DailyLine[] {
  const out: DailyLine[] = []
  const seen = new Set<string>()

  for (const doc of getSearchDocs()) {
    const candidates: string[] = []
    for (const para of doc.body.split('\n')) {
      for (const raw of para.split(SENTENCE_END)) {
        /* 去掉列表序号（"6. " / "1、"）与行首标记，避免抽到清单项 */
        const s = raw.replace(/^\s*\d+\s*[.、)）]\s*/, '').trim()
        if (s.length < 14 || s.length > 46) continue
        if (!/[。！？]$/.test(s)) continue
        if (/^[#>*\-|]/.test(s)) continue
        /* 带引号/冒号的句子多是对话残片，单独拎出来会莫名其妙 */
        if (/["“”「」『』]/.test(s)) continue
        if (/[：:]\s*。?$/.test(s)) continue
        if ((s.match(/[，,]/g) || []).length > 4) continue
        candidates.push(s)
      }
    }
    if (candidates.length === 0) continue

    let best = ''
    let bestScore = -Infinity
    for (const c of candidates) {
      if (seen.has(c)) continue
      const sc = scoreLine(c)
      if (sc > bestScore) {
        bestScore = sc
        best = c
      }
    }
    if (!best) continue
    seen.add(best)
    out.push({ text: best, slug: doc.slug, title: doc.title, date: doc.date })
  }

  return out
}
