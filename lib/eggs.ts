'use client'

/* 彩蛋系统：本地记录已发现的暗语 + 来访计数（纯本地，不上传） */

export type EggKey =
  | 'konami'
  | 'logo'
  | 'night'
  | 'seal'
  | 'idle'
  | 'reunion'
  | 'type'
  | 'hold'
  | 'search'
  | 'footer'
  | 'bottom'
  | 'lost'
  | 'melody'
  | 'snow'
  | 'copy'
  | 'anniversary'
  | 'shuffle'
  | 'nightread'
  | 'fourofour'
  | 'fate'
  | 'shelf'
  | 'rainoff'
  | 'silence'

export interface EggMeta {
  key: EggKey
  label: string
  /* 收集册里的模糊线索（未点亮时显示） */
  hint: string
  /* 以下三项只在「暗语全册」/eggs/ 里出现 */
  where: string
  how: string
  effect: string
}

export const EGGS: EggMeta[] = [
  {
    key: 'konami',
    label: '枫林',
    hint: '像小时候那样，按 ↑↑↓↓←→←→BA',
    where: '任意页面',
    how: '依次按 ↑ ↑ ↓ ↓ ← → ← → B A',
    effect: '四十八片枫叶从顶上落下来',
  },
  {
    key: 'logo',
    label: '不熄',
    hint: '连点页顶的「余烬」五次',
    where: '任意页面',
    how: '连点左上角「余烬 EMBERS」五次',
    effect: '二十六片叶子，控制台留一句话',
  },
  {
    key: 'night',
    label: '火种',
    hint: '在凌晨 0-5 点来过这里',
    where: '任意页面',
    how: '在凌晨 0:00–4:59 之间打开站点',
    effect: '自动点亮，不用做任何事',
  },
  {
    key: 'seal',
    label: '印记',
    hint: '在首页，长按那个「余」字印章',
    where: '首页',
    how: '按住左上角那个「余」字方印 1.2 秒',
    effect: '印章亮起，一声轻响',
  },
  {
    key: 'idle',
    label: '发呆',
    hint: '在首页静静地待上一会儿',
    where: '首页',
    how: '停手不动 15 秒（不滚动、不点击）',
    effect: '打字机换一句更安静的话',
  },
  {
    key: 'reunion',
    label: '重逢',
    hint: '来火边三次以上',
    where: '任意页面',
    how: '同一浏览器第 3 次及以后来访',
    effect: '自动点亮，每个会话只计一次',
  },
  {
    key: 'type',
    label: '火苗',
    hint: '在首页的打字机上敲出 huo',
    where: '首页',
    how: '在打字机上敲出 huo 三个字母',
    effect: '一阵叶子雨',
  },
  {
    key: 'hold',
    label: '燎原',
    hint: '连点底部播放条的封面三下',
    where: '底部迷你播放条',
    how: '有歌在放时，连点封面缩略图三下（900 毫秒内）',
    effect: '十八片枫叶',
  },
  {
    key: 'search',
    label: '寻火',
    hint: '在搜索框里敲出「余烬」',
    where: '全站搜索',
    how: '按 / 或 Ctrl+K 打开搜索，输入「余烬」',
    effect: '点亮（这一枚本身就是入口）',
  },
  {
    key: 'footer',
    label: '未冷',
    hint: '连点页脚那句 BURNED, STILL WARM. 三次',
    where: '页脚',
    how: '连点那句 BURNED, STILL WARM. 三次',
    effect: '十二片枫叶',
  },
  {
    key: 'bottom',
    label: '到底',
    hint: '把一篇文章读到最后一行',
    where: '任意文章页',
    how: '把一篇文章滚到最后一行',
    effect: '点亮（页面要比屏幕长才判定）',
  },
  {
    key: 'lost',
    label: '迷路',
    hint: '打开一个不存在的地址',
    where: '任何打不开的地址',
    how: '在网址后面乱敲一段，落进 404 页',
    effect: '落到「这一页烧完了」，顺手点亮',
  },
  {
    key: 'melody',
    label: '知音',
    hint: '在首页的钢琴上，把《小星星》开头那几个音弹出来',
    where: '首页 · 钢琴',
    how: '依次弹 C C G G A A G（五声音阶或标准音阶都行）',
    effect: '整副琴键亮一次，第十三枚暗语到手',
  },
  {
    key: 'snow',
    label: '初雪',
    hint: '在十二月里来过一次',
    where: '任意页面',
    how: '十二月第一次打开站点',
    effect: '天上落下几点雪',
  },
  {
    key: 'copy',
    label: '断句',
    hint: '想把文章里的一句话带走，却被拦住了',
    where: '任意文章',
    how: '选中一段文字按 Ctrl+C（未解锁时会被拦）',
    effect: '控制台留一句话：你带走了它',
  },
  {
    key: 'anniversary',
    label: '周年',
    hint: '在文章发布的那一天，再看它一眼',
    where: '任意文章',
    how: '在发布日期的同一个月、同一天打开那篇',
    effect: '标题旁浮出一枚「周年」印',
  },
  {
    key: 'shuffle',
    label: '挑不出来',
    hint: '连续换五首，一首都没让它唱完',
    where: '播放器',
    how: '在 20 秒内连点五次「下一首」',
    effect: '点亮（也是提醒你，别急）',
  },
  {
    key: 'nightread',
    label: '夜读',
    hint: '关灯，(dark) 读完三篇',
    where: '暗色主题下的文章页',
    how: '在暗色主题下把三篇文章各自读到底',
    effect: '点亮',
  },
  {
    key: 'fourofour',
    label: '四点零四',
    hint: '凌晨四点零四分，世界最安静的时候',
    where: '任意页面',
    how: '在 04:04 打开站点',
    effect: '点亮（《凌晨四点的城市》是这么来的）',
  },
  {
    key: 'fate',
    label: '缘分',
    hint: '抽签，连续两次抽到同一篇',
    where: '文章列表',
    how: '点「抽一根签」两次，恰好是同篇',
    effect: '点亮',
  },
  {
    key: 'shelf',
    label: '满架',
    hint: '把喜欢的都收起来，收满十篇',
    where: '收藏夹',
    how: '收藏满十篇',
    effect: '点亮',
  },
  {
    key: 'rainoff',
    label: '雨停',
    hint: '开着雨声，把一篇文章读完',
    where: '文章页',
    how: '打开「下雨」，然后把文章读到最底',
    effect: '雨声自动停下',
  },
  {
    key: 'silence',
    label: '沉默',
    hint: '在一篇文章里，整整一分钟什么都没做',
    where: '文章页',
    how: '打开一篇文章，不滚不动，等一分钟',
    effect: '点亮',
  },
]

