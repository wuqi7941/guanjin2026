/* 博客产物 JS 混淆脚本（中等强度）
 * 用法：npm run obfuscate  （在 next build 之后运行）
 * 说明：
 *  - 混淆前自动备份明文 JS 到 dist-plain-backup/<时间戳>/，保留原文件名
 *  - 只处理 dist/_next/static 下的 .js（webpack chunk / 运行时）
 *  - 中间强度：stringArray + base64 + 控制流平坦化，不做 selfDefending（避免误伤运行时）
 */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const obfuscator = require('javascript-obfuscator')

const DIST = path.join(__dirname, '..', 'dist')
const STATIC = path.join(DIST, '_next', 'static')

if (!fs.existsSync(STATIC)) {
  console.error('未找到 ' + STATIC + '，请先运行 npm run build')
  process.exit(1)
}

const OPTS = {
  target: 'browser',
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.1,
  deadCodeInjection: false,
  identifierNamesGenerator: 'hexadecimal',
  numbersToExpressions: false,
  selfDefending: false,
  simplify: true,
  splitStrings: false,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.3,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 1,
  stringArrayWrappersType: 'function',
  renameGlobals: false,
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (e.name.endsWith('.js')) out.push(p)
  }
  return out
}

const files = walk(STATIC)
if (files.length === 0) {
  console.error('未找到 JS 文件，退出')
  process.exit(1)
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const backupDir = path.join(__dirname, '..', 'dist-plain-backup', stamp)
fs.mkdirSync(backupDir, { recursive: true })

let totalIn = 0
let totalOut = 0
let ok = 0
let fail = []

for (const file of files) {
  const rel = path.relative(STATIC, file)
  const src = fs.readFileSync(file, 'utf8')
  totalIn += Buffer.byteLength(src)

  // 备份明文
  const bak = path.join(backupDir, rel)
  fs.mkdirSync(path.dirname(bak), { recursive: true })
  fs.copyFileSync(file, bak)

  const res = obfuscator.obfuscate(src, OPTS)
  const out = res.getObfuscatedCode()
  totalOut += Buffer.byteLength(out)
  fs.writeFileSync(file, out, 'utf8')
  ok++

  // 抽查：混淆产物语法必须可解析
  try {
    new Function(out)
  } catch (e) {
    fail.push({ file: rel, err: e.message })
  }
}

const inKb = (totalIn / 1024).toFixed(1)
const outKb = (totalOut / 1024).toFixed(1)
console.log('混淆完成：' + ok + '/' + files.length + ' 个文件')
console.log('体积：' + inKb + ' KB → ' + outKb + ' KB（+' + ((totalOut / totalIn) * 100 - 100).toFixed(0) + '%）')
console.log('明文备份：' + backupDir)
if (fail.length) {
  console.log('语法校验失败：')
  for (const f of fail) console.log('  ' + f.file + ' — ' + f.err)
  process.exit(1)
}
console.log('语法校验：全部通过')