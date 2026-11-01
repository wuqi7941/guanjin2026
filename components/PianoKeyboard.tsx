'use client'

import { EASE } from '@/lib/motion'
import { getAudioCtx } from '@/lib/sound'
import { collectEgg } from '@/lib/eggs'
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { m, useReducedMotion } from 'framer-motion'


/* 五声音阶：24 键从左到右上行（五声模式） */
const PENTA = [
  261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0,
  1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0, 2349.32, 2637.02, 3135.96,
  3520.0, 4186.01, 4698.64, 5274.04, 6271.93,
]

/* 标准钢琴音：C4 起 24 个半音（2 个八度，A4=440 等温律） */
const CHROMATIC = Array.from({ length: 24 }, (_, i) => 261.63 * Math.pow(2, i / 12))

/* 暗语「知音」：《小星星》的开头七个音 C C G G A A G
   （五声音阶与标准音阶都能按出来，所以按频率认，不按键位认） */
const TWINKLE = [261.63, 261.63, 392.0, 392.0, 440.0, 440.0, 392.0]

type Scale = 'penta' | 'std'

interface KeyGeom {
  kind: 'w' | 'b'
  idx: number
  x: number
  y: number
  w: number
  h: number
}

/* 钢琴音色：基频(triangle) + 泛音(sine) + 指数衰减，模拟真实琴声 */
function playNote(freq?: number) {
  if (!freq || typeof window === 'undefined') return
  const audioCtx = getAudioCtx()
  if (!audioCtx) return
  try {
    const t = audioCtx.currentTime
    const master = audioCtx.createGain()
    master.gain.setValueAtTime(0.0001, t)
    master.gain.exponentialRampToValueAtTime(0.2, t + 0.008)
    master.gain.exponentialRampToValueAtTime(0.0001, t + 2.0)
    master.connect(audioCtx.destination)
    const partials: Array<[number, number]> = [
      [1, 1],
      [2, 0.5],
      [3, 0.28],
      [4.2, 0.14],
      [5.4, 0.07],
    ]
    /* osc.stop 后浏览器会回收 osc/gain，但 master 不 disconnect 就永远挂在
       destination 上——滑过 24 键 = 24 个 master 堆积。最后一个泛音结束时拆链。 */
    let alive = partials.length
    for (const [ratio, amp] of partials) {
      const osc = audioCtx.createOscillator()
      osc.type = ratio === 1 ? 'triangle' : 'sine'
      osc.frequency.value = freq * ratio
      const g = audioCtx.createGain()
      g.gain.value = amp
      osc.connect(g)
      g.connect(master)
      osc.onended = () => {
        alive -= 1
        if (alive <= 0) master.disconnect()
      }
      osc.start(t)
      osc.stop(t + 2.1)
    }
  } catch {
    /* 忽略：无音频环境/被禁音时静默 */
  }
}

interface PianoKeyboardProps {
  variant?: 'hero' | 'full'
}

/* 键几何：hero=14 白+10 黑(440x500)；full=8 白+5 黑 一个八度大键(420x300) */
function buildKeys(variant: 'hero' | 'full'): { whites: KeyGeom[]; blacks: KeyGeom[]; viewBox: string } {
  if (variant === 'full') {
    const kw = 420 / 8
    const whites = Array.from({ length: 8 }, (_, i) => ({
      kind: 'w' as const,
      idx: i,
      x: i * kw,
      y: 130,
      w: kw,
      h: 140,
    }))
    const blacks = [1, 2, 4, 5, 6].map((i) => ({
      kind: 'b' as const,
      idx: i,
      x: i * kw - kw * 0.26,
      y: 130,
      w: kw * 0.58,
      h: 98,
    }))
    return { whites, blacks, viewBox: '0 0 420 300' }
  }
  const kw = 400 / 14
  const whites = Array.from({ length: 14 }, (_, i) => ({
    kind: 'w' as const,
    idx: i,
    x: 20 + i * kw,
    y: 352,
    w: kw,
    h: 88,
  }))
  const blacks = [1, 2, 4, 5, 6, 8, 9, 11, 12, 13].map((i) => ({
    kind: 'b' as const,
    idx: i,
    x: 20 - kw * 0.26 + (i + 0.72) * kw,
    y: 352,
    w: kw * 0.58,
    h: 62,
  }))
  return { whites, blacks, viewBox: '0 0 440 500' }
}

const ASH_RISE = [
  { x: 84, start: 338, amp: 132, dur: 5.4, delay: 0 },
  { x: 122, start: 336, amp: 108, dur: 6.2, delay: 1.1 },
  { x: 172, start: 340, amp: 140, dur: 5.1, delay: 2.2 },
  { x: 216, start: 334, amp: 118, dur: 6.6, delay: 0.6 },
  { x: 252, start: 338, amp: 126, dur: 5.8, delay: 1.7 },
  { x: 296, start: 336, amp: 110, dur: 6.4, delay: 0.3 },
  { x: 330, start: 340, amp: 134, dur: 5.5, delay: 1.4 },
  { x: 368, start: 336, amp: 104, dur: 6.1, delay: 2.5 },
]

