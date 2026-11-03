/* 试金石：站内小测试的题库与解读。全部静态，无后端。 */

/* ============ MBTI（三档：速测 16 / 标准 32 / 深测 48） ============ */
/* 题库共 48 题，每维度 12 题；按档位每维度随机抽取，出题时按维度交错排列 */

export interface MbtiOption {
  text: string
  dim: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'
}

export interface MbtiQuestion {
  q: string
  a: MbtiOption
  b: MbtiOption
}

export const MBTI_BANK: MbtiQuestion[] = [
  /* —— E / I —— */
  { q: '精力满格的一天结束，你回头看', a: { text: '大部分时间在和人来往', dim: 'E' }, b: { text: '大部分时间是自己的', dim: 'I' } },
  { q: '手机响了，是半熟的人约你出门', a: { text: '大多答应', dim: 'E' }, b: { text: '大多找理由推掉', dim: 'I' } },
  { q: '你更喜欢的学习方式', a: { text: '和人讨论着学', dim: 'E' }, b: { text: '自己啃', dim: 'I' } },
  { q: '小组作业里，你常是', a: { text: '那个串场协调的', dim: 'E' }, b: { text: '那个埋头干的', dim: 'I' } },
  { q: '长途车上你一般', a: { text: '跟邻座聊起来', dim: 'E' }, b: { text: '戴耳机看窗外', dim: 'I' } },
  { q: '心里的主意，你通常', a: { text: '说出来，边说边完善', dim: 'E' }, b: { text: '想清楚了再说', dim: 'I' } },
  { q: '连续社交两小时后，你感觉', a: { text: '还行，甚至更精神', dim: 'E' }, b: { text: '电量见底', dim: 'I' } },
  { q: '遇到有意思的事，你的第一动作', a: { text: '告诉别人', dim: 'E' }, b: { text: '自己先品', dim: 'I' } },
  { q: '你理想的工作状态', a: { text: '团队热热闹闹', dim: 'E' }, b: { text: '独立专注、少打扰', dim: 'I' } },
  { q: '周末两天空了，你会', a: { text: '约人把日程填满', dim: 'E' }, b: { text: '留白比日程舒服', dim: 'I' } },
  { q: '陌生人搭话，你', a: { text: '接得住，聊得起来', dim: 'E' }, b: { text: '礼貌，但想早点结束', dim: 'I' } },
  { q: '你的社交能量更像是', a: { text: '越用越多的可再生能源', dim: 'E' }, b: { text: '用一点少一点的存电', dim: 'I' } },

  /* —— S / N —— */
  { q: '看到一幅抽象画，你先', a: { text: '想它画的到底是什么', dim: 'S' }, b: { text: '想它让你想到了什么', dim: 'N' } },
  { q: '计划下周的事，你', a: { text: '列具体的清单', dim: 'S' }, b: { text: '先定个大方向', dim: 'N' } },
  { q: '朋友讲他的新点子，你先问', a: { text: '打算怎么落地', dim: 'S' }, b: { text: '然后呢？还有呢？', dim: 'N' } },
  { q: '你写东西更倾向', a: { text: '把事情说清楚', dim: 'S' }, b: { text: '把感觉写出来', dim: 'N' } },
  { q: '记路的方式', a: { text: '记地标和路口', dim: 'S' }, b: { text: '记大概方向和感觉', dim: 'N' } },
  { q: '你觉得更值得花时间', a: { text: '把一件事做精', dim: 'S' }, b: { text: '同时开几件新鲜事', dim: 'N' } },
  { q: '看到一条规则，你先想', a: { text: '它怎么执行', dim: 'S' }, b: { text: '它为什么存在', dim: 'N' } },
  { q: '描述昨晚的梦', a: { text: '按顺序讲清楚', dim: 'S' }, b: { text: '讲印象最深的那团感觉', dim: 'N' } },
  { q: '你更欣赏的人', a: { text: '把平凡事做到极致', dim: 'S' }, b: { text: '总能看到别人看不到的', dim: 'N' } },
  { q: '学一个新工具', a: { text: '先把基础功能摸熟', dim: 'S' }, b: { text: '直接乱点，边玩边懂', dim: 'N' } },
  { q: '日常聊天里你更常接', a: { text: '「对，昨天我也……」的实况', dim: 'S' }, b: { text: '「你有没有想过……」的脑洞', dim: 'N' } },
  { q: '别人形容你，更像', a: { text: '稳', dim: 'S' }, b: { text: '飘', dim: 'N' } },

  /* —— T / F —— */
  { q: '朋友的决定很糟糕，你会', a: { text: '直接说', dim: 'T' }, b: { text: '先肯定，再绕着提', dim: 'F' } },
  { q: '看电影看哭过吗', a: { text: '基本没有', dim: 'T' }, b: { text: '经常', dim: 'F' } },
  { q: '一段关系结束后，你先想', a: { text: '问题出在哪', dim: 'T' }, b: { text: '他现在还好吗', dim: 'F' } },
  { q: '你更受不了的队友', a: { text: '逻辑不通的', dim: 'T' }, b: { text: '情绪失控的', dim: 'F' } },
  { q: '表扬别人时，你更常说', a: { text: '你做得又快又对', dim: 'T' }, b: { text: '你真的不容易', dim: 'F' } },
  { q: '争论赢了，你的感觉', a: { text: '爽，道理就该辩清楚', dim: 'T' }, b: { text: '赢了也有点膈应', dim: 'F' } },
  { q: '帮人做选择，你会给', a: { text: '一份利弊清单', dim: 'T' }, b: { text: '「你心里其实有答案了」', dim: 'F' } },
  { q: '判断一个决定好不好，你先看', a: { text: '结果对不对', dim: 'T' }, b: { text: '动机善不善', dim: 'F' } },
  { q: '对「共情」你的态度', a: { text: '理解，但做不到感同身受', dim: 'T' }, b: { text: '别人难受，我也跟着难受', dim: 'F' } },
  { q: '你说话更追求', a: { text: '准确', dim: 'T' }, b: { text: '让人舒服', dim: 'F' } },
  { q: '搞砸了一件事，你先想', a: { text: '技术上哪里错了', dim: 'T' }, b: { text: '会不会辜负了谁', dim: 'F' } },
  { q: '你的温柔更像是', a: { text: '讲道理式的帮助', dim: 'T' }, b: { text: '无条件的接住', dim: 'F' } },

  /* —— J / P —— */
  { q: '出门前的你', a: { text: '提前收拾好了', dim: 'J' }, b: { text: '出发前五分钟在找钥匙', dim: 'P' } },
  { q: '你的假期计划', a: { text: '有日程表', dim: 'J' }, b: { text: '有选项，没顺序', dim: 'P' } },
  { q: '去超市之前', a: { text: '有清单，还带预算', dim: 'J' }, b: { text: '到了再说', dim: 'P' } },
  { q: '日程被打乱（哪怕变得更好），你', a: { text: '不太舒服', dim: 'J' }, b: { text: '无所谓，新安排也行', dim: 'P' } },
  { q: '你的收藏夹或笔记', a: { text: '分类清清楚楚', dim: 'J' }, b: { text: '一团，但都能找到', dim: 'P' } },
  { q: '朋友评价你，更常说', a: { text: '靠谱', dim: 'J' }, b: { text: '随性', dim: 'P' } },
  { q: '任务刚下达，你', a: { text: '拆步骤、排时间', dim: 'J' }, b: { text: '先拖着，状态来了再做', dim: 'P' } },
  { q: '吃饭选择困难时', a: { text: '点常吃的那几家', dim: 'J' }, b: { text: '每次都想换新的', dim: 'P' } },
  { q: '你对「备用方案」', a: { text: '出发前就备好', dim: 'J' }, b: { text: '出了事再说', dim: 'P' } },
  { q: '整理房间这件事', a: { text: '定期整理', dim: 'J' }, b: { text: '攒到受不了再大扫除', dim: 'P' } },
  { q: '你更享受', a: { text: '按计划完成的踏实感', dim: 'J' }, b: { text: '临时起意的惊喜感', dim: 'P' } },
  { q: '桌上有项小任务', a: { text: '现在顺手做掉', dim: 'J' }, b: { text: '明天再说', dim: 'P' } },
]

