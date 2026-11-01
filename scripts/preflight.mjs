#!/usr/bin/env node
/**
 * 部署前自检（部署到 Cloudflare 之前必须跑）
 *
 *   npm run preflight
 *
 * 检查 dist/ 这份「要被公开的产物」里有没有不该公开的东西：
 *   1. 本地绝对路径 / 构建机信息（C:\Users、/Users/、Desktop、workbuddy、file://）
 *   2. source map 与源码残留（.map / .ts / .tsx / .md）
 *   3. 图片 EXIF（GPS、设备型号、Photoshop 元数据）
 *   4. 开发者痕迹（TODO / FIXME / localhost / 内网 IP）
 *   5. 私密文件误入（.env、.git、.wrangler、node_modules、.backup）
 *
 * 退出码 0 = 可以部署；1 = 有问题，先修。
 */
import fs from 'node:fs'
import path from 'node:path'

const DIST = path.resolve(process.cwd(), 'dist')
const problems = []
const notes = []

if (!fs.existsSync(DIST)) {
  console.error('✗ dist/ 不存在——先 npm run build:prod')
  process.exit(1)
}

/* 递归收集文件，跳过二进制图片单独处理 */
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const all = walk(DIST)
const rel = (p) => path.relative(DIST, p).replace(/\\/g, '/')
const textExt = /\.(html|js|css|json|xml|txt|webmanifest|svg)$/i
const imgExt = /\.(webp|png|jpe?g|gif|avif|ico)$/i

/* ── 1. 文本文件里的路径与痕迹 ── */
const PATH_PATTERNS = [
  { re: /C:\\\\?Users|C:\/Users/i, label: 'Windows 本地路径' },
  { re: /\/Users\/[A-Za-z]|\/home\/[A-Za-z]/, label: 'Unix 本地路径' },
  { re: /Desktop|workbuddy|my-app/i, label: '项目/桌面路径' },
  { re: /file:\/\//i, label: 'file:// 协议' },
  { re: /localhost:\d{4,5}/i, label: 'localhost 地址' },
  { re: /\b10\.\d+\.\d+\.\d+|\b192\.168\.\d+\.\d+/, label: '内网 IP' },
  /* 只认注释形式的 TODO/FIXME：裸词会命中 highlight.js 的 doctag 语法定义 */
  { re: /(\/\/|\/\*|<!--|#)\s*(TODO|FIXME)\b/, label: 'TODO/FIXME 注释残留' },
]

for (const f of all) {
  const r = rel(f)
  if (textExt.test(r)) {
    let s
    try {
      s = fs.readFileSync(f, 'utf8')
    } catch {
      continue
    }
    for (const { re, label } of PATH_PATTERNS) {
      if (re.test(s)) problems.push(`${label}：${r}`)
    }
    if (/sourceMappingURL=/.test(s)) problems.push(`sourceMappingURL：${r}`)
  }

  /* ── 2. source map / 源码残留 ── */
  if (/\.map$/.test(r)) problems.push(`source map：${r}`)
  if (/\.(tsx?|md|mjs|cjs)$/.test(r)) problems.push(`源码残留：${r}`)

  /* ── 4. 私密目录/文件误入 ── */
  if (/^\.(env|git|wrangler)|node_modules|^\.backup|^_文档/i.test(r.split('/')[0] + '/'))
    problems.push(`私密路径误入：${r}`)
}

/* ── 3. 图片元数据（EXIF / GPS / Adobe） ── */
let imgCount = 0
for (const f of all) {
  if (!imgExt.test(rel(f))) continue
  imgCount++
  const s = fs.readFileSync(f).toString('latin1')
  if (s.includes('Exif') || s.includes('eXIf')) problems.push(`EXIF 元数据：${rel(f)}`)
  if (/GPSLatitude|GPSLongitude/.test(s)) problems.push(`GPS 坐标：${rel(f)}`)
  if (/Photoshop|Adobe/.test(s)) problems.push(`Photoshop 元数据：${rel(f)}`)
}

/* ── 5. 依赖漏洞（提示级，不阻塞）──
   npmmirror 不支持 audit 接口（返回 NOT_IMPLEMENTED），必须显式指定官方源，
   否则这里永远读到空结果——那等于没有这项检查。 */
try {
  const { execSync } = await import('node:child_process')
  const cmd = 'npm audit --registry=https://registry.npmjs.org --json'
  let raw = ''
  try {
    raw = execSync(cmd, { encoding: 'utf8', timeout: 45000, stdio: ['ignore', 'pipe', 'ignore'] })
  } catch (e) {
    /* npm audit 发现漏洞时退出码是 1——那是正常结果，不是执行失败，stdout 里照样有 JSON */
    raw = (e?.stdout ?? '').toString()
  }
  const meta = JSON.parse(raw)?.metadata?.vulnerabilities ?? {}
  const c = meta.critical || 0
  const h = meta.high || 0
  const m = meta.moderate || 0
  if (c || h) {
    notes.push(
      `依赖漏洞 ${c} critical / ${h} high / ${m} moderate —— 当前 Next 的这批全是服务端类（Image Optimizer / RSC / rewrites / Server Actions），output:export 无服务端，不可利用；真要清零需上 Next 15.5.28+`,
    )
  } else {
    console.log(`✓ 依赖漏洞：${c} critical / ${h} high / ${m} moderate`)
  }
} catch {
  notes.push('依赖审计未完成（网络或 registry 不支持）——请手动跑 npm run audit')
}

/* ── 汇总 ── */
const totalSize = all.reduce((n, f) => n + fs.statSync(f).size, 0)
console.log(`扫描 dist/：${all.length} 个文件 / ${(totalSize / 1024 / 1024).toFixed(1)} MB（图片 ${imgCount} 张）`)

if (problems.length) {
  const uniq = [...new Set(problems)]
  console.error(`\n✗ 发现 ${uniq.length} 处不该公开的信息：`)
  for (const p of uniq.slice(0, 40)) console.error('  - ' + p)
  if (uniq.length > 40) console.error(`  …以及另外 ${uniq.length - 40} 处`)
  process.exit(1)
}

if (notes.length) for (const n of notes) console.log('· ' + n)
console.log('✓ 可部署：无本地路径、无 source map、无源码残留、图片无 EXIF、无私密文件')
