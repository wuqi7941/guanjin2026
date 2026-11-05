#!/usr/bin/env node
/**
 * 发布前隐私检查 —— 部署 Cloudflare Pages 与 git push 之前必须跑
 *
 *   npm run privacy                  # 常规：密钥/本地路径阻断，联系方式列出待确认
 *   npm run privacy -- --strict      # 严格：联系方式也要处理完才能发布
 *
 * 扫三批「会被公开」的内容：
 *   1. git 已跟踪文件（push 会带到公开仓库，含历史文件名）
 *   2. git 未跟踪、但没被 .gitignore 排除的文件（git add -A 会带上去）
 *   3. dist/ 里的文本产物（会上传到 Cloudflare Pages）
 *
 * BLOCK  = 密钥 / 私钥 / 凭据赋值 / 本机绝对路径 / 敏感配置文件 → 退出码 1，禁止发布
 * REVIEW = 邮箱 / 手机号 / 证件号 / 社交账号 → 只列脱敏命中，需人工确认是不是站长主动公开
 *
 * 退出码 0 = 可以发布；1 = 先处理。零依赖，只用 Node 内置模块。
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')
const STRICT = process.argv.includes('--strict')

const git = (args) => {
  try {
    return execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .split('\n')
      .filter(Boolean)
  } catch {
    return []
  }
}

const SKIP_DIR = /^(node_modules|\.next|\.git|\.backup|\.wrangler|dist-plain-backup|out|_文档)$/
const BINARY_EXT = /\.(png|jpe?g|webp|gif|avif|ico|woff2?|ttf|otf|eot|map|pdf|zip|mp3|mp4|psd)$/i
const TEXT_EXT = /\.(tsx?|jsx?|mjs|cjs|json|css|md|txt|toml|sql|html|xml|yml|yaml|webmanifest|svg|sh|py|bak|env)$/i
const MAX_BYTES = 2 * 1024 * 1024
/* 本脚本自身写满了各种敏感信息的正则，扫自己只会得到一堆误报 */
const SELF = 'scripts/privacy-check.mjs'

const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

/* ── 收集待发布的文本文件 ── */
const tracked = git(['ls-files'])
const untracked = git(['ls-files', '--others', '--exclude-standard'])
const sourceFiles = [...new Set([...tracked, ...untracked])].filter(
  (f) => !f.startsWith('dist/') && !SKIP_DIR.test(f.split(/[\\/]/)[0]),
)
const distFiles = walk(DIST).map((f) => 'dist/' + path.relative(DIST, f).replace(/\\/g, '/'))

const readable = (f) => {
  if (f === SELF || !TEXT_EXT.test(f) || BINARY_EXT.test(f)) return null
  const abs = path.join(ROOT, f)
  try {
    if (fs.statSync(abs).size > MAX_BYTES) return null
    return fs.readFileSync(abs, 'utf8')
  } catch {
    return null
  }
}