/* 三档：count = 每个维度抽几题（4×4=16 / 8×4=32 / 12×4=48） */
export const MBTI_TIERS = [
  { id: 'quick', label: '速测', count: 4, tag: '16 题 · 约 2 分钟' },
  { id: 'std', label: '标准', count: 8, tag: '32 题 · 约 5 分钟' },
  { id: 'full', label: '深测', count: 12, tag: '48 题 · 约 8 分钟' },
] as const

export type MbtiTier = (typeof MBTI_TIERS)[number]['id']

/* 按档位组一套题：每维度随机抽 count 题，再按维度交错排列（相邻题不同维度） */
export function buildMbtiSet(tier: MbtiTier, rand: () => number = Math.random): MbtiQuestion[] {
  const perDim = MBTI_TIERS.find((t) => t.id === tier)!.count
  const byDim: Record<string, MbtiQuestion[]> = { E: [], I: [], S: [], N: [], T: [], F: [], J: [], P: [] }
  const pool: Record<string, MbtiQuestion[]> = { E: [], I: [], S: [], N: [], T: [], F: [], J: [], P: [] }
  for (const q of MBTI_BANK) {
    pool[q.a.dim].push(q)
  }
  for (const dim of Object.keys(pool)) {
    const arr = [...pool[dim]]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    byDim[dim] = arr.slice(0, perDim)
  }
  /* 交错：E I S N T F J P 轮转，每轮各取一题 */
  const order = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P']
  const out: MbtiQuestion[] = []
  for (let round = 0; round < perDim; round++) {
    for (const dim of order) {
      const q = byDim[dim][round]
      if (q) out.push(q)
    }
  }
  return out
}