const EGGS_KEY = 'embers_eggs'
const VISITS_KEY = 'embers_visits'
const SESSION_KEY = 'embers_visit_counted'

export function getCollectedEggs(): EggKey[] {
  try {
    const raw = localStorage.getItem(EGGS_KEY)
    return raw ? (JSON.parse(raw) as EggKey[]) : []
  } catch {
    return []
  }
}

/* 点亮一枚暗语：已点亮过则忽略；点亮时广播事件（收集册实时更新） */
export function collectEgg(key: EggKey): void {
  try {
    const list = getCollectedEggs()
    if (list.includes(key)) return
    list.push(key)
    localStorage.setItem(EGGS_KEY, JSON.stringify(list))
    window.dispatchEvent(new CustomEvent('embers-egg', { detail: key }))
  } catch {
    /* ignore */
  }
}

/* 记一次到访（同一会话只记一次），返回累计次数 */
export function bumpVisit(): number {
  try {
    const prev = parseInt(localStorage.getItem(VISITS_KEY) || '0', 10) || 0
    if (sessionStorage.getItem(SESSION_KEY)) return prev
    sessionStorage.setItem(SESSION_KEY, '1')
    const n = prev + 1
    localStorage.setItem(VISITS_KEY, String(n))
    return n
  } catch {
    return 0
  }
}

export function getVisits(): number {
  try {
    return parseInt(localStorage.getItem(VISITS_KEY) || '0', 10) || 0
  } catch {
    return 0
  }
}

export function isNightNow(): boolean {
  const h = new Date().getHours()
  return h >= 0 && h < 5
}