/* ── 规则 ── */
const RULES = [
  {
    level: 'BLOCK',
    name: '平台密钥 / Token',
    re: /AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,}|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{24,}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN (?:RSA |OPENSSH |EC |PGP )?PRIVATE KEY-----/g,
  },
  {
    level: 'BLOCK',
    name: '凭据字面量赋值',
    re: /(?:api[_-]?key|api[_-]?token|access[_-]?token|refresh[_-]?token|client[_-]?secret|auth[_-]?token|private[_-]?key|password|passwd)\s*[:=]\s*['"`]([^'"`\s]{12,})['"`]/gi,
    /* 环境变量引用、占位符、示例值不算泄露 */
    keep: (m) => !/^(\$\{|process\.env|import\.meta|<|xxx|your|placeholder|example|dummy|sample|test|todo|undefined)/i.test(m[1]),
  },
  {
    level: 'BLOCK',
    name: '本机绝对路径 / 机器用户名',
    /* 必须是「盘符\Users\用户名\…」这种完整路径，光出现 C:\Users 字样不算 */
    re: /[A-Za-z]:[\\/](?:Users|Documents|Desktop)[\\/][A-Za-z0-9一-龥（）()_-]{2,}[\\/]|\/Users\/[A-Za-z][A-Za-z0-9._-]*\/|\/home\/[A-Za-z][A-Za-z0-9._-]*\/|Admin（无密码）|Desktop[\\/]workbuddy/g,
    /* 注释和检测脚本自己的正则里也会写 C:\Users，那是说明文字，不是泄露 */
    skipLine: (line) => /^\s*(\*|\/\/|#|\/\*)/.test(line) || /\{\s*re:/.test(line),
  },
  {
    level: 'REVIEW',
    name: '邮箱地址',
    re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  },
  {
    level: 'REVIEW',
    name: '手机号',
    re: /(?<!\d)1[3-9]\d{9}(?!\d)|(?<!\d)1[3-9]\d{2}\s\d{4}\s\d{4}(?!\d)/g,
  },
  {
    level: 'REVIEW',
    name: '身份证号',
    re: /(?<!\d)\d{17}[\dXx](?!\d)/g,
  },
  {
    level: 'REVIEW',
    name: '社交账号',
    /* 不带 vx/wx 缩写：粒子代码里的 vx: number、函数参数 yearWX: string 都会被误判 */
    re: /(?:QQ号?|微信号?|WeChat\s*ID?|微信)\s*[:：]\s*([A-Za-z][A-Za-z0-9_-]{4,})/gi,
    keep: (m) => !/^(number|string|boolean|unknown|null|undefined|any|void|object)$/i.test(m[1]),
  },
]

const SENSITIVE_FILE = /(^|\/)(?:\.env(?:\.|$)|[^/]*\.dev\.vars|[^/]*\.pem$|[^/]*\.key$|[^/]*credentials[^/]*$|[^/]*secret[^/]*[^/]*$|(?:id_rsa|id_ed25519)$|wrangler.*config)/i
const mask = (s) => {
  const v = s.replace(/\s+/g, '')
  return v.length <= 8 ? v.slice(0, 2) + '***' : v.slice(0, 4) + '***' + v.slice(-2)
}

const hits = new Map() // key → { level, name, value, count, files:Set }

const add = (level, name, raw, file, line) => {
  const key = `${level}|${name}|${mask(raw)}`
  const h = hits.get(key) || { level, name, value: mask(raw), count: 0, files: new Set() }
  h.count++
  if (h.files.size < 3) h.files.add(`${file}:${line}`)
  hits.set(key, h)
}

for (const f of [...sourceFiles, ...distFiles]) {
  const text = readable(f)
  if (text === null) continue
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    for (const rule of RULES) {
      if (rule.skipLine && rule.skipLine(line)) continue
      rule.re.lastIndex = 0
      let m
      while ((m = rule.re.exec(line)) !== null) {
        if (rule.keep && !rule.keep(m)) continue
        add(rule.level, rule.name, m[1] || m[0], f, i + 1)
        /* 同一行同类只记一条，避免 13 万字文章刷屏 */
        break
      }
    }
  }
}

/* 敏感文件名：本次会被 push 的文件 + 全部 git 历史里出现过的文件名 */
const badNames = [...new Set([...sourceFiles, ...git(['log', '--all', '--pretty=format:', '--name-only'])])]
  .filter((f) => SENSITIVE_FILE.test(f))
  .filter((f) => !/\.d\.ts$/.test(f))

/* ── 汇总 ── */
const blocks = [...hits.values()].filter((h) => h.level === 'BLOCK')
const reviews = [...hits.values()].filter((h) => h.level === 'REVIEW')
const show = (list) => {
  for (const h of list.slice(0, 20)) {
    console.log(`  [${h.name}] ${h.value} · ${h.count} 行 · 例：${[...h.files].join('、')}`)
  }
  if (list.length > 20) console.log(`  …另外 ${list.length - 20} 组`)
}

console.log(
  `隐私扫描：源码 ${sourceFiles.length} 个文件 / dist 文本 ${distFiles.filter((f) => readable(f) !== null).length} 个文件`,
)

if (!fs.existsSync(DIST)) {
  console.log('· dist/ 不存在：只查了源码，部署前记得先 build 再跑一次本检查')
}

if (badNames.length) {
  console.error('\n✗ 敏感文件名出现在本次待提交清单或 git 历史里：')
  for (const f of badNames.slice(0, 20)) console.error('  - ' + f)
}

if (blocks.length) {
  console.error('\n✗ 必须处理（禁止部署 / push）：')
  show(blocks)
}

if (reviews.length) {
  console.log('\n⚠ 需人工确认：以下信息会随站点和公开仓库一起发布')
  console.log('  确认是站长主动公开的联系方式再继续；有任何不认识的信息，立刻停止发布。')
  show(reviews)
}

if (!badNames.length && !blocks.length && !reviews.length) {
  console.log('✓ 干净：无密钥、无本机路径、无联系方式类隐私命中')
} else if (!badNames.length && !blocks.length) {
  console.log('✓ 无密钥 / 私钥 / 本机路径 / 敏感配置文件（BLOCK 项为 0）')
}

const blocked = badNames.length > 0 || blocks.length > 0 || (STRICT && reviews.length > 0)
if (blocked) {
  console.error('\n✗ 隐私检查未通过，发布中止')
  process.exit(1)
}
console.log(STRICT ? '\n✓ 严格模式通过：可以部署 / push' : '\n✓ 常规模式通过：可以部署 / push（REVIEW 项需已人工确认）')