export interface MbtiMeta {
  code: string
  name: string
  fire: string
  tags: string[]
  text: string
  ember: string
}

/* 十六型分析：火系意象 + 特质标签 + 分析段 + 一句烬语 */
export const MBTI_TYPES: Record<string, MbtiMeta> = {
  INTJ: {
    code: 'INTJ',
    name: '炉心',
    fire: '炉火',
    tags: ['长线思考', '自成体系', '少说多做'],
    text: '火压在最里面，烧得最久。你的计划往往比别人的行动还长——别人看见你安静，看不见你脑子里那座已经搭好的塔。你不缺想法，缺的是把想法讲给别人听的耐心；而一旦有人真听懂了，会发现你的每一步都早就想好了。',
    ember: '慢一点没关系，炉子从不怕冷。',
  },
  INTP: {
    code: 'INTP',
    name: '星火',
    fire: '星火',
    tags: ['好奇过载', '逻辑洁癖', '开局狂魔'],
    text: '想法一串一串地冒，熄了一颗还有一颗。你的世界里「为什么」比「怎么办」重要，所以常常懂了一百件事，做完了一件。这不是散，是燃料太多而炉膛只有一个——挑一颗烧到头，比你再点十颗都有用。',
    ember: '别急着全点着，先挑一颗烧到头。',
  },
  ENTJ: {
    code: 'ENTJ',
    name: '燎原',
    fire: '篝火',
    tags: ['天生的指挥', '目标即燃料', '直言不讳'],
    text: '火借风势，天生要烧成一片。别人看到乱局想的是麻烦，你想到的是「正好需要个人来理」——而那个人通常是你。你的直言偶尔烫人，但跟着你走的人心里都清楚：你是真的会把事情办成。',
    ember: '带人走路的时候，留一点暖给掉队的人。',
  },
  ENTP: {
    code: 'ENTP',
    name: '爆竹',
    fire: '星火',
    tags: ['点子永动机', '反骨', '临场怪物'],
    text: '一颗接一颗地炸，谁都拦不住。规则在你眼里是默认设置，不是法律；辩论是你的呼吸方式。你的坑只有一个：起头太容易，收尾太无聊——学会给每个开局配一个结局，你就是全场最亮。',
    ember: '起头靠天赋，收尾靠决定。',
  },
  INFJ: {
    code: 'INFJ',
    name: '灯芯',
    fire: '烛火',
    tags: ['读人如读书', '理想主义', '安静的主见'],
    text: '安静地亮着，照的却是别人的路。你总能在人开口之前感觉到TA今天不对——这种能力是天赋也是负担，因为你接住了太多别人的情绪，自己那部分反而排到最后。你需要的不是变开朗，是一个能放心暗下来的角落。',
    ember: '别忘了，灯芯自己也会怕黑。',
  },
  INFP: {
    code: 'INFP',
    name: '烛泪',
    fire: '烛火',
    tags: ['内心宇宙', '价值至上', '柔软且执拗'],
    text: '最软的火，最重的情。你的心里有一整套关于世界应该怎样的图纸，所以现实常常让你失望——但正是这套图纸，让你写出的字、做出的选择，带着别人没有的温度。敏感是燃料，不是病。',
    ember: '写下来，它就成了光。',
  },
  ENFJ: {
    code: 'ENFJ',
    name: '篝火',
    fire: '篝火',
    tags: ['人群磁石', '共情发动机', '过度负责'],
    text: '天生把人聚过来取暖。你能记住每个人的小细节，也习惯把每个人的情绪背在自己身上——聚在火边的人觉得暖，只有你知道柴是自己一根一根添的。学会说「今天我也累了」，是你的必修课。',
    ember: '屋里越热闹，越要给自己烤烤手。',
  },
  ENFP: {
    code: 'ENFP',
    name: '焰火',
    fire: '星火',
    tags: ['热情永动机', '意义搜寻者', '讨厌被框住'],
    text: '你在哪，哪就有颜色。你对世界的好奇是真的，对人的善意也是真的——唯一的问题是想做的事太多，而一天只有二十四小时。落地不丢人：焰火也有落点，那是下一发的起点。',
    ember: '落地不是熄灭，是装填。',
  },
  ISTJ: {
    code: 'ISTJ',
    name: '炭盆',
    fire: '炉火',
    tags: ['说到做到', '细节的忠诚', '沉默的可靠'],
    text: '不声不响，一整夜都温着。你不喜欢许大愿，但答应的事从来不落空——这种品质在故事里不讨喜，在生活里是稀罕物。世界喧闹的时候，总得有人守着火不让它灭。',
    ember: '稳定听起来平淡，其实是很多人求不来的超能力。',
  },
  ISFJ: {
    code: 'ISFJ',
    name: '暖炉',
    fire: '炉火',
    tags: ['照顾者', '记忆超群', '不懂拒绝'],
    text: '把暖全给了屋里的人。你记得谁不吃香菜、谁上次难过、谁随口提过想要什么——被你照顾是一种幸福，而你自己冷的时候常常不说。这一条是替你写的：说一声，有人愿意添柴。',
    ember: '轮到你冷的时候，说一声。',
  },
  ESTJ: {
    code: 'ESTJ',
    name: '灶火',
    fire: '炉火',
    tags: ['执行力', '秩序感', '责任野兽'],
    text: '一家人的饭都从这里熟。你把「应该做的事」一件件做完，不诉苦也不邀功——靠谱两个字好听，但它是日复一日烧出来的。偶尔允许自己不承担，天塌不下来。',
    ember: '偶尔不扛，天塌不下来。',
  },
  ESFJ: {
    code: 'ESFJ',
    name: '灯串',
    fire: '烛火',
    tags: ['氛围守护者', '热心肠', '怕被边缘'],
    text: '把每个角落都点亮一点。你在的关系网是别人眼里「怎么什么人都认识」的奇迹，因为你在真心维护每一条线。你怕冷场、怕被落下——但你值得的，比你给出去的少多了。',
    ember: '你也值得有一盏专门为你亮的灯。',
  },
  ISTP: {
    code: 'ISTP',
    name: '火折子',
    fire: '星火',
    tags: ['手比嘴快', '冷静到冷', '危机克星'],
    text: '平时收着，一抖就着。你话少不是没想法，是觉得「做出来比说出来快」。场面越乱你越冷静，这在关键时刻救过人——虽然没人记得是你救的。你也不在意，但这一条记录一下。',
    ember: '手上的功夫，也是一种表达。',
  },
  ISFP: {
    code: 'ISFP',
    name: '剪影',
    fire: '烛火',
    tags: ['审美动物', '活在当下', '不动声色的固执'],
    text: '不太说话。但你看墙上——烛光把你的作品投得满墙都是。你对「美」有一种近乎固执的坚持，别人以为你随和，其实底线一旦碰到，你比谁都硬。用作品说话，是你的母语。',
    ember: '用作品说话，是你的母语。',
  },
  ESTP: {
    code: 'ESTP',
    name: '打火机',
    fire: '篝火',
    tags: ['行动派', '临场之王', '怕无聊'],
    text: '咔哒一声就来劲。想十次不如试一次是你的信条，而且你的直觉在行动里确实准得吓人。唯一要防的是无聊——无聊会让你把好好的火点成火灾。找个值得烧的目标，你的能量是别人的好几倍。',
    ember: '找个值得烧的目标。',
  },
  ESFP: {
    code: 'ESFP',
    name: '焰火大会',
    fire: '星火',
    tags: ['全场焦点', '真诚到透明', '及时行乐'],
    text: '你在哪，哪就是高潮。你的快乐是真的，对朋友的大方也是真的——散场后的累也是真的，只是你不说。不用一直当气氛担当，真正的朋友不介意看你安安静静的一面。',
    ember: '真正的朋友，不介意你安安静静。',
  },
}

