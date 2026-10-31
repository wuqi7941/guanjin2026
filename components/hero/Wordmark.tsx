'use client'

import { EASE } from '@/lib/motion'
import { m } from 'framer-motion'

/* 活字标题：逐字落下，每字自带倾角与高低（像手工活字排出来的） */

const NAME = '观烬'
const NAME_TILTS = [-1.4, 0.9]
const NAME_Y = [2, -3]
const EMBERS_WORD = 'EMBERS'
const EMBERS_TILTS = [1.0, -0.8, 0.6, -1.0, 0.8, -0.6]
const EMBERS_Y = [1, -2, 1.5, -1, 2, -1.5]

export function HeroWordmark() {
  return (
    <>
      <span className="font-display block text-[11vw] sm:text-8xl lg:text-[7rem] font-bold leading-[1.02] text-[var(--ink)]">
        {NAME.split('').map((ch, i) => (
          <m.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, y: 36, rotate: NAME_TILTS[i] * 3 }}
            animate={{ opacity: 1, y: NAME_Y[i], rotate: NAME_TILTS[i] }}
            transition={{ duration: 0.95, delay: 0.14 + i * 0.11, ease: EASE }}
          >
            {ch}
          </m.span>
        ))}
      </span>
      <span className="hero-ember block mt-4 text-3xl sm:text-5xl lg:text-[4.5rem] font-light tracking-[0.24em] leading-none">
        {EMBERS_WORD.split('').map((ch, i) => (
          <m.span
            key={i}
            className="inline-block"
            style={{ marginRight: i < EMBERS_WORD.length - 1 ? '0.24em' : 0 }}
            initial={{ opacity: 0, y: 18, rotate: EMBERS_TILTS[i] * 2.5 }}
            animate={{ opacity: 1, y: EMBERS_Y[i], rotate: EMBERS_TILTS[i] }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.055, ease: EASE }}
          >
            {ch}
          </m.span>
        ))}
      </span>
    </>
  )
}
