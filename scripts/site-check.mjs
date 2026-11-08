#!/usr/bin/env node
/**
 * 站点产物全量自检 —— 构建后、部署前跑
 *
 *   npm run site-check
 *
 * 逐页检查 dist/（要被公开的那一份），不抽样：
 *   1. 每个 HTML 里的站内 href/src 是否真的有对应文件（含无尾斜杠 / 带 hash / 带 query）
 *   2. 每篇文章的分享卡 og/<slug>.png 是否存在
 *   3. sitemap.xml 每个 <loc>、feed.xml 每个 <link> 是否落到真实页面
 *   4. search-index.json 的 slug 是否都有页面、标题是否还错写成 slug
 *   5. manifest.webmanifest 可解析，PWA 图标存在
 *   6. _headers 的关键缓存与安全规则是否还在（改配置时最容易被顺手删掉）
 *   7. 本轮功能是否真的进了产物（JS/CSS/HTML 字符串核验）
 *
 * 退出码 0 = 全通过；1 = 有 FAIL，先修再部署。零依赖。
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')
const fails = []
const passes = []
const check = (ok, label, detail = '') => {
  ;(ok ? passes : fails).push(`${label}${detail ? ' · ' + detail : ''}`)
}

if (!fs.existsSync(DIST)) {
  console.error('✗ dist/ 不存在——先 npm run build')
  process.exit(1)
}

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}
const all = walk(DIST).map((p) => path.relative(DIST, p).replace(/\\/g, '/'))
const has = (rel) => all.includes(rel)
const read = (rel) => fs.readFileSync(path.join(DIST, rel), 'utf8')
/* 产物 JSON 解析失败要记成一项 FAIL，而不是让整个脚本抛异常退出——
   抛异常时前面已经通过的检查也一起看不到了，排查时容易误判成「脚本坏了」。 */
const readJSON = (rel) => {
  try {
    return JSON.parse(read(rel))
  } catch (e) {
    check(false, `${rel} 可解析为 JSON`, String(e.message).slice(0, 60))
    return null
  }
}
const htmls = all.filter((f) => f.endsWith('.html'))
const jsCss = all.filter((f) => /\.(js|css)$/.test(f))
const bundle = jsCss.map((f) => read(f)).join('\n')

/* 站内 URL → dist 相对路径；跳过 Functions / 外链 / 协议链接 */
const toFile = (href) => {
  if (!href || !href.startsWith('/')) return null
  if (href.startsWith('/api/')) return null
  let clean = href.split('#')[0].split('?')[0]
  if (!clean) return null
  /* Next 把动态路由目录写成 %5Bslug%5D，磁盘上是字面的 [slug]；
     Pages 收到请求会解码，自检也要解码再比对，否则 212 篇文章页全被误报成断链。 */
  try {
    clean = decodeURIComponent(clean)
  } catch {
    /* 非法转义保持原样 */
  }
  const rel = clean === '/' ? 'index.html' : clean.slice(1)
  if (rel.includes('..')) return null
  return rel.endsWith('/') ? rel + 'index.html' : rel
}
const existsTarget = (rel) => {
  if (!rel) return true
  if (has(rel)) return true
  /* 无尾斜杠的页面：/play → play/index.html */
  if (!path.extname(rel) && has(rel + '/index.html')) return true
  if (!path.extname(rel) && has(rel + '.html')) return true
  return false
}

/* ── 1. 全量站内链接 ── */
let linkCount = 0
const broken = new Set()
for (const h of htmls) {
  const s = read(h)
  /* 属性值可能是单引号（Next 生成的 JSON-LD / 内联片段里就有），
     只匹配双引号会把它们整批漏检。 */
  for (const m of s.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const href = m[1]
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/i.test(href)) continue
    if (href.startsWith('//')) continue
    if (!href.startsWith('/')) continue
    linkCount++
    const target = toFile(href)
    if (target && !existsTarget(target)) broken.add(`${href}  (来自 ${h})`)
  }
}
check(broken.size === 0, '站内链接全部有对应文件', `${linkCount} 条 / 断链 ${broken.size}`)
for (const b of [...broken].slice(0, 12)) console.error('    断链 ' + b)

