'use client'

import { useCallback, useEffect, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { collectEgg } from '@/lib/eggs'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

const LEAF_COLORS = ['#9e3b2e', '#b14a36', '#c4634a', '#d67c5e', '#7e2f22', '#8f3d2c']

interface Leaf {
  id: number
  left: number
  delay: number
  duration: number
  startRotate: number
  scale: number
  color: string
  swing: number
}

let leafSeq = 0

function makeLeaves(count: number): Leaf[] {
  return Array.from({ length: count }, () => ({
    id: ++leafSeq,
    left: 2 + Math.random() * 96,
    delay: Math.random() * 1.5,
    duration: 4.5 + Math.random() * 4,
    startRotate: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.9,
    color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
    swing: 10 + Math.random() * 16,
  }))
}

function LeafSVG({ color }: { color: string }) {
  return (
    <svg width="26" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 1.5 L13.5 6.5 L19 5 L15.5 9.5 L21.5 11.5 L15.5 12.5 L17.5 19 L12 15.5 L6.5 19 L8.5 12.5 L2.5 11.5 L8.5 9.5 L5 5 L10.5 6.5 Z"
        fill={color}
      />
      <line x1="12" y1="15.5" x2="12" y2="22.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function EasterEggs() {
  const [leaves, setLeaves] = useState<Leaf[]>([])

  /* 叶子总量上限：连续 burst（48+26+18…）会一直累加 DOM；页面隐藏时 framer 动画暂停、
     onAnimationComplete 不触发，旧叶子永远不掉光。超限就从最老的开始挤掉。 */
  const MAX_LEAVES = 60

  const burst = useCallback((count: number) => {
    setLeaves((prev) => {
      const next = [...prev, ...makeLeaves(count)]
      return next.length > MAX_LEAVES ? next.slice(next.length - MAX_LEAVES) : next
    })
  }, [])

  useEffect(() => {
    const ascii = [
      '███╗░░░███╗███████╗███╗░░░███╗██████╗░███████╗██████╗░░██████╗',
      '████╗░████║██╔════╝████╗░████║██╔══██╗██╔════╝██╔══██╗██╔════╝',
      '██╔████╔██║█████╗░░██╔████╔██║██████╔╝█████╗░░██████╔╝╚█████╗░',
      '██║╚██╔╝██║██╔══╝░░██║╚██╔╝██║██╔══██╗██╔══╝░░██╔══██╗░╚═══██╗',
      '██║░╚═╝░██║███████╗██║░╚═╝░██║██║░░██║███████╗██║░░██║██████╔╝',
      '╚═╝░░░░░╚═╝╚══════╝╚═╝░░░░░╚═╝╚═╝░░╚═╝╚══════╝╚═╝░░╚═╝╚═════╝░',
    ].join('\n')
    console.log(`%c${ascii}`, 'color:#c4634a;font-weight:bold;font-size:11px;line-height:1.2')
    console.log('%c观烬 · 余烬 EMBERS — 数字花园', 'color:#a1a1aa;font-size:12px;')
    console.log('%c没有烧完的火，就还在烧。', 'color:#71717a;font-size:11px;')
    console.log('%c试试 ↑↑↓↓←→←→BA，或者连点左上角的「余烬」。', 'color:#52525b;font-size:11px;')

    let seq = 0
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (k === KONAMI[seq]) {
        seq += 1
        if (seq === KONAMI.length) {
          seq = 0
          burst(48)
          collectEgg('konami')
          console.log('%c🍁 你唤醒了枫林。', 'color:#c4634a;font-size:12px;')
        }
      } else {
        seq = k === KONAMI[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKey)

    /* 外部触发的叶子雨（如打字机触发词）：window.dispatchEvent(new CustomEvent('embers-burst', { detail: 20 })) */
    const onBurst = (e: Event) => {
      const n = (e as CustomEvent<number>).detail
      burst(typeof n === 'number' && n > 0 ? n : 18)
    }
    window.addEventListener('embers-burst', onBurst)

    let clicks = 0
    const onLogo = () => {
      clicks += 1
      if (clicks >= 5) {
        clicks = 0
        burst(26)
        collectEgg('logo')
        console.log('%c🔥 余烬没有熄灭。', 'color:#c4634a;font-size:12px;')
      }
    }
    window.addEventListener('embers-logo-click', onLogo)

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('embers-burst', onBurst)
      window.removeEventListener('embers-logo-click', onLogo)
    }
  }, [burst])

  const removeLeaf = useCallback((id: number) => {
    setLeaves((prev) => prev.filter((l) => l.id !== id))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden" aria-hidden>
      <AnimatePresence>
        {leaves.map((leaf) => (
          <m.div
            key={leaf.id}
            initial={{ y: -90, x: 0, rotate: leaf.startRotate, opacity: 1 }}
            animate={{ y: '112vh', rotate: leaf.startRotate + leaf.swing * 5, opacity: [1, 1, 1, 0.55, 0] }}
            transition={{ duration: leaf.duration, delay: leaf.delay, ease: 'linear' }}
            onAnimationComplete={() => removeLeaf(leaf.id)}
            style={{ position: 'absolute', top: 0, left: `${leaf.left}%` }}
          >
            <m.div
              animate={{ rotate: [0, leaf.swing, -leaf.swing, leaf.swing, 0] }}
              transition={{ duration: leaf.duration * 0.55, repeat: Infinity, ease: 'easeInOut' }}
              style={{ scale: leaf.scale }}
            >
              <LeafSVG color={leaf.color} />
            </m.div>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
