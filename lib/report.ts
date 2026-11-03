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

  /* 双线边框 */
  ctx.strokeStyle = 'rgba(54, 42, 30, 0.35)'
  ctx.lineWidth = 2
  ctx.strokeRect(40, 40, W - 80, H - 80)
  ctx.strokeStyle = 'rgba(54, 42, 30, 0.14)'
  ctx.strokeRect(52, 52, W - 104, H - 104)

  /* 右上角朱印 */
  ctx.fillStyle = '#9e3b2e'
  ctx.fillRect(W - 168, 92, 76, 76)
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
    ctx.strokeStyle = 'rgba(54, 42, 30, 0.3)'
    ctx.strokeRect(tagX, tagY - 30, w, 48)
    ctx.fillStyle = 'rgba(54, 42, 30, 0.75)'
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
  const lines = wrapText(ctx, d.text, W - 192)
  let y = d.pillars?.length === 4 ? 996 : 736
  for (const line of lines.slice(0, 8)) {
    ctx.fillText(line, 96, y)
    y += 62
  }

  /* 烬语 */
  if (d.ember) {
    ctx.fillStyle = '#9e3b2e'
    ctx.font = `italic 42px ${SERIF}`
    ctx.textAlign = 'left'
    ctx.fillText(`「${d.ember}」`, 96, Math.min(y + 40, H - 320))
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

export function downloadReport(d: ReportData, filename: string) {
  if (typeof document === 'undefined') return
  try {
    const url = drawReport(d)
    if (!url) {
      window.alert('当前浏览器不支持图片导出，试试系统浏览器打开本页')
      return
    }
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  } catch {
    window.alert('导出失败——试试系统浏览器（Safari / Chrome）打开本页再导出')
  }
}