/* ── 2. 文章与分享卡 ── */
const posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib', 'posts.json'), 'utf8'))
const missOg = posts.filter((p) => !has(`og/${p.slug}.png`))
check(missOg.length === 0, '每篇文章都有分享卡', `${posts.length} 篇 / 缺 ${missOg.length}`)
if (missOg.length) console.error('    缺图 ' + missOg.slice(0, 8).map((p) => p.slug).join('、'))
const missPage = posts.filter((p) => !has(`blog/${p.slug}/index.html`))
check(missPage.length === 0, '每篇文章都有静态页', `${posts.length} 篇 / 缺 ${missPage.length}`)
const badTitle = posts.filter((p) => !p.title || p.title === p.slug)
check(badTitle.length === 0, '文章标题不是 slug 占位', `异常 ${badTitle.length}`)
check(htmls.length > 0 && has('404.html'), '404 页存在', `HTML ${htmls.length} 个`)

/* ── 3. sitemap / RSS ── */
const SITE_URL = 'https://guanjin2011.de5.net'
const sitemap = read('sitemap.xml')
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
const badLoc = locs.filter((u) => {
  if (!u.startsWith(SITE_URL)) return true
  const rel = toFile(new URL(u).pathname + (new URL(u).search || ''))
  return !existsTarget(rel)
})
check(locs.length > 200 && badLoc.length === 0, 'sitemap 每条 URL 都落到真实页面', `${locs.length} 条 / 失效 ${badLoc.length}`)
if (badLoc.length) console.error('    失效 ' + badLoc.slice(0, 8).join('、'))
check(sitemap.includes('<loc>' + SITE_URL + '/</loc>'), 'sitemap 域名与站点配置一致')

const feed = read('feed.xml')
const feedLinks = [...feed.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1])
const badFeed = feedLinks.filter((u) => {
  if (!u.startsWith(SITE_URL)) return true
  return !existsTarget(toFile(new URL(u).pathname))
})
check(feedLinks.length > 0 && badFeed.length === 0, 'RSS 每条链接有效', `${feedLinks.length} 条`)
check(read('robots.txt').includes(`${SITE_URL}/sitemap.xml`), 'robots 指向 sitemap')

/* ── 4. 搜索索引 ── */
const idx = readJSON('search-index.json')
if (idx) {
  check(Array.isArray(idx) && idx.length === posts.length, '搜索索引条数与文章数一致', `${idx.length} / ${posts.length}`)
  const badIdx = idx.filter((d) => !d.slug || !d.title || d.title === d.slug || !has(`blog/${d.slug}/index.html`))
  check(badIdx.length === 0, '索引 slug/标题/页面三者一致', `异常 ${badIdx.length}`)
  /* 索引必须带正文：只有标题的话搜索等于摆设 */
  check(idx.every((d) => typeof d.body === 'string' && d.body.length > 40), '搜索索引带正文片段')
}

