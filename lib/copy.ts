/* 全站文案集中：改字只需动这一处 */

/* 首页打字机轮播（身份与意象） */
export const HERO_TEXTS = [
  '你好，我是观烬——一个十六岁的少年。',
  '「观烬」两个字的意思：看火烧完之后，剩下什么。',
  '白天是被作业追着跑的高中生，晚上写代码、做设计。',
  '「余烬」是没烧完的火：看着暗了，其实还在发热。',
  '十六岁写的字会幼稚吗？会。但不写，连幼稚都没有。',
  '有一架琴，在等我；有一篇关于琴的故事，在这里。',
  '校服口袋里装过琴谱，也装过写了一半的诗。',
  '这里是一座数字花园——不设门槛，只有一堆火。',
  '这里装着我所有烧过、和还在烧的想法。',
]

/* 静息发呆句（首页无操作时） */
export const IDLE_LINE = '发一会儿呆，也没关系。'

/* 深夜打字机句（0-5 点，优先播出） */
export const NIGHT_TYPE_LINE = '这么晚还没睡？火替你留着。'

/* 打字机触发词 → 回应句（敲出即回应） */
export const TYPE_TRIGGERS: Record<string, string> = {
  huo: '火，收下了。',
  embers: '这个词，刻在站名里。',
}

/* 季节句：打字机按当前季节随机插一句 */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export const SEASON_TEXTS: Record<Season, string[]> = {
  spring: ['春天了，火边写字，边等雨停。', '三月的风翻纸，比谁都快。'],
  summer: ['夏天的火最吵，蝉替它伴奏。', '把风扇对着稿纸吹，字也跟着凉快。'],
  autumn: ['秋天适合把烧过的东西，拿出来晒一晒。', '灰是秋天的雪，落得很慢。'],
  winter: ['冬天写字，要先烤烤手，再烤烤心。', '窗外越冷，炉边越暖——写作也是这个道理。'],
}

export function seasonOf(d = new Date()): Season {
  const m = d.getMonth() + 1
  if (m >= 3 && m <= 5) return 'spring'
  if (m >= 6 && m <= 8) return 'summer'
  if (m >= 9 && m <= 11) return 'autumn'
  return 'winter'
}

/* 惊喜句：偶尔从轮播里跳出来——身份冷知识、站内小机关的提示 */
export const SURPRISE_LINES = [
  '打字机里的句子，会跟着季节换——你现在读到的是哪一句？',
  '试试敲一个「huo」。',
  '长按那枚「余」印，会有事发生。',
  '页脚的火苗，是活着的——发会儿呆看看。',
  '琴键有八十八个，够弹完这一整个冬天。',
  '这站的代码和文字，出自同一双手。',
  '按 G 再按 B，能跳到博客——这是给键盘党的暗号。',
]

/* 从数组里随机抽 n 个（不重复），用于打字机的「时不时跳出来」 */
export function pickRandom<T>(arr: T[], n: number): T[] {
  const pool = [...arr]
  const out: T[] = []
  while (pool.length && out.length < n) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
  }
  return out
}

/* 读毕箴言（文章页） */
export const APHORISMS = [
  '字落纸上，便有了重量。',
  '火不必旺，温着就好。',
  '慢一点，墨才晕得开。',
  '写给自己，也写给路过的人。',
  '残火里，藏着明天的柴。',
  '读过，便算相识。',
]

/* 深夜页脚低语（0-5 点） */
export const NIGHT_WHISPERS = [
  '这个点还亮着的屏幕，都算火种。',
  '凌晨的安静里，火看得最清楚。',
  '还没睡？火也没睡。',
  '夜把声音收走了，只剩下火在响。',
  '凌晨的世界，属于还没合眼的人。',
  '灯下写字的时刻，是一天里最私人的部分。',
]

/* 24 节气（公历近似）与对应低语 */
export const SOLAR_TERMS: { m: number; d: number; line: string }[] = [
  { m: 1, d: 6, line: '小寒了，火往里收一收。' },
  { m: 1, d: 20, line: '大寒。最冷的日子，灰底下最暖。' },
  { m: 2, d: 4, line: '立春——冻土底下，火先醒。' },
  { m: 2, d: 19, line: '雨水一到，字都潮了，正好慢写。' },
  { m: 3, d: 6, line: '惊蛰。土里的东西都醒了，包括没烧完的念头。' },
  { m: 3, d: 21, line: '春分昼夜平分——火也分一半给白天。' },
  { m: 4, d: 5, line: '清明。该去看看旧火了。' },
  { m: 4, d: 20, line: '谷雨落，句子泡软了再写。' },
  { m: 5, d: 6, line: '立夏。火搬到树荫底下烧。' },
  { m: 5, d: 21, line: '小满未满，火候刚刚好。' },
  { m: 6, d: 6, line: '芒种——种下去的字，会自己长。' },
  { m: 6, d: 21, line: '夏至白昼最长，写字的时间也最长。' },
  { m: 7, d: 7, line: '小暑，火在蝉声里喘气。' },
  { m: 7, d: 23, line: '大暑。最热的日子，心要凉一点。' },
  { m: 8, d: 8, line: '立秋。夏天烧成的灰，秋天埋。' },
  { m: 8, d: 23, line: '处暑，暑气在撤退，火还在值岗。' },
  { m: 9, d: 8, line: '白露。夜里凉了，记得给火盖一层字。' },
  { m: 9, d: 23, line: '秋分——又到了平分的时刻，收一半，留一半。' },
  { m: 10, d: 8, line: '寒露。露水凉了，纸上要留暖。' },
  { m: 10, d: 23, line: '霜降。第一层霜，落在没烧完的纸上。' },
  { m: 11, d: 7, line: '立冬——火该藏在灰里了。' },
  { m: 11, d: 22, line: '小雪落无声，灰里翻个身。' },
  { m: 12, d: 7, line: '大雪。把火捂紧一点。' },
  { m: 12, d: 22, line: '冬至，夜最长。火替你把黑守了一半。' },
]

/* ============ 时段：按打开的时间换一句话 ============ */

export type DayPhase = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'evening' | 'late'

export function phaseOf(d = new Date()): DayPhase {
  const h = d.getHours()
  if (h >= 5 && h < 7) return 'dawn'
  if (h >= 7 && h < 11) return 'morning'
  if (h >= 11 && h < 13) return 'noon'
  if (h >= 13 && h < 17) return 'afternoon'
  if (h >= 17 && h < 19) return 'dusk'
  if (h >= 19 && h < 23) return 'evening'
  return 'late'
}

/* 首页打字机：这个时段的第一句 */
export const PHASE_TYPE: Record<DayPhase, string> = {
  dawn: '天刚亮。火是第一个醒的。',
  morning: '早上好。今天想读点什么？',
  noon: '正午。光最硬，字最软。',
  afternoon: '下午三点，人最容易走神——正好读一篇。',
  dusk: '天要黑了。火开始自己亮。',
  evening: '夜里好。今天累不累？',
  late: '这么晚还没睡？火替你留着。',
}

/* 页面底端：这个时段的一句低语 */
export const PHASE_FOOTER: Record<DayPhase, string> = {
  dawn: '天光从窗缝里挤进来，火小了一圈，人却松了。',
  morning: '上午的火不旺，正好煮一壶字。',
  noon: '日头正当中，影子缩到脚边，人也安静下来。',
  afternoon: '下午的光斜着走，纸上的字慢慢发暖。',
  dusk: '黄昏一到，什么都不用点，火自己就亮了。',
  evening: '夜色落下来，火在纸背后烧，看不见烟。',
  late: '夜深了，火还温着——替你把这一天守完。',
}