/* ============ 你是哪种火（原创五题，四选一） ============ */

export type FireKind = 'hearth' | 'candle' | 'bonfire' | 'spark'

export interface FireQuestion {
  q: string
  options: Array<{ text: string; kind: FireKind }>
}

export const FIRE_QUESTIONS: FireQuestion[] = [
  {
    q: '一个安静的晚上，你会',
    options: [
      { text: '煮一壶东西，慢慢等', kind: 'hearth' },
      { text: '写点没人看的字', kind: 'candle' },
      { text: '拉人聊个痛快', kind: 'bonfire' },
      { text: '躺到屋顶上看天', kind: 'spark' },
    ],
  },
  {
    q: '你的桌子',
    options: [
      { text: '东西各就各位', kind: 'hearth' },
      { text: '一盏灯，一叠纸', kind: 'candle' },
      { text: '零食饮料，大家的', kind: 'bonfire' },
      { text: '看着乱，但样样有灵', kind: 'spark' },
    ],
  },
  {
    q: '遇到难过的事',
    options: [
      { text: '先把自己安顿好', kind: 'hearth' },
      { text: '把它写下来', kind: 'candle' },
      { text: '找个人说说', kind: 'bonfire' },
      { text: '去很远的地方走一走', kind: 'spark' },
    ],
  },
  {
    q: '你希望被记住的方式',
    options: [
      { text: '一家人的灶，天天都热', kind: 'hearth' },
      { text: '一个人的光，照进心里', kind: 'candle' },
      { text: '一群人的暖，散了还想', kind: 'bonfire' },
      { text: '很远，但很久', kind: 'spark' },
    ],
  },
  {
    q: '冬天来了，你选',
    options: [
      { text: '屋里有火，哪也不去', kind: 'hearth' },
      { text: '窗边读一晚书', kind: 'candle' },
      { text: '组个局，进山里烧一堆大的', kind: 'bonfire' },
      { text: '看雪落，看到天亮', kind: 'spark' },
    ],
  },
]

export const FIRE_RESULTS: Record<FireKind, { name: string; en: string; text: string }> = {
  hearth: { name: '炉火', en: 'HEARTH', text: '稳定、可靠，把日子过成恒温。别人回头找方向的时候，找到的是你。' },
  candle: { name: '烛火', en: 'CANDLE', text: '安静、深，照亮一小块地方就够。你写下的字，常常比你本人先被看见。' },
  bonfire: { name: '篝火', en: 'BONFIRE', text: '热闹、坦荡，天生的局中心。你的暖是分给大家的——记得留一手给自己。' },
  spark: { name: '星火', en: 'SPARK', text: '跳脱、好奇，永远差一步安顿下来。世界因为你的乱窜，才有意思。' },
}

/* 从数组里随机抽 n 个（不重复）——打字机也在用 */
export function pickRandom<T>(arr: T[], n: number): T[] {
  const pool = [...arr]
  const out: T[] = []
  while (pool.length && out.length < n) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
  }
  return out
}