/* ── 5. PWA ── */
const manifest = readJSON('manifest.webmanifest')
if (manifest) {
  const missIcons = manifest.icons.filter((i) => !has(i.src.replace(/^\//, '')))
  check(missIcons.length === 0, 'PWA 图标存在', `${manifest.icons.length} 个`)
  check(manifest.start_url === '/' && manifest.scope === '/', 'PWA start_url / scope 正确')
}

/* ── 6. 响应头配置 ── */
const headers = fs.readFileSync(path.join(ROOT, 'public', '_headers'), 'utf8')
for (const rule of ['/_next/static/*', '/fonts/*.woff2', '/og/*', '/search-index.json', '/feed.xml']) {
  check(headers.includes(rule), `_headers 规则 ${rule}`)
}
for (const h of ['X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'Content-Security-Policy']) {
  check(headers.includes(h), `_headers 安全头 ${h}`)
}
check(!/\/api\/\*/.test(headers), '_headers 不会把 API 响应错误缓存')

/* ── 7. 本轮功能确实进了产物 ── */
const FEATURES = [
  ['退出选项文案', '退出后，已选的答案要留着吗'],
  ['存档入口文案', '上次没做完'],
  ['存档 key', 'embers-play-progress'],
  ['八字结果可改', '改生日 / 时辰'],
  ['保存答案按钮', '保存答案'],
  ['隐私说明', '八字填的生日时辰'],
]
for (const [label, needle] of FEATURES) {
  check(bundle.includes(needle) || htmls.some((h) => read(h).includes(needle)), `产物含「${label}」`)
}
const css = jsCss.filter((f) => f.endsWith('.css')).map(read).join('\n')
check(css.includes('100vh') && css.includes('100dvh'), 'CSS 有 vh → dvh 兜底')
check(/background:\s*var\(--surface-1\)/.test(css), 'CSS 有 color-mix 背景兜底')

/* ── 8. 天气端点与卡片圆角一致性 ── */
const srcHas = (p) => fs.existsSync(path.join(ROOT, p))
check(srcHas('functions/api/weather.ts'), '天气 Functions 端点存在')
check(srcHas('lib/weather.ts') && srcHas('hooks/useWeather.ts'), '天气文案与前端 hook 存在')
check(bundle.includes('冷得实在') && bundle.includes('带把伞'), '天气文案进产物')
check(css.includes('var(--radius-md)'), '产物含 3px 纸墨圆角变量')
check(!/rounded-2xl/.test(css) && !/rounded-xl/.test(css), '产物不再含 12/16px 大圆角类')

/* ── 9. 访问统计与隐藏页 ── */
const weatherFn = fs.readFileSync(path.join(ROOT, 'functions/api/weather.ts'), 'utf8')
check(weatherFn.includes('bigdatacloud'), '天气端点有县级地名反查')
check(srcHas('functions/api/visit.ts') && srcHas('components/VisitTracker.tsx'), '访问统计端点与埋点存在')
check(srcHas('app/stats/page.tsx') && srcHas('components/StatsClient.tsx'), '统计页存在')
check(
  bundle.includes('zmjkk') && (bundle.includes('来过的人') || htmls.some((h) => read(h).includes('来过的人'))),
  '暗门与统计页进产物',
)
const sm = read('sitemap.xml')
check(!sm.includes('/stats/') && !sm.includes('/eggs/'), '隐藏页不在 sitemap')
const rb = read('robots.txt')
check(rb.includes('/eggs/') && rb.includes('/stats/'), 'robots 排除隐藏页')
check(htmls.some((h) => h.startsWith('stats/')), '统计页已静态导出')

/* ── 10. 表单、页脚与统计口径 ── */
check(css.includes('.field-label') && css.includes('placeholder-shown'), '产物含浮动标签样式')
const homeHtml = read('index.html')
check(!homeHtml.includes('已集') && !homeHtml.includes('暗语 ·'), '首页页脚不再出现收集册信息')
const visitFn = fs.readFileSync(path.join(ROOT, 'functions/api/visit.ts'), 'utf8')
check(visitFn.includes('DISTINCT day, ip_hash'), '独立访客按 IP + 当日去重')
check(
  bundle.includes('OPENED TODAY') || htmls.some((h) => read(h).includes('OPENED TODAY')),
  '统计页两个主框进产物',
)

/* ── 11. 定位、打字机与极简收敛 ── */
check(srcHas('functions/api/geo.ts'), '地名查询端点存在')
const geoSrc = fs.readFileSync(path.join(ROOT, 'functions/api/geo.ts'), 'utf8')
check(geoSrc.includes('Array.from(new Set') && geoSrc.includes('suffix'), '地名查询支持去后缀重试与县级名补全')
const weatherSrc = fs.readFileSync(path.join(ROOT, 'functions/api/weather.ts'), 'utf8')
check(weatherSrc.includes('no-permission'), '无坐标时天气端点直接降级（不再猜出口 IP）')
const twSrc = fs.readFileSync(path.join(ROOT, 'components/Typewriter.tsx'), 'utf8')
check(
  twSrc.includes('bootVisible') && twSrc.includes("useState('')") && !twSrc.includes('useReducedMotion'),
  '打字机始终逐字输出 + 视口兜底',
)
const homeSrc = fs.readFileSync(path.join(ROOT, 'app/page.tsx'), 'utf8')
check(homeSrc.includes('<ResumeBanner items={lite}'), '首页 212 条数据只序列化一次（RSC 去重）')
check(
  !srcHas('components/WeatherPlace.tsx') &&
    !srcHas('components/ExhibitMarquee.tsx') &&
    !srcHas('components/GlowFollow.tsx') &&
    !srcHas('components/ChangelogPanel.tsx') &&
    !srcHas('components/AnniversaryStrip.tsx') &&
    !srcHas('components/DailyLine.tsx') &&
    !homeSrc.includes('ExhibitMarquee'),
  '位置输入 / 跑马灯 / 跟随光晕 / 更新浮层 / 周年条 / 每日一句已移除',
)
check(!read('index.html').includes('marquee-band'), '首页产物不含跑马灯 DOM')
/* 首页只留四条：继续阅读 / 最新 / 小说 / 最近文章 */
/* 继续阅读只在「本地有进度」时才渲染，静态 HTML 里本来就没有它，
   所以只查三块必现的：最新条、小说海报、最近文章区。 */
const strips = ['latest-strip', 'novel-poster', 'id="latest"']
check(
  strips.every((c) => read('index.html').includes(c)),
  '首页四条横幅都在',
  `${strips.length} 条关键类名`,
)
check(!css.includes('.marquee-') && !css.includes('.changelog-toast') && !css.includes('.glow-follow'), 'CSS 不再残留已删组件的死规则')

/* ── 12. 主题、权限与数据库脚本 ── */
check(/geolocation=\(self\)/.test(headers), '_headers 放行同源定位')
check(
  /defaultTheme="system"/.test(fs.readFileSync(path.join(ROOT, 'app/providers.tsx'), 'utf8')),
  '默认主题跟随系统',
)
const cssVars = fs.readFileSync(path.join(ROOT, 'app/globals.css'), 'utf8')
check(
  cssVars.includes('--ember: var(--accent)') && cssVars.includes('--fire-top: var(--accent)'),
  '五套暖色已收敛到单一朱印',
)
/* 判据是「暗色画布只有一个值」，不是「不许出现 html.dark」——
   html.dark 里还剩一些针对暗色的单点微调（比如目录厚度的 alpha），那是合理的。 */
check(!cssVars.includes('#14100c') && !cssVars.includes('#14100C'), '暗色画布只有一套值（不再有 #14100c 补丁）')
const schema = fs.readFileSync(path.join(ROOT, 'scripts', 'd1-schema.sql'), 'utf8')
check(/avatar INTEGER/.test(schema), 'D1 建表脚本含 avatar 列')
const feedSorted = feed.indexOf('<pubDate>')
check(feedSorted > 0, 'RSS 有 pubDate')
check(/<lastBuildDate>(?!.*1970)/.test(feed), 'RSS lastBuildDate 有效')

/* ── 汇总 ── */
console.log(`\n静态产物自检：${all.length} 个文件 / HTML ${htmls.length} 页 / JS-CSS ${jsCss.length} 个`)
for (const p of passes) console.log('  ✓ ' + p)
if (fails.length) {
  console.error(`\n✗ ${fails.length} 项未通过：`)
  for (const f of fails) console.error('  - ' + f)
  process.exit(1)
}
console.log(`\n✓ ${passes.length} 项全部通过，可以进入部署前体检与隐私检查`)