export function PianoKeyboard({ variant = 'hero' }: PianoKeyboardProps) {
  const reduce = !!useReducedMotion()
  const full = variant === 'full'
  const [scale, setScale] = useState<Scale>('penta')
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [melodyLit, setMelodyLit] = useState(false)
  const glissRef = useRef({ active: false, last: '' })
  const rectRef = useRef<DOMRect | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const melodyRef = useRef<number[]>([])
  /* 彩蛋点亮动画的定时器：卸载时清理，避免 setState on unmounted */
  const melodyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const { whites, blacks, viewBox } = useMemo(() => buildKeys(variant), [variant])
  const vb = useMemo(() => viewBox.split(' ').map(Number), [viewBox])
  const keys = useMemo(() => [...whites, ...blacks].sort((a, b) => a.x - b.x), [whites, blacks])
  const noteMap = useMemo(() => {
    const n = keys.length
    const notes = scale === 'std' ? CHROMATIC.slice(0, n) : PENTA.slice(0, n)
    const m: Record<string, number> = {}
    keys.forEach((k, rank) => {
      m[`${k.kind}-${k.idx}`] = notes[rank]
    })
    return m
  }, [keys, scale])

  /* 注意：hitKey 必须稳定（useCallback），否则滑奏时每个 pointermove 的 setState
     都会重建 window 监听并全键盘重渲染 */
  const hitKey = useCallback(
    (clientX: number, clientY: number) => {
      const box = boxRef.current
      if (!box) return
      /* 滑奏期间复用按下时缓存的 rect，避免每次 pointermove 强制布局读 */
      const rect = rectRef.current ?? box.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const x = ((clientX - rect.left) / rect.width) * (vb[2] - vb[0]) + vb[0]
      const y = ((clientY - rect.top) / rect.height) * (vb[3] - vb[1]) + vb[1]
      let key: KeyGeom | null = null
      /* 黑键优先（绘制在上层） */
      for (const b of blacks) {
        if (y >= b.y && y <= b.y + b.h && x >= b.x && x <= b.x + b.w) {
          key = b
          break
        }
      }
      if (!key) {
        for (const w of whites) {
          if (y >= w.y && y <= w.y + w.h && x >= w.x && x <= w.x + w.w) {
            key = w
            break
          }
        }
      }
      if (!key) return
      const k = `${key.kind}-${key.idx}`
      if (k !== glissRef.current.last) {
        glissRef.current.last = k
        const freq = noteMap[k]
        playNote(freq)

        /* 暗语「知音」：弹出《小星星》开头七个音就点亮 */
        if (freq) {
          const seq = melodyRef.current
          seq.push(freq)
          if (seq.length > TWINKLE.length) seq.shift()
          if (seq.length === TWINKLE.length && seq.every((f, i) => Math.abs(f - TWINKLE[i]) < 2)) {
            melodyRef.current = []
            collectEgg('melody')
            setMelodyLit(true)
            if (melodyTimer.current) clearTimeout(melodyTimer.current)
            melodyTimer.current = setTimeout(() => setMelodyLit(false), 2600)
            window.dispatchEvent(new CustomEvent('embers-burst', { detail: 14 }))
          }
        }
      }
      setActiveKey((prev) => (prev === k ? prev : k))
    },
    [blacks, whites, vb, noteMap],
  )

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    glissRef.current.active = true
    glissRef.current.last = ''
    rectRef.current = boxRef.current?.getBoundingClientRect() ?? null
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* 某些浏览器/元素不支持 capture，靠 window 兜底 */
    }
    hitKey(e.clientX, e.clientY)
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (glissRef.current.active) hitKey(e.clientX, e.clientY)
  }
  const onUp = useCallback(() => {
    glissRef.current.active = false
    glissRef.current.last = ''
    rectRef.current = null
    setActiveKey(null)
  }, [])

  const glow = (key: KeyGeom) =>
    activeKey === `${key.kind}-${key.idx}` ? (
      <rect
        key={`g${key.kind}${key.idx}`}
        x={key.x}
        y={key.y}
        width={key.w}
        height={key.h}
        rx={2}
        fill="var(--accent)"
        opacity="0.3"
      />
    ) : null

  /* iOS 兜底：setPointerCapture 失效时仍能连续滑奏（window 级监听） */
  useEffect(() => {
    const onWinMove = (e: globalThis.PointerEvent) => {
      if (glissRef.current.active) hitKey(e.clientX, e.clientY)
    }
    const onWinUp = () => onUp()
    window.addEventListener('pointermove', onWinMove)
    window.addEventListener('pointerup', onWinUp)
    window.addEventListener('pointercancel', onWinUp)
    return () => {
      window.removeEventListener('pointermove', onWinMove)
      window.removeEventListener('pointerup', onWinUp)
      window.removeEventListener('pointercancel', onWinUp)
    }
  }, [hitKey, onUp])

  /* 彩蛋定时器：卸载时清掉，防止 setState on unmounted */
  useEffect(
    () => () => {
      if (melodyTimer.current) clearTimeout(melodyTimer.current)
    },
    [],
  )

  return (
    <div className={`relative w-full${melodyLit ? ' piano-lit' : ''}`} style={{ aspectRatio: full ? '420 / 300' : '440 / 500' }}>
      {/* 事件宿主：HTML 层（iOS pointer capture 可靠）+ 禁触摸滚动 */}
      <div
        ref={boxRef}
        className="absolute inset-0 z-10 cursor-pointer select-none"
        style={{ touchAction: 'none' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        aria-label={full ? '全屏钢琴，可点击或滑动弹奏' : '钢琴，可点击或滑动弹奏'}
        role="application"
      />
      <svg
        viewBox={viewBox}
        className="w-full h-auto select-none pointer-events-none"
        role="img"
        aria-label="琴键与余烬"
      >
        <defs>
          <radialGradient id="underlight" cx="0.5" cy="1" r="0.72">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.34" />
            <stop offset="0.45" stopColor="var(--accent)" stopOpacity="0.1" />
            <stop offset="1" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="key-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--surface-4)" />
            <stop offset="0.55" stopColor="var(--surface-2)" />
            <stop offset="1" stopColor="var(--surface-1)" />
          </linearGradient>
          <linearGradient id="black-key" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#241c15" />
            <stop offset="1" stopColor="#0d0a08" />
          </linearGradient>
        </defs>

        <rect x="20" y="252" width="400" height="216" fill="url(#underlight)" />

        {/* hero 变体：余烬粒子上升 */}
        {!full &&
          ASH_RISE.map((p, i) =>
            reduce ? (
              <circle key={i} cx={p.x} cy={p.start - p.amp * 0.5} r={1.8} fill="var(--accent)" opacity="0.5" />
            ) : (
              <m.g
                key={i}
                initial={{ y: 0 }}
                animate={{ y: [0, -p.amp, 0] }}
                transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                opacity={0.9}
              >
                <m.g
                  animate={{ opacity: [0.9, 0.12, 0.9] }}
                  transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                >
                  <circle cx={p.x} cy={p.start} r={1.9} fill="var(--accent)" />
                </m.g>
              </m.g>
            ),
          )}

        {/* 白键 */}
        {whites.map((k) => (
          <m.g
            key={`w${k.idx}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 + k.idx * (full ? 0.03 : 0.05), ease: EASE }}
          >
            <rect
              x={k.x}
              y={k.y}
              width={k.w}
              height={k.h}
              rx={2}
              fill="url(#key-fill)"
              stroke="var(--ink-muted)"
              strokeWidth="1"
            />
            {glow(k)}
          </m.g>
        ))}

        {/* 黑键 */}
        {blacks.map((k) => (
          <m.g
            key={`b${k.idx}`}
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 + k.idx * 0.04, ease: EASE }}
          >
            <rect
              x={k.x}
              y={k.y}
              width={k.w}
              height={k.h}
              rx={1.6}
              fill="url(#black-key)"
              stroke="var(--ink-subtle)"
              strokeWidth="1"
            />
            {glow(k)}
          </m.g>
        ))}

        {/* hero 变体：底部发光线 + 英文句 */}
        {!full && (
          <>
            <m.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
              d="M30 444 h380"
              stroke="var(--accent)"
              strokeWidth="1.4"
              fill="none"
              opacity="0.75"
            />
            <m.text
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              x="220"
              y="478"
              textAnchor="middle"
              fontSize="10.5"
              letterSpacing="2.6"
              fill="var(--ink-subtle)"
            >
              THE KEY NEVER CAME — SOMETIMES THE ASH PLAYS
            </m.text>
          </>
        )}
      </svg>

      {/* 音阶切换 */}
      <button
        type="button"
        onClick={() => setScale((s) => (s === 'std' ? 'penta' : 'std'))}
        aria-label={scale === 'std' ? '切换五声音阶' : '切换标准钢琴音'}
        title={scale === 'std' ? '五声音阶（不会按错）' : '标准钢琴音（音高更准）'}
        className="absolute top-2 left-2 z-20 inline-flex items-center gap-1 rounded-[3px] border border-[var(--hairline-strong)] bg-[var(--surface-1)]/95 shadow-sm px-2 py-1 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink)] backdrop-blur-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        {scale === 'std' ? '五声' : '标准'}
      </button>
    </div>
  )
}
