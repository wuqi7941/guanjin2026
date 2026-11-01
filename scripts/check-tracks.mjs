/**
 * check-tracks.mjs -- 逐首校验曲库（GD Studio 主源 / meting 备用）
 * 用法: npm run check-tracks
 *
 * 2026-11-01 重写。旧版三个问题：
 *   ① 两个 if 条件完全重复（复制粘贴），两源用同一判据，统计恒等；
 *   ② 只验 HTTP 302 不验音频大小，把 30 秒试听（481,115 B）也算"可用"
 *      —— 歌单全变试听那次就是这么漏过去的；
 *   ③ 解析失败时打印"共 0 首"然后 exit 0，等于永远通过。
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd())
const GD = (id) => `https://music-api.gdstudio.xyz/api.php?types=url&id=${id}&source=netease&br=320`
const METING = 'https://api.injahow.cn/meting/?type=url&id='
const NETEASE = 'https://music.163.com/song/media/outer/url?id='

/* 30 秒试听片段的典型大小（128kbps × 30s ≈ 481KB）；低于这条线一律算试听 */
const SAMPLE_MAX = 620_000
const TIMEOUT = 9000
const CONCURRENCY = 6

const src = fs.readFileSync(path.join(ROOT, 'lib', 'playlist.ts'), 'utf8')
const tracks = [...src.matchAll(/t:\s*"([^"]+)",\s*a:\s*"([^"]+)",\s*id:\s*(\d+)/g)].map((m) => ({
  t: m[1],
  a: m[2],
  id: Number(m[3]),
}))

/* 解析失败必须响：解析不到就是格式变了，不能静默通过 */
if (tracks.length === 0) {
  console.error('✗ 解析 lib/playlist.ts 失败：曲目格式变了（应为 t: "…", a: "…", id: N）')
  process.exit(1)
}

const fetchWithTimeout = (url, opts = {}) => fetch(url, { ...opts, signal: AbortSignal.timeout(TIMEOUT) })

/* 音频体积：只取 2 个字节，从 content-range 反推总长（比 HEAD 可靠，CDN 常常不带头长） */
async function audioSize(url) {
  try {
    const r = await fetchWithTimeout(url, { headers: { range: 'bytes=0-1' } })
    const cr = r.headers.get('content-range')
    if (cr) {
      const total = Number(cr.split('/')[1])
      if (Number.isFinite(total) && total > 0) return total
    }
    const len = Number(r.headers.get('content-length'))
    return Number.isFinite(len) && len > 0 ? len : null
  } catch {
    return null
  }
}

/* 主源：GD Studio。返回 ok / sample / no-url / unreachable / error */
async function probeGD(id) {
  try {
    const r = await fetchWithTimeout(GD(id))
    const j = await r.json()
    if (!j?.url) return { state: 'no-url' }
    const size = await audioSize(j.url)
    if (!size) return { state: 'unreachable' }
    return { state: size < SAMPLE_MAX ? 'sample' : 'ok', size }
  } catch {
    return { state: 'error' }
  }
}

/* 备用源：meting。只看能不能拿到 302 直链，顺带量一下大小 */
async function probeMeting(id) {
  try {
    const r = await fetchWithTimeout(METING + id, { redirect: 'manual' })
    if (r.status !== 302) return { state: 'dead', code: r.status }
    const loc = r.headers.get('location') || ''
    if (!/music\.126\.net/.test(loc)) return { state: 'redirect-other' }
    const size = await audioSize(loc)
    if (!size) return { state: 'unreachable' }
    return { state: size < SAMPLE_MAX ? 'sample' : 'ok', size }
  } catch {
    return { state: 'error' }
  }
}

const rows = []
let okCount = 0
let sampleCount = 0
let failCount = 0

/* 简易并发池：88 首串行要跑几分钟，6 路并发把耗时压到 30 秒内 */
let cursor = 0
async function worker() {
  while (cursor < tracks.length) {
    const i = cursor++
    const tr = tracks[i]
    const [gd, mt] = await Promise.all([probeGD(tr.id), probeMeting(tr.id)])
    const usable = gd.state === 'ok' || mt.state === 'ok'
    if (gd.state === 'ok') okCount++
    else if (gd.state === 'sample') sampleCount++
    else if (!usable) failCount++
    rows[i] = { ...tr, gd, meting: mt }
    const flag = gd.state === 'ok' ? '✓' : gd.state === 'sample' ? '⚠ 仅试听' : '✗'
    if (gd.state !== 'ok') {
      console.log(`  ${flag} ${tr.t} / ${tr.a}  id=${tr.id}  gd=${gd.state}${gd.size ? ' ' + Math.round(gd.size / 1024) + 'KB' : ''}  meting=${mt.state}`)
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker))

console.log(`\n共 ${tracks.length} 首 | 完整 ${okCount} | 只有试听 ${sampleCount} | 完全不可播 ${failCount}`)

fs.mkdirSync(path.join(ROOT, '.backup'), { recursive: true })
fs.writeFileSync(
  path.join(ROOT, '.backup', `track-check-${new Date().toISOString().slice(0, 10)}.json`),
  JSON.stringify(rows, null, 2),
)

if (failCount > 0 || sampleCount > 0) {
  console.error(`\n需要换源或下架：${failCount} 首不可播、${sampleCount} 首只有 30 秒试听`)
  process.exitCode = 1
}
