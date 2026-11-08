'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { PLAYLIST, TRACK_URL, NETEASE_URL, META_URL, gdTrackUrl } from '@/lib/playlist'
import { collectEgg } from '@/lib/eggs'

const LS_KEY = 'embers_mp'

export interface LrcLine {
  t: number
  txt: string
}

/* 带超时的取数：播放器的元数据 / 歌词都是「有就更好，没有也能放」，
   但无超时的 fetch 会一直挂着，把后面同一首歌的请求排在它后面。 */
async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), ms)
  try {
    const r = await fetch(url, { signal: ac.signal })
    if (!r.ok) throw new Error(`http ${r.status}`)
    return r
  } finally {
    clearTimeout(timer)
  }
}

const fetchJSON = (url: string, ms: number) => fetchWithTimeout(url, ms).then((r) => r.json())
const fetchText = (url: string, ms: number) => fetchWithTimeout(url, ms).then((r) => r.text())

function parseLrc(txt: string): LrcLine[] {
  const out: LrcLine[] = []
  const re = /\[(\d+):(\d+)(?:\.(\d+))?\]/g
  for (const line of txt.split(/\r?\n/)) {
    /* 一行可以挂多个时间戳（[00:01][00:05]同一段词）——逐个摘出来，词共用 */
    re.lastIndex = 0
    const stamps: RegExpExecArray[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(line))) stamps.push(m)
    if (!stamps.length) continue
    const text = line.replace(re, '').trim()
    if (!text) continue
    for (const mm of stamps) {
      const frac = mm[3] || ''
      /* 毫秒位按实际位数折算：两位是厘秒 /100，三位是毫秒 /1000 */
      const t =
        parseInt(mm[1], 10) * 60 + parseInt(mm[2], 10) + (frac ? parseInt(frac, 10) / Math.pow(10, frac.length) : 0)
      out.push({ t, txt: text })
    }
  }
  out.sort((a, b) => a.t - b.t)
  return out
}

/* 当前应高亮的歌词行：从上次结果（hint）附近找起，时间回退（seek）时二分。
   timeupdate 每秒 ~4 次，别每次都从 0 线扫 88 行。 */
