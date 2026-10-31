'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { PLAYLIST, TRACK_URL, NETEASE_URL, META_URL } from '@/lib/playlist'
import { bumpCounter, collectEgg } from '@/lib/eggs'

const LS_KEY = 'embers_mp'

export interface LrcLine {
  t: number
  txt: string
}

function parseLrc(txt: string): LrcLine[] {
  const out: LrcLine[] = []
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/\[(\d+):(\d+)(?:\.(\d+))?\](.*)/)
    if (!m) continue
    const frac = m[3] || ''
    const t = parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + (frac ? parseInt(frac, 10) / Math.pow(10, frac.length) : 0)
    const text = m[4].trim()
    if (text) out.push({ t, txt: text })
  }
  out.sort((a, b) => a.t - b.t)
  return out
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
  /* 音源层级：0=网易官方外链（免费完整）/ 1=injahow 备用 / 2=gdstudio VIP 完整（JSONP） */
  const srcTierRef = useRef(0)
  /* 暗语「挑不出来」：连续切歌计数 */
  const nextBurstRef = useRef({ t: 0, n: 0 })

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
      fetch(META_URL(s.id))
        .then((r) => r.json())
        .then((j) => {
          if (idxRef.current !== i) return
          const m = j && j[0]
          if (m?.pic) setCover(m.pic)
          if (m?.lrc) {
            const u: string = m.lrc
            if (lrcCacheRef.current[u]) applyLrc(lrcCacheRef.current[u])
            else
              fetch(u)
                .then((r) => r.text())
                .then((txt) => {
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
      if ((e as DOMException)?.name === 'NotAllowedError') setErr('浏览器拦截了自动播放，点一下播放键')
    })
  }, [])

  const play = useCallback(
    (i: number) => {
      if (i < 0 || i >= PLAYLIST.length) i = 0
      idxRef.current = i
      setIdx(i)
      setErr('')
      triesRef.current = 0
      const a = audioRef.current
      if (!a) return
      const track = PLAYLIST[i]
      /* 实测：inj（meting 302）87/88 可播，网易外链只有 34/88。
         所以一律先取 inj，失败再退网易官方外链——不再按 v 字段分流。 */
      srcTierRef.current = 1
      a.src = TRACK_URL(track.id)
      a.load()
      a.volume = volRef.current
      playSafe(a)
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
      if (a.src) playSafe(a)
      else play(idxRef.current >= 0 ? idxRef.current : 0)
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
    a.currentTime = sec
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
        const o = JSON.parse(raw)
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
          const a = audioRef.current
          const track = PLAYLIST[restoreIdx]
          if (a) {
            srcTierRef.current = 1
            a.preload = 'none'
            a.src = TRACK_URL(track.id)
            a.volume = volRef.current
            /* 不立刻 load()：用户还没点播放，不该为一个后台恢复去拉流。
               位置要等 metadata 到了再 seek，否则会被忽略。 */
            const savedTime = o.t || 0
            if (savedTime > 0) {
              const onMeta = () => {
                try {
                  a.currentTime = savedTime
                } catch {
                  /* ignore */
                }
                a.removeEventListener('loadedmetadata', onMeta)
              }
              a.addEventListener('loadedmetadata', onMeta)
            }
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
    /* 首选 inj 挂了 → 退到网易官方外链再试一次；两边都废就交给错误提示 */
    const a = audioRef.current
    const s = idxRef.current >= 0 ? PLAYLIST[idxRef.current] : null
    if (!a || !s || srcTierRef.current === 2 || triesRef.current >= 2) return false
    triesRef.current += 1
    srcTierRef.current = 2
    a.src = NETEASE_URL(s.id)
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
      let la = -1
      for (let k = 0; k < lrcRef.current.length; k++) {
        if (a.currentTime >= lrcRef.current[k].t) la = k
        else break
      }
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
      /* 时长过短（<65s，疑似试听）→ 换源拿完整版 */
      const a = e.currentTarget
      if (isFinite(a.duration) && a.duration > 0 && a.duration < 65) {
        swapSource()
      }
    },
    onAudioEnded: (e: React.SyntheticEvent<HTMLAudioElement>) => {
      /* 暗语「十首」：真正播完一首才计，且按 id 去重 */
      const cur = PLAYLIST[idxRef.current]
      if (cur && e.currentTarget.currentTime > 60) {
        try {
          const raw = localStorage.getItem('embers_played_ids')
          const ids: number[] = raw ? JSON.parse(raw) : []
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
      if (a.duration && a.duration < 65) {
        if (swapSource()) return
      }
      next()
    },
    onAudioError: () => {
      /* 主源失败先自动切备用源，都失败才报错 */
      if (!swapSource()) {
        setErr('网络源暂不可用')
        setPlaying(false)
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
