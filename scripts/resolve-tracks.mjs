/**
 * resolve-tracks.js -- 把「歌名;歌手」清单解析成网易云 ID，并验证可播
 * 用法: node resolve-tracks.js [--apply]
 */
const fs = require('fs')
const path = require('path')

const ROOT = String.raw`C:\Users\Admin（无密码）\Desktop\workbuddy\my-app`
const API = 'https://music-api.gdstudio.xyz/api.php'
const METING = 'https://api.injahow.cn/meting/?type=url&id='

const RAW = `
麦恩莉|方大同
背叛|曹格
浴室|deca joins
洋葱|杨宗纬
好久不见|陈奕迅
Love Me|JMSN
拆穿|小霞
陀飞轮|陈奕迅
富士山下|陈奕迅
最佳损友|陈奕迅
desolate 2|ByErik ヵ
幻想被爱是种病|落寞岛
被雨浸透的独白|Ashesfinal
罗生门（Follow）|梨冻紧/Wiz_H张子豪
像鱼|王贰浪
寂寞烟火|朱婧汐Akini Jing
ithinkimgoinginsane|VALOUS ISRAFIL
再见太难|利得汇
因为你|方大同
眼泪成诗|孙燕姿
最寂寞的时候|卢广仲
刻在我心底的名字|卢广仲
天气先生|方大同
情歌|梁静茹
Rain after Summer|羽肿
雀圣|鲸鱼老师
Be故事的终局|肚子又饿了/Zy
take care|wandering
躲进水里的倒影|Warsic/壹勺籽糖
孤雏|AGA
十面埋伏|陈奕迅
Moon River|Audrey Hepburn
夜的钢琴曲四|石进
夜的钢琴曲五|石进
难说|罗森涛
于是|郑润泽
开始懂了|孙燕姿
Shootout|Izzamuzzic/Julien Marchal
Concierge Lounge|Lukrembo
流泪眼望流泪眼|容祖儿
甲乙丙丁 (你我怎么两清)|李佳薇
爱爱爱|方大同
指纹|杜宣达
爱的回归线|陈韵若/陈每文
至少还有你|林忆莲
到此为止|徐佳莹
虚拟|陈粒
怪咖|薛之谦
黑白|方大同
星空|梦
失眠了|吴琳珂Moske
阴天|莫文蔚
Felicity|Isaac Shepard
半句再见|孙燕姿
失落沙洲|徐佳莹
想你的夜|关喆
为何离开|罗森涛
Hush|DooPiano
山野煮雨|小野
就目前来看demo|郑润泽
不说 (原来是不说)|周公
才二十三|方大同
小胡同|郑润泽
麻醉师|胡睿
小孩|罗森涛
把回忆拼好给你|王贰浪
想自由|王安宇
Sleeptalking（伴奏0.8）|Tony·J
magnolia|keshi
一样的月光|徐佳莹
诀别书|邓垚
失眠飞行|接个吻，开一枪/沈以诚/薛明媛
time machine (feat. aren park)|mj apanay/aren park
有一种悲伤|黄丽玲
水星记|郭顶
中间人|Ice Paper
The truth that you leave|Pianoboy高至豪
失眠|Suki刘舒妤
演员|薛之谦
雨过后的风景|Dizzy Dizzo (蔡诗芸)
世界正中|陈粒
孤独患者|陈奕迅
Love Song|方大同
唯一|告五人
`.trim()

const existing = [
  ['夜的钢琴曲四', '石进', 149294], ['夜的钢琴曲五', '石进', 149297],
  ['难说', '罗森涛', 3383654858], ['于是', '郑润泽', 1303464858],
  ['开始懂了', '孙燕姿', 5246676], ['Shootout', 'Izzamuzzic/Julien Marchal', 1960642479],
  ['Concierge Lounge', 'Lukrembo', 2089833209], ['流泪眼望流泪眼', '容祖儿', 27483212],
  ['甲乙丙丁 (你我怎么两清)', '李佳薇', 3399839173], ['当两颗心', '罗森涛', 2611412636],
  ['爱爱爱', '方大同', 82453], ['指纹', '杜宣达', 1887139866],
  ['爱的回归线', '陈韵若/陈每文', 25639007], ['心墙', '郭静', 27671269],
  ['至少还有你', '林忆莲', 256621], ['到此为止', '徐佳莹', 526081111],
  ['虚拟', '陈粒', 421423808], ['怪咖', '薛之谦', 574921549],
  ['黑白', '方大同', 82181], ['星空', '梦', 2709892032],
  ['失眠了', '吴琳珂Moske', 3347295437], ['阴天', '莫文蔚', 108640],
  ['Felicity', 'Isaac Shepard', 19934757], ['半句再见', '孙燕姿', 548556869],
  ['失落沙洲', '徐佳莹', 306662], ['想你的夜', '关喆', 88926],
  ['为何离开', '罗森涛', 2166584563], ['Hush', 'DooPiano', 1818567994],
  ['山野煮雨', '小野', 2677687612], ['就目前来看demo', '郑润泽', 1333052002],
  ['不说 (原来是不说)', '周公', 1436117704], ['12.31', '郑润泽', 1352916750],
  ['才二十三', '方大同', 2619125556], ['小胡同', '郑润泽', 1926623288],
  ['麻醉师', '胡睿', 1374505714], ['小孩', '罗森涛', 2166584564],
  ['把回忆拼好给你', '王贰浪', 1403318151], ['想自由', '王安宇', 2709792992],
  ['Sleeptalking（伴奏0.8）', 'Tony·J', 2662254090], ['magnolia', 'keshi', 494642794],
  ['一样的月光', '徐佳莹', 306665], ['诀别书', '邓垚', 2038191895],
  ['失眠飞行', '接个吻，开一枪/沈以诚/薛明媛', 1365898499],
  ['time machine (feat. aren park)', 'mj apanay/aren park', 2118572900],
  ['有一种悲伤', '黄丽玲', 1315718569], ['水星记', '郭顶', 441491828],
  ['中间人', 'Ice Paper', 864498975], ['The truth that you leave', 'Pianoboy高至豪', 139774],
  ['失眠', 'Suki刘舒妤', 273114], ['演员', '薛之谦', 32507038],
  ['雨过后的风景', 'Dizzy Dizzo (蔡诗芸)', 215382], ['世界正中', '陈粒', 1465290031],
  ['我怀念的', '孙燕姿', 287063], ['孤独患者', '陈奕迅', 64093],
  ['Love Song', '方大同', 82360], ['唯一', '告五人', 1807799505],
]