function findActiveLrc(lrc: LrcLine[], t: number, hint: number): number {
  const n = lrc.length
  if (!n || t < lrc[0].t) return -1
  if (hint >= 0 && hint < n) {
    const hi = hint + 1 < n ? lrc[hint + 1].t : Infinity
    if (lrc[hint].t <= t && t < hi) return hint
  }
  let lo = 0
  let hi = n - 1
  let ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (lrc[mid].t <= t) {
      ans = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return ans
}

export function fmt(s: number) {
  s = Math.max(0, Math.floor(s || 0))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/* 播放器状态机：音频逻辑 / 持久化 / 键盘 / 歌词，全部内聚于此；
   MusicPlayer 只做渲染编排，MpPanel 系列保持纯展示。 */
export function usePlayerStore() {
  const [idx, setIdx] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [vol, setVol] = useState(0.8)
  const [shuffle, setShuffle] = useState(false)
  const [open, setOpen] = useState(false)
  const [full, setFull] = useState(false)
  const [tab, setTab] = useState<'lyrics' | 'list'>('lyrics')
  const [cover, setCover] = useState('')
  const [lrc, setLrc] = useState<LrcLine[]>([])
  const [activeLrc, setActiveLrc] = useState(-1)
  const [err, setErr] = useState('')
  const [buffering, setBuffering] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const idxRef = useRef(-1)
  const volRef = useRef(0.8)
  const shuffleRef = useRef(false)
  const openRef = useRef(false)
  const fullRef = useRef(false)
  const triesRef = useRef(0)
  const lrcRef = useRef<LrcLine[]>([])
  const activeLrcRef = useRef(-1)
  const lastSaveRef = useRef(0)
  const lrcCacheRef = useRef<Record<string, string>>({})
  const seekBarRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  /* 音源层级：0=GD Studio（完整 320k，JSONP）/ 1=injahow meting（版权曲会试听化）/ 2=网易外链（兜底）。
     2026-10-31：meting 把非免费曲降成 30s 试听，主源改为 GD Studio。 */
  const srcTierRef = useRef(0)
  /* 恢复上次进度时暂存的时间点：等真正开播、metadata 到了再 seek */
  const restoreTimeRef = useRef(0)
  /* 换源时把当前播放位置带过去：切源不该让歌从头再来 */
  const carriedTimeRef = useRef(0)
  /* 上一源的时长：换源后若新时长和它几乎一致，说明这就是完整长度（不是试听），别再降档 */
  const lastDurRef = useRef(0)
  /* 暗语「挑不出来」：连续切歌计数 */
  const nextBurstRef = useRef({ t: 0, n: 0 })
  /* 请求序号：A→B→A 时两个闭包里捕获的 i 相同，只靠下标判断会把过期结果当成有效。
     每次 play() 自增，异步回调只认自己那一号。 */
  const reqSeqRef = useRef(0)
  /* GD 完整源还在解析中：这段时间里「时长不足 65s」不能立刻降档，
     否则会跟解析结果抢着换源，来回抖。 */
  const gdPendingRef = useRef(false)

  const saveState = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          /* 存 id 而不是下标：曲库增删后下标会漂，id 不会 */
          id: PLAYLIST[idxRef.current]?.id,
          i: idxRef.current,
          t: a.currentTime || 0,
          v: volRef.current,
          sh: shuffleRef.current,
        }),
      )
    } catch {
      /* ignore */
    }
  }, [])

  const applyLrc = useCallback((txt: string) => {
    const lines = parseLrc(txt)
    lrcRef.current = lines
    setLrc(lines)
  }, [])

  const fetchMeta = useCallback(
    (i: number) => {
      const s = PLAYLIST[i]
      setLrc([])
      lrcRef.current = []
      activeLrcRef.current = -1
      setActiveLrc(-1)
      if (!s?.id) return
      /* 元数据接口没有超时也没有状态码检查：上游 502 时 r.json() 抛错被空 catch 吞掉，
         界面表现和「这首歌没有封面」一样，查起来毫无线索。 */
      fetchJSON(META_URL(s.id), 6000)
        .then((j) => {
          if (idxRef.current !== i) return
          const m = j && j[0]
          if (m?.pic) setCover(m.pic)
          if (m?.lrc) {
            const u: string = m.lrc
            if (lrcCacheRef.current[u]) applyLrc(lrcCacheRef.current[u])
            else
              fetchText(u, 6000)
                .then((txt) => {
                  /* 内层也要校验：上一首的歌词比它的音频先回来时，
                     不加这条就把 A 歌词糊到 B 歌头上 */
                  if (idxRef.current !== i) return
                  lrcCacheRef.current[u] = txt
                  applyLrc(txt)
                })
                .catch(() => {})
          }
        })
        .catch(() => {})
    },
    [applyLrc],
  )

  /* play() 被浏览器策略拒绝时给出可见提示（其余 abort 噪音忽略） */
  const playSafe = useCallback((a: HTMLAudioElement) => {
    a.play().catch((e) => {
      /* 不管哪种失败，缓冲点都要停——否则一个转圈的小点会一直挂在那儿 */
      setBuffering(false)
      if ((e as DOMException)?.name === 'NotAllowedError') setErr('浏览器拦截了自动播放，点一下播放键')
    })
  }, [])

  const play = useCallback(
    (i: number, seekTo = 0) => {
      if (i < 0 || i >= PLAYLIST.length) i = 0
      const a0 = audioRef.current
      /* 同一首重复点：在播就不动，暂停中就恢复——别重载直链把进度抖掉 */
      if (idxRef.current === i && a0?.src) {
        if (a0.paused) playSafe(a0)
        return
      }
      idxRef.current = i
      setIdx(i)
      setErr('')
      triesRef.current = 0
      lastDurRef.current = 0
      carriedTimeRef.current = 0
      const a = audioRef.current
      if (!a) return
      const track = PLAYLIST[i]
      const myReq = ++reqSeqRef.current
      /* 清掉上一首残留的进度/时长，别让新歌头两秒显示旧的百分比 */
      setTime(0)
      setDuration(0)
      /* 起点先记下：URL 到手、metadata 到了再 seek 才生效 */
      restoreTimeRef.current = seekTo
      setBuffering(true)

      /* 同步起播：先挂 meting 的 302 直链（一个普通 URL，拿得到就能立即 load）。
         GD Studio 走的是 JSONP，要在 <script> 回调里才拿到地址——
         那已经脱离了点击的用户激活上下文，首次播放会被自动播放策略拦掉。
         所以顺序反过来：先出声，再把音源无损升级到 GD 的完整 320k。 */
      srcTierRef.current = 1
      a.src = TRACK_URL(track.id)
      a.load()
      a.volume = volRef.current
      playSafe(a)

      gdPendingRef.current = true
      gdTrackUrl(track.id)
        .then((url) => {
          gdPendingRef.current = false
          if (myReq !== reqSeqRef.current) return /* 已经切到别的歌，这次结果作废 */
          if (srcTierRef.current === 2) return /* 已经退到网易兜底，别再折腾 */
          /* 升级到完整源，把已经走过的秒数带过去 */
          const wasPlaying = !a.paused
          carriedTimeRef.current = a.currentTime > 0.5 ? a.currentTime : 0
          srcTierRef.current = 0
          a.src = url
          a.load()
          if (wasPlaying) playSafe(a)
        })
        .catch(() => {
          gdPendingRef.current = false
          /* GD 拿不到就继续用 meting，onError 会再退网易，这里不用动 */
        })

      fetchMeta(i)
    },
    [fetchMeta, playSafe],
  )

  const next = useCallback(() => {
    /* 20 秒内连点五次「下一首」，一首都没让它唱完 */
    const now = Date.now()
    const burst = nextBurstRef.current
    if (now - burst.t > 20000) {
      burst.t = now
      burst.n = 1
    } else {
      burst.n += 1
      burst.t = now
    }
    if (burst.n >= 5) {
      burst.n = 0
      collectEgg('shuffle')
    }

    const n = PLAYLIST.length
    if (shuffleRef.current) {
      let j: number
      do {
        j = Math.floor(Math.random() * n)
      } while (j === idxRef.current && n > 1)
      play(j)
    } else {
      play((idxRef.current + 1 + n) % n)
    }
  }, [play])

  const prev = useCallback(() => {
    const a = audioRef.current
    if (a && a.currentTime > 3) {
      a.currentTime = 0
      return
    }
    play((idxRef.current - 1 + PLAYLIST.length) % PLAYLIST.length)
  }, [play])

  const toggle = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) {
      /* 有 src 就直接播；没有 src 才重新解析。
         用 getAttribute 而不是 a.src：三档源全废时我们 removeAttribute('src')
         把地址摘掉，此时读 a.src 会回落到文档地址（非空字符串），
         于是「重新解析」那条路永远走不到，只会对着坏地址反复 play()。
         readyState 也不能作为判据——刚挂上 src 还没加载时它本来就是 0。 */
      if (a.getAttribute('src')) playSafe(a)
      else play(idxRef.current >= 0 ? idxRef.current : 0, restoreTimeRef.current)
    } else {
      a.pause()
    }
  }, [play, playSafe])

  const onSeekTo = useCallback((ratio: number) => {
    const a = audioRef.current
    if (!a || !a.duration || !isFinite(a.duration)) return
    a.currentTime = Math.max(0, Math.min(1, ratio)) * a.duration
  }, [])

  /* 跳到绝对时间点：沉浸歌词里点某一行 */
  const seekToTime = useCallback((sec: number) => {
    const a = audioRef.current
    if (!a || !isFinite(sec) || sec < 0) return
    /* 试听源只有 30 秒，歌词却按完整版对齐：直接 seek 到越界位置会立刻 ended，
       表现成「点了后面某句歌词，直接跳到下一首」。夹在时长内，且留 0.3 秒余量。 */
    const dur = isFinite(a.duration) ? a.duration : 0
    a.currentTime = dur > 0 ? Math.min(sec, Math.max(0, dur - 0.3)) : sec
  }, [])

  const toggleShuffle = useCallback(() => {
    shuffleRef.current = !shuffleRef.current
    setShuffle(shuffleRef.current)
  }, [])

  const setVolSafe = useCallback((v: number) => {
    volRef.current = v
    setVol(v)
    if (audioRef.current) audioRef.current.volume = v
  }, [])

  /* 恢复持久化状态 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        /* JSON.parse 成功不等于形状对：null / 数组 / 字符串都会让下面的 o.v 抛错，
           整个播放器状态恢复被 catch 静默吞掉。先验对象再读字段。 */
        const parsed: unknown = JSON.parse(raw)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return
        const o = parsed as Record<string, unknown>
        if (typeof o.v === 'number' && o.v >= 0 && o.v <= 1) {
          volRef.current = o.v
          setVol(o.v)
        }
        if (typeof o.sh === 'boolean') {
          shuffleRef.current = o.sh
          setShuffle(o.sh)
        }
        /* 恢复：优先按 id 找（下标会随曲库增删漂移，老版本存的是 i） */
        const savedId = typeof o.id === 'number' ? o.id : null
        const byId = savedId != null ? PLAYLIST.findIndex((t) => t.id === savedId) : -1
        const restoreIdx = byId >= 0 ? byId : typeof o.i === 'number' && o.i >= 0 && o.i < PLAYLIST.length ? o.i : -1
        if (restoreIdx >= 0) {
          idxRef.current = restoreIdx
          setIdx(restoreIdx)
          /* 不设 src、不 load：GD 直链有时效，等用户点播放时再解析。
             进度先记进 restoreTimeRef，metadata 到达后由 onAudioLoadedMetadata 统一 seek。 */
          restoreTimeRef.current = typeof o.t === 'number' && Number.isFinite(o.t) && o.t > 0 ? o.t : 0
          const a = audioRef.current
          if (a) {
            a.preload = 'none'
            a.volume = volRef.current
          }
          fetchMeta(restoreIdx)
        }
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* 定时/离开页保存 */
  useEffect(() => {
    const onSave = () => saveState()
    window.addEventListener('pagehide', onSave)
    window.addEventListener('beforeunload', onSave)
    const t = window.setInterval(onSave, 5000)
    return () => {
      window.removeEventListener('pagehide', onSave)
      window.removeEventListener('beforeunload', onSave)
      window.clearInterval(t)
    }
  }, [saveState])

  /* open / full 同步 ref（键盘控制在两种模式都要生效） */
  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    fullRef.current = full
  }, [full])

  /* 点击面板外关闭 */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (openRef.current && !(e.target as HTMLElement).closest('.mplayer')) setOpen(false)
    }
    document.addEventListener('click', fn)
    return () => document.removeEventListener('click', fn)
  }, [])

  /* 键盘控制：空格播放/暂停，←→ 快进退 5s，↑↓ 音量（面板或沉浸歌词打开时生效） */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (!openRef.current && !fullRef.current) return
      const ae = document.activeElement
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || (ae as HTMLElement).isContentEditable)) return
      const a = audioRef.current
      if (!a) return
      const k = e.key
      if (k === ' ') {
        e.preventDefault()
        toggle()
      } else if (k === 'ArrowRight') {
        e.preventDefault()
        a.currentTime = Math.min(a.duration || 0, a.currentTime + 5)
      } else if (k === 'ArrowLeft') {
        e.preventDefault()
        a.currentTime = Math.max(0, a.currentTime - 5)
      } else if (k === 'ArrowUp') {
        e.preventDefault()
        setVolSafe(Math.min(1, volRef.current + 0.05))
      } else if (k === 'ArrowDown') {
        e.preventDefault()
        setVolSafe(Math.max(0, volRef.current - 0.05))
      }
    }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [toggle, setVolSafe])

  /* 歌词自动跟随：当前行滚到可视区中段 */
  useEffect(() => {
    if (tab !== 'lyrics' || activeLrc < 0) return
    const box = scrollRef.current
    const el = box?.querySelector<HTMLElement>('[data-lrc-active="true"]')
    if (!box || !el) return
    box.scrollTo({ top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2, behavior: 'smooth' })
  }, [activeLrc, tab])

  /* audio 元素事件处理器 */
  const swapSource = useCallback(() => {
    /* 0=GD Studio → 1=meting → 2=网易外链；三档用完就交错误提示 */
    const a = audioRef.current
    const s = idxRef.current >= 0 ? PLAYLIST[idxRef.current] : null
    if (!a || !s || triesRef.current >= 2) return false
    triesRef.current += 1
    /* 已播过的位置带去新源：换源不该让歌从头再来 */
    if (a.currentTime > 1) carriedTimeRef.current = a.currentTime
    if (srcTierRef.current === 0) {
      srcTierRef.current = 1
      a.src = TRACK_URL(s.id)
    } else if (srcTierRef.current === 1) {
      srcTierRef.current = 2
      a.src = NETEASE_URL(s.id)
    } else {
      return false
    }
    a.load()
    playSafe(a)
    return true
  }, [playSafe])

  const handlers = {
    onAudioPlay: () => {
      setPlaying(true)
      setBuffering(false)
    },
    onAudioPause: () => {
      setPlaying(false)
      setBuffering(false)
      saveState()
    },
    onAudioWaiting: () => setBuffering(true),
    onAudioCanPlay: () => setBuffering(false),
    onAudioTimeUpdate: (e: React.SyntheticEvent<HTMLAudioElement>) => {
      const a = e.currentTarget
      setTime(a.currentTime)
      if (isFinite(a.duration)) setDuration(a.duration)
      const la = findActiveLrc(lrcRef.current, a.currentTime, activeLrcRef.current)
      if (la !== activeLrcRef.current) {
        activeLrcRef.current = la
        setActiveLrc(la)
      }
      const now = Date.now()
      if (now - lastSaveRef.current > 2000) {
        lastSaveRef.current = now
        saveState()
      }
    },
    onAudioLoadedMetadata: (e: React.SyntheticEvent<HTMLAudioElement>) => {
      const a = e.currentTarget
      /* 起点恢复，优先级：换源携带的进度 > 用户上次听到的地方。
         末尾留 5 秒余量——seek 到末尾会立刻 ended，用户一恢复就被跳到下一首。 */
      const want = carriedTimeRef.current || restoreTimeRef.current
      const dur = isFinite(a.duration) && a.duration > 0 ? a.duration : 0
      /* 短源 = 疑似试听：这一趟只把进度夹在时长里，不消耗恢复点。
         原先不管长短都清零 restoreTimeRef，结果「上次听到 3:20」一遇到 30 秒试听
         就被永久改成 0:25，换到完整源后再也回不到原位置。 */
      const isPreview = dur > 0 && dur < 65
      carriedTimeRef.current = 0
      if (want > 0) {
        const safe = dur > 10 ? Math.min(want, dur - 5) : want
        try {
          a.currentTime = safe
        } catch {
          /* ignore */
        }
        if (!isPreview) restoreTimeRef.current = 0
      }
      /* 时长过短（<65s，疑似试听）→ 降档换源拿完整版。
         但若换源后的时长和上一源几乎一致，说明这就是完整长度（真短歌），别再来回换。
         GD 还在解析时先别动：那条线马上会把音源换成完整版。 */
      if (isPreview && !gdPendingRef.current) {
        const same = lastDurRef.current > 0 && Math.abs(dur - lastDurRef.current) < 1.5
        lastDurRef.current = dur
        if (!same) swapSource()
      } else if (!isPreview) {
        lastDurRef.current = 0
      }
    },
    onAudioEnded: (e: React.SyntheticEvent<HTMLAudioElement>) => {
      /* 暗语「十首」：真正播完一首才计，且按 id 去重 */
      const cur = PLAYLIST[idxRef.current]
      if (cur && e.currentTarget.currentTime > 60) {
        try {
          const raw = localStorage.getItem('embers_played_ids')
          const parsedIds: unknown = raw ? JSON.parse(raw) : []
          const ids: number[] = Array.isArray(parsedIds)
            ? parsedIds.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
            : []
          if (!ids.includes(cur.id)) {
            ids.push(cur.id)
            localStorage.setItem('embers_played_ids', JSON.stringify(ids))
            if (ids.length >= 10) collectEgg('playten')
          }
        } catch {
          /* ignore */
        }
      }
      const a = e.currentTarget
      /* 只在真的播到末尾、且还有更低一档源时才换；否则 next()。
         原先条件是「时长 < 65s 就换源」，一首 40 秒的真短歌会换源 → 重新播 → 又 ended，
         来回几轮才因为 triesRef 用完而前进。 */
      const atEnd = a.duration > 0 && a.currentTime >= a.duration - 1.5
      if (atEnd && a.duration < 65 && srcTierRef.current < 2) {
        if (swapSource()) return
      }
      next()
    },
    onAudioError: () => {
      /* 主源失败先自动切备用源，都失败才报错 */
      if (!swapSource()) {
        setErr('网络源暂不可用')
        setPlaying(false)
        setBuffering(false)
        /* 三档全废后必须把坏地址摘掉：否则 toggle() 只见 src 非空就重试同一个坏 URL，
           永远出不了声。摘掉之后 toggle() 会走「重新解析」那条路。 */
        const a = audioRef.current
        if (a) {
          a.removeAttribute('src')
          a.load()
        }
      }
    },
  }

  const cur = idx >= 0 ? PLAYLIST[idx] : null
  const pct = duration > 0 ? (time / duration) * 100 : 0
  const volPct = vol * 100

  /* 锁屏 / 通知栏媒体控制（MediaSession）：手机上锁屏也能看曲名、切歌 */
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    if (cur) {
      try {
        ms.metadata = new MediaMetadata({
          title: cur.t,
          artist: cur.a,
          album: '余烬 EMBERS',
          artwork: [{ src: cover || '/icon-512.png', sizes: '512x512', type: 'image/png' }],
        })
      } catch {
        /* ignore */
      }
    }
    ms.playbackState = playing ? 'playing' : 'paused'
  }, [cur, cover, playing])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    const set = (action: MediaSessionAction, fn: (() => void) | null) => {
      try {
        ms.setActionHandler(action, fn)
      } catch {
        /* 个别浏览器不支持某些 action */
      }
    }
    set('play', () => toggle())
    set('pause', () => toggle())
    set('previoustrack', () => prev())
    set('nexttrack', () => next())
    set('seekbackward', () => {
      const a = audioRef.current
      if (a) a.currentTime = Math.max(0, a.currentTime - 10)
    })
    set('seekforward', () => {
      const a = audioRef.current
      if (a) a.currentTime = Math.min(a.duration || 0, a.currentTime + 10)
    })
    return () => {
      set('play', null)
      set('pause', null)
      set('previoustrack', null)
      set('nexttrack', null)
      set('seekbackward', null)
      set('seekforward', null)
    }
  }, [toggle, prev, next])

  return {
    idx,
    playing,
    time,
    duration,
    vol,
    shuffle,
    open,
    full,
    tab,
    cover,
    lrc,
    activeLrc,
    err,
    buffering,
    cur,
    pct,
    volPct,
    audioRef,
    seekBarRef,
    scrollRef,
    setOpen,
    setFull,
    setTab,
    play,
    next,
    prev,
    toggle,
    onSeekTo,
    seekToTime,
    toggleShuffle,
    setVolSafe,
    handlers,
  }
}
