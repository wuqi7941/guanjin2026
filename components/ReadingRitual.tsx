'use client'

import { useState } from 'react'
import { useInView } from '@/hooks/useInView'
import { APHORISMS } from '@/lib/copy'

export function ReadingRitual() {
  const [line] = useState(() => APHORISMS[Math.floor(Math.random() * APHORISMS.length)])
  const { ref, inView: done } = useInView<HTMLDivElement>({ once: true, threshold: 0.6 })

  return (
    <div ref={ref} className="mt-10 flex flex-col items-center gap-4 text-center select-none">
      {done && (
        <>
          <p className="font-display italic text-[var(--ink-subtle)] text-lg leading-relaxed">{line}</p>
          <span className="seal-stamp is-double" aria-hidden>
            读毕
          </span>
        </>
      )}
    </div>
  )
}
