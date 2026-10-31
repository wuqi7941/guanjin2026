export interface Track {
  t: string
  a: string
  id: number
}

/* 曲库：搜索走 GD Studio（免会员、免 key），播放走 meting 的 302 直链。
   加歌时跑 _tools/resolve-tracks.js 重新生成，别手抄 ID。 */
export const PLAYLIST: Track[] = [
  { t: "夜的钢琴曲四", a: "石进", id: 149294 },
  { t: "夜的钢琴曲五", a: "石进", id: 149297 },
  { t: "难说", a: "罗森涛", id: 3383654858 },
  { t: "于是", a: "郑润泽", id: 1303464858 },
  { t: "开始懂了", a: "孙燕姿", id: 5246676 },
  { t: "Shootout", a: "Izzamuzzic/Julien Marchal", id: 1960642479 },
  { t: "Concierge Lounge", a: "Lukrembo", id: 2089833209 },
  { t: "流泪眼望流泪眼", a: "容祖儿", id: 27483212 },
  { t: "甲乙丙丁 (你我怎么两清)", a: "李佳薇", id: 3399839173 },
  { t: "当两颗心", a: "罗森涛", id: 2611412636 },
  { t: "爱爱爱", a: "方大同", id: 82453 },
  { t: "指纹", a: "杜宣达", id: 1887139866 },
  { t: "爱的回归线 (Live版)", a: "单依纯", id: 2061888566 },
  { t: "心墙", a: "郭静", id: 27671269 },
  { t: "至少还有你", a: "林忆莲", id: 256621 },
  { t: "到此为止", a: "徐佳莹", id: 526081111 },
  { t: "虚拟", a: "陈粒", id: 421423808 },
  { t: "怪咖", a: "薛之谦", id: 574921549 },
  { t: "黑白", a: "方大同", id: 82181 },
  { t: "星空", a: "梦", id: 2709892032 },
  { t: "失眠了", a: "吴琳珂Moske", id: 3347295437 },
  { t: "阴天", a: "莫文蔚", id: 108640 },
  { t: "Felicity", a: "Isaac Shepard", id: 19934757 },
  { t: "半句再见", a: "孙燕姿", id: 548556869 },
  { t: "失落沙洲", a: "徐佳莹", id: 306662 },
  { t: "想你的夜", a: "关喆", id: 88926 },
  { t: "为何离开", a: "罗森涛", id: 2166584563 },
  { t: "Hush", a: "DooPiano", id: 1818567994 },
  { t: "山野煮雨", a: "小野", id: 2677687612 },
  { t: "就目前来看demo", a: "郑润泽", id: 1333052002 },
  { t: "不说 (原来是不说)", a: "周公", id: 1436117704 },
  { t: "12.31", a: "郑润泽", id: 1352916750 },
  { t: "才二十三", a: "方大同", id: 2619125556 },
  { t: "小胡同", a: "郑润泽", id: 1926623288 },
  { t: "麻醉师", a: "胡睿", id: 1374505714 },
  { t: "小孩", a: "罗森涛", id: 2166584564 },
  { t: "把回忆拼好给你", a: "王贰浪", id: 1403318151 },
  { t: "想自由", a: "王安宇", id: 2709792992 },
  { t: "Sleeptalking（伴奏0.8）", a: "Tony·J", id: 2662254090 },
  { t: "magnolia", a: "keshi", id: 494642794 },
  { t: "一样的月光", a: "徐佳莹", id: 306665 },
  { t: "诀别书", a: "邓垚", id: 2038191895 },
  { t: "失眠飞行", a: "接个吻，开一枪/沈以诚/薛明媛", id: 1365898499 },
  { t: "time machine (feat. aren park)", a: "mj apanay/aren park", id: 2118572900 },
  { t: "有一种悲伤", a: "黄丽玲", id: 1315718569 },
  { t: "水星记", a: "郭顶", id: 441491828 },
  { t: "中间人", a: "Ice Paper", id: 864498975 },
  { t: "The truth that you leave", a: "Pianoboy高至豪", id: 139774 },
  { t: "失眠", a: "Suki刘舒妤", id: 273114 },
  { t: "演员", a: "薛之谦", id: 32507038 },
  { t: "雨过后的风景", a: "Dizzy Dizzo (蔡诗芸)", id: 215382 },
  { t: "世界正中", a: "陈粒", id: 1465290031 },
  { t: "我怀念的", a: "孙燕姿", id: 287063 },
  { t: "孤独患者", a: "陈奕迅", id: 64093 },
  { t: "Love Song", a: "方大同", id: 82360 },
  { t: "唯一", a: "告五人", id: 1807799505 },
  { t: "麦恩莉", a: "方大同", id: 25648006 },
  { t: "背叛", a: "曹格", id: 63574 },
  { t: "浴室", a: "deca joins", id: 483378334 },
  { t: "洋葱", a: "杨宗纬", id: 176053 },
  { t: "好久不见", a: "陈奕迅", id: 65538 },
  { t: "Love Me", a: "JMSN", id: 2080324987 },
  { t: "拆穿", a: "小霞", id: 399343373 },
  { t: "陀飞轮", a: "陈奕迅", id: 64638 },
  { t: "富士山下", a: "陈奕迅", id: 65766 },
  { t: "最佳损友", a: "陈奕迅", id: 65800 },
  { t: "desolate 2", a: "ByErik ヵ", id: 2674752242 },
  { t: "幻想被爱是种病", a: "落寞岛", id: 2699420878 },
  { t: "被雨浸透的独白", a: "Ashesfinal", id: 2727057241 },
  { t: "罗生门（Follow）", a: "梨冻紧/Wiz_H张子豪", id: 1456890009 },
  { t: "像鱼", a: "王贰浪", id: 1331819951 },
  { t: "寂寞烟火", a: "朱婧汐Akini Jing", id: 29357087 },
  { t: "ithinkimgoinginsane", a: "VALOUS ISRAFIL", id: 2748600076 },
  { t: "再见太难", a: "利得汇", id: 3416333610 },
  { t: "因为你", a: "方大同", id: 1462515184 },
  { t: "眼泪成诗", a: "孙燕姿", id: 287173 },
  { t: "最寂寞的时候", a: "卢广仲", id: 109559 },
  { t: "刻在我心底的名字", a: "卢广仲", id: 1472921626 },
  { t: "天气先生", a: "方大同", id: 28387868 },
  { t: "情歌", a: "梁静茹", id: 254102 },
  { t: "Rain after Summer", a: "羽肿", id: 430685732 },
  { t: "雀圣", a: "鲸鱼老师", id: 2112036060 },
  { t: "Be故事的终局", a: "肚子又饿了/Zy", id: 2702352012 },
  { t: "take care", a: "wandering", id: 1385355504 },
  { t: "躲进水里的倒影", a: "Warsic/壹勺籽糖", id: 3351212817 },
  { t: "孤雏", a: "AGA", id: 421486605 },
  { t: "十面埋伏", a: "陈奕迅", id: 409931770 },
  { t: "Moon River", a: "Audrey Hepburn", id: 1474018440 },
]

