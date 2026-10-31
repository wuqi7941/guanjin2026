/**
 * check-tracks.mjs -- 逐首校验曲库能不能播（inj 首选、网易兜底）
 * 用法: npm run check-tracks
 * 输出: 每首三行结论 + 末尾统计；结果同时写入 .backup/track-check-<日期>.json
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd())
const METING = 'https://api.injahow.cn/meting/?type=url&id='
const NETEASE = 'https://music.163.com/song/media/outer/url?id='

/* 直接从 playlist.ts 里抠出 id 与歌名，避免再维护一份清单 */
const src = fs.readFileSync(path.join(ROOT, 'lib', 'playlist.ts'), 'utf8')
const tracks = [...src.matchAll(/t: "([^"]+)", a: "([^"]+)", id: (\d+)/g)].map((m) => ({
  t: m[1],
  a: m[2],
  id: Number(m[3]),
}))

async function probe(url) {
  try {
    const r = await fetch(url, { redirect: 'manual' })
    const loc = r.headers.get('location') || ''
    if (r.status === 302 && /music\.126\.net/.test(loc)) return 'inj'
    if (r.status === 302 && /music\.126\.net/.test(loc)) return 'inj'
    return r.status === 302 ? 'redirect-other' : 'dead'
  } catch (e) {
    return 'error:' + e.message
  }
}

const rows = []
let injOk = 0
let neOk = 0
let both = 0

for (const tr of tracks) {
  const a = await probe(METING + tr.id)
  const b = await probe(NETEASE + tr.id + '.mp3')
  const ok = a === 'inj' || b === 'inj'
  if (a === 'inj') injOk++
  if (b === 'inj') neOk++
  if (a === 'inj' && b === 'inj') both++
  rows.push({ ...tr, inj: a, netease: b, ok })
  if (!ok) console.log('  ✗ 不可播:', tr.t, '/', tr.a, 'id=' + tr.id, a, b)
  await new Promise((r) => setTimeout(r, 150))
}

console.log('\n共', tracks.length, '首 | inj 可用', injOk, '| 网易可用', neOk, '| 两源都通', both)
const dead = rows.filter((r) => !r.ok)
if (dead.length) {
  console.log('需要换源或下架：', dead.map((d) => d.t + '(' + d.id + ')').join('、'))
  process.exitCode = 1
}

fs.mkdirSync(path.join(ROOT, '.backup'), { recursive: true })
fs.writeFileSync(
  path.join(ROOT, '.backup', `track-check-${new Date().toISOString().slice(0, 10)}.json`),
  JSON.stringify(rows, null, 2),
)
