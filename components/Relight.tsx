'use client'

import { useEffect, useRef, useState } from 'react'

/* 404 小彩蛋：碰一碰这块炭 */
export function Relight() {
  const [lit, setLit] = useState(false)
  const [touched, setTouched] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const light = () => {
    setTouched(true)
    setLit(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setLit(false), 1800)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <button
      type="button"
      onClick={light}
      className="group mt-12 inline-flex flex-col items-center gap-3 select-none"
      aria-label="碰一碰这块炭"
    >
      <span className={'ember-dot' + (lit ? ' is-lit' : '')} aria-hidden />
      <span className="text-xs font-mono tracking-[0.18em] text-[var(--ink-tertiary)] group-hover:text-[var(--ink-subtle)] transition-colors">
        {lit ? '……你看，还热着。' : touched ? '再碰一碰？' : '碰一碰这块炭'}
      </span>
    </button>
  )
}
