/* 测试报告图：1080×1440 纸墨风，零依赖 Canvas 手绘，导出 PNG。
   颜色取自站点亮色主题（宣纸 #f2ece1 / 墨 #221b13 / 朱印 #9e3b2e）。 */

export interface ReportData {
  kicker: string
  code: string
  name: string
  sub: string
  tags: string[]
  text: string
  ember: string
  /* 八字报告：四柱（干支各一串，如「丙午」） */
  pillars?: string[]
}

const SERIF = '"Songti SC", "STSong", "SimSun", "Noto Serif CJK SC", Georgia, serif'
const MONO = '"GeistMono", ui-monospace, SFMono-Regular, Menlo, monospace'

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line)
      line = ch
    } else {
      line += ch
    }
  }
  if (line) lines.push(line)
  return lines
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function drawReport(d: ReportData): string {
  const W = 1080
  const H = 1440
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  /* 纸底 */
  ctx.fillStyle = '#f2ece1'
  ctx.fillRect(0, 0, W, H)

  /* 极淡横向纹理：把「纸」的肌理补上，一眼看去不像纯色块 */
  ctx.strokeStyle = 'rgba(120, 96, 66, 0.035)'
  ctx.lineWidth = 1
  for (let ly = 0; ly < H; ly += 7) {
    ctx.beginPath()
    ctx.moveTo(0, ly + 0.5)
    ctx.lineTo(W, ly + 0.5)
    ctx.stroke()
  }

  /* 双线边框 */
  ctx.strokeStyle = 'rgba(54, 42, 30, 0.35)'
  ctx.lineWidth = 2
  ctx.strokeRect(40, 40, W - 80, H - 80)
  ctx.strokeStyle = 'rgba(54, 42, 30, 0.14)'
  ctx.strokeRect(52, 52, W - 104, H - 104)

  /* 右上角朱印 */
  ctx.fillStyle = '#9e3b2e'
  ctx.fillRect(W - 168, 92, 76, 76)
  ctx.strokeStyle = 'rgba(242, 236, 225, 0.65)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(W - 162, 98, 64, 64)
  ctx.fillStyle = '#ffffff'
  ctx.font = `600 30px ${SERIF}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('余烬', W - 130, 118)
  ctx.font = `500 17px ${MONO}`
  ctx.fillText('EMBERS', W - 130, 146)

  /* 顶部 kicker */
  ctx.fillStyle = 'rgba(54, 42, 30, 0.55)'
  ctx.font = `500 26px ${MONO}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('EMBERS · TOUCHSTONE', 96, 136)
  ctx.fillText('试金石', 96, 176)

  /* 主结果大字（按长度自适应：可用宽 888px） */
  const codeSize = Math.min(230, Math.floor(888 / d.code.length))
  ctx.fillStyle = '#221b13'
  ctx.font = `600 ${codeSize}px ${SERIF}`
  ctx.textAlign = 'center'
  ctx.fillText(d.code, W / 2, 420)

  /* 名 + 副标 */
  ctx.fillStyle = '#9e3b2e'
  ctx.font = `italic 52px ${SERIF}`
  ctx.fillText(`「${d.name}」 · ${d.sub}`, W / 2, 520)

  /* 短朱线：给「名字」这一行一个落款感 */
  ctx.fillStyle = 'rgba(158, 59, 46, 0.55)'
  ctx.fillRect(W / 2 - 36, 548, 72, 3)

  /* 分隔细线 */
  ctx.strokeStyle = 'rgba(54, 42, 30, 0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(96, 580)
  ctx.lineTo(W - 96, 580)
  ctx.stroke()

  /* 八字四柱行（可选）：年/月/日/时 四格 */
  if (d.pillars && d.pillars.length === 4) {
    const labels = ['年', '月', '日', '时']
    const cellW = 150
    const gap = 24
    const startX = (W - (cellW * 4 + gap * 3)) / 2
    for (let i = 0; i < 4; i++) {
      const x = startX + i * (cellW + gap)
      ctx.strokeStyle = 'rgba(54, 42, 30, 0.3)'
      ctx.strokeRect(x, 616, cellW, 150)
      ctx.fillStyle = 'rgba(54, 42, 30, 0.45)'
      ctx.font = `500 20px ${MONO}`
      ctx.textAlign = 'center'
      ctx.fillText(labels[i], x + cellW / 2, 648)
      ctx.fillStyle = '#221b13'
      ctx.font = `600 56px ${SERIF}`
      const pz = d.pillars[i]
      ctx.fillText(pz[0], x + cellW / 2, 706)
      ctx.fillText(pz[1] ?? '', x + cellW / 2, 754)
    }
  }

  /* 特质标签（胶囊） */
  let tagX = 96
  const tagY = (d.pillars?.length === 4 ? 902 : 636)
  for (const tag of d.tags.slice(0, 4)) {
    ctx.font = `500 26px ${SERIF}`
    const w = ctx.measureText(tag).width + 44
    roundRect(ctx, tagX, tagY - 30, w, 48, 24)
    ctx.strokeStyle = 'rgba(54, 42, 30, 0.28)'
    ctx.stroke()
    ctx.fillStyle = 'rgba(54, 42, 30, 0.08)'
    ctx.fill()
    ctx.fillStyle = 'rgba(54, 42, 30, 0.78)'
    ctx.textAlign = 'center'
    ctx.fillText(tag, tagX + w / 2, tagY)
    tagX += w + 18
    if (tagX > W - 300) break
  }

  /* 分析正文（自动换行） */
  ctx.fillStyle = 'rgba(34, 27, 19, 0.85)'
  ctx.font = `400 38px ${SERIF}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  const lines = wrapText(ctx, d.text.replace(/^\s+/, ''), W - 192 - 76)
  let y = d.pillars?.length === 4 ? 996 : 736
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    /* 首行缩进两个字（中文书卷排版） */
    ctx.fillText(lines[i], i === 0 ? 96 + 76 : 96, y)
    y += 62
  }

  /* 烬语：引文样式——左侧朱线 + 缩进，像书页里被拖出来的一行 */
  if (d.ember) {
    const ey = Math.min(y + 40, H - 320)
    ctx.fillStyle = 'rgba(158, 59, 46, 0.5)'
    ctx.fillRect(96, ey - 44, 3, 64)
    ctx.fillStyle = '#9e3b2e'
    ctx.font = `italic 40px ${SERIF}`
    ctx.textAlign = 'left'
    ctx.fillText(`「${d.ember}」`, 128, ey)
  }

  /* 底部：站名 + 日期 + 链接 */
  ctx.strokeStyle = 'rgba(54, 42, 30, 0.2)'
  ctx.beginPath()
  ctx.moveTo(96, H - 200)
  ctx.lineTo(W - 96, H - 200)
  ctx.stroke()

  ctx.fillStyle = 'rgba(54, 42, 30, 0.65)'
  ctx.font = `500 30px ${SERIF}`
  ctx.fillText('余烬 EMBERS — 观烬的个人博客', 96, H - 132)
  ctx.fillStyle = 'rgba(54, 42, 30, 0.45)'
  ctx.font = `500 24px ${MONO}`
  const today = new Date()
  ctx.fillText(today.toISOString().slice(0, 10), 96, H - 90)
  ctx.textAlign = 'right'
  ctx.fillText('guanjin2011.de5.net/play', W - 96, H - 90)

  return canvas.toDataURL('image/png')
}

/* 三层导出策略：
   1. 支持 Web Share 文件分享（多数手机浏览器/WebView）→ 拉起系统分享面板，可保存可转发
   2. 移动端但不支持分享 → 页内弹图片层，长按保存（WebView 唯一定保底有效的路）
   3. 桌面 → 直接触发下载
   原因：APP 内置 WebView 通常不实现 <a download> 的下载监听，点了毫无反应。 */
export async function exportReport(
  d: ReportData,
  filename: string,
  onOverlay: (dataUrl: string) => void,
) {
  let url = ''
  try {
    url = drawReport(d)
  } catch {
    /* canvas 不可用 */
  }
  if (!url) {
    window.alert('当前浏览器不支持图片导出，试试用系统浏览器打开本页')
    return
  }

  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)

  try {
    const blob = await (await fetch(url)).blob()
    const file = new File([blob], filename, { type: 'image/png' })
    const canShare = typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })
    if (canShare) {
      await navigator.share({ files: [file], title: '余烬 EMBERS · 测试报告' })
      return
    }
  } catch (e) {
    /* 用户取消分享不算失败 */
    if (e instanceof Error && e.name === 'AbortError') return
    /* 继续走下面的兜底 */
  }

  if (isMobile) {
    onOverlay(url)
    return
  }

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}