/* 音源三档（2026-10-31 起）：
   0 = GD Studio（JSONP，完整 320kbps；meting 试听化之后的正式主源）
   1 = injahow meting（302 直链，免费曲完整、版权曲会退成 30s 试听）
   2 = 网易官方外链（最后的兜底，未登录基本是 30s） */
export const TRACK_URL = (id: number) => `https://api.injahow.cn/meting/?type=url&id=${id}`
export const NETEASE_URL = (id: number) => `https://music.163.com/song/media/outer/url?id=${id}.mp3`
export const META_URL = (id: number) => `https://api.injahow.cn/meting/?type=song&id=${id}`

/* GD Studio 不给 CORS 头，fetch 会被浏览器拦；但它支持 JSONP，脚本注入即可取到 url。 */
export const GD_URL = (id: number, cb: string) =>
  `https://music-api.gdstudio.xyz/api.php?types=url&id=${id}&source=netease&br=320&callback=${cb}`

let gdSeq = 0

/* 拿一首歌的完整播放地址（约 8s 超时）。GD 返回的直链有时效，拿到就立刻用，别缓存。 */
export function gdTrackUrl(id: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return reject(new Error('no document'))
    const cb = `__embersGd${++gdSeq}`
    const script = document.createElement('script')
    const win = window as unknown as Record<string, unknown>
    let done = false

    const cleanup = () => {
      window.clearTimeout(timer)
      script.remove()
      delete win[cb]
    }
    const fail = (msg: string) => {
      if (done) return
      done = true
      cleanup()
      reject(new Error(msg))
    }
    const timer = window.setTimeout(() => fail('gd timeout'), 8000)

    win[cb] = (j: { url?: string } | null) => {
      if (done) return
      if (j?.url) {
        done = true
        cleanup()
        resolve(j.url)
      } else fail('gd no url')
    }

    script.src = GD_URL(id, cb)
    script.onerror = () => fail('gd script error')
    document.head.appendChild(script)
  })
}