/* 上次跑时被 503 限流、后来单独解析出来的四首，直接写死免得再撞 */
const PRERESOLVED = {
  '幻想被爱是种病': [2699420878, '落寞岛'],
  '被雨浸透的独白': [2727057241, 'Ashesfinal'],
  '像鱼': [1331819951, '王贰浪'],
  '孤雏': [421486605, 'AGA'],
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const norm = (s) => String(s).toLowerCase().replace(/[\s（）()【】\[\]·.,，、!！?？'’]/g, '')

async function search(name, artist) {
  const q = [name, artist.split('/')[0]].filter(Boolean).join(' ')
  const url = `${API}?types=search&source=netease&name=${encodeURIComponent(q)}&count=8`
  const r = await fetch(url)
  if (!r.ok) throw new Error('search ' + r.status)
  const list = await r.json()
  if (!Array.isArray(list) || !list.length) return null

  const na = norm(name)
  const ar = norm(artist)
  let best = list.find((x) => norm(x.name) === na && norm(x.artist.join('')).includes(ar.slice(0, 3)))
  if (!best) best = list.find((x) => norm(x.name) === na)
  if (!best) best = list.find((x) => norm(x.name).includes(na) || na.includes(norm(x.name)))
  if (!best) best = list[0]
  return best
}

async function playable(id) {
  const r = await fetch(METING + id, { redirect: 'manual' })
  const loc = r.headers.get('location') || ''
  return /music\.126\.net|\.mp3|\.m4a|\.flac/.test(loc) ? loc.split('?')[0].slice(-46) : null
}

;(async () => {
  const lines = RAW.split('\n').map((l) => l.trim()).filter(Boolean)
  const userList = lines.map((l) => {
    const [t, a] = l.split('|')
    return { t: t.trim(), a: a.trim() }
  })

  const have = new Set(existing.map(([t, a]) => norm(t) + '|' + norm(a)))
  const haveName = new Set(existing.map(([t]) => norm(t)))

  const added = []
  const skipped = []
  const failed = []

  for (const item of userList) {
    if (have.has(norm(item.t) + '|' + norm(item.a)) || haveName.has(norm(item.t))) {
      skipped.push(item.t)
      continue
    }
    if (PRERESOLVED[item.t]) {
      const [id, a] = PRERESOLVED[item.t]
      added.push({ t: item.t, a, id })
      console.log('  ✔(预置)', item.t, '→', id)
      continue
    }
    try {
      const hit = await search(item.t, item.a)
      if (!hit) { failed.push(item.t + '（搜不到）'); continue }
      const ok = await playable(hit.id)
      added.push({ t: hit.name || item.t, a: hit.artist.join('/') || item.a, id: Number(hit.id) })
      console.log('  ✔', item.t, '→', hit.id, hit.name, '/', hit.artist.join('/'), ok ? '可播' : '⚠ 直链未确认')
    } catch (e) {
      failed.push(item.t + '（' + e.message + '）')
    }
    await sleep(250)
  }

  console.log('\n新增', added.length, '| 已有跳过', skipped.length, '| 失败', failed.length)
  if (failed.length) console.log('失败：', failed.join('、'))

  const all = [...existing.map(([t, a, id]) => ({ t, a, id })), ...added]

  const lines2 = all.map((x) => `  { t: ${JSON.stringify(x.t)}, a: ${JSON.stringify(x.a)}, id: ${x.id} },`)
  const out = `export interface Track {
  t: string
  a: string
  id: number
  /* 保留字段：曾标记 VIP/试听，现播放均走完整源，不再显示试听角标 */
  v?: 1
}

/* 曲库：搜索走 GD Studio（免会员、免 key），播放走 meting 的 302 直链。
   加歌时跑 _tools/resolve-tracks.js 重新生成，别手抄 ID。 */
export const PLAYLIST: Track[] = [
${lines2.join('\n')}
]

export const TRACK_URL = (id: number) => \`https://api.injahow.cn/meting/?type=url&id=\${id}\`
export const NETEASE_URL = (id: number) => \`https://music.163.com/song/media/outer/url?id=\${id}.mp3\`
export const META_URL = (id: number) => \`https://api.injahow.cn/meting/?type=song&id=\${id}\`
`

  if (!process.argv.includes('--apply')) {
    console.log('\n(dry run) 总曲目', all.length)
    process.exit(0)
  }
  const bak = path.join(ROOT, 'lib', `playlist.pre-${new Date().toISOString().slice(0, 10)}.ts`)
  fs.writeFileSync(bak, fs.readFileSync(path.join(ROOT, 'lib', 'playlist.ts'), 'utf8'))
  fs.writeFileSync(path.join(ROOT, 'lib', 'playlist.ts'), out)
  console.log('\n已写入 lib/playlist.ts，共', all.length, '首；备份', path.basename(bak))
})()
