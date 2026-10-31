'use client'

import { useEffect, useRef, useState } from 'react'
import { Headphones, Pause, Square } from 'lucide-react'

/* 念给我听：用浏览器自带的朗读（Web Speech）读正文。
   正文从 DOM 取纯文本，避免把 markdown 符号念出来；
   按句切分逐句排队，方便暂停/继续。只在「得意」的文章上出现。 */
export function ListenButton() {
  const [state, setState] = useState<'idle' | 'playing' | 'paused'>('idle')
  const [supported, setSupported] = useState(true)
  const queueRef = useRef<string[]>([])
  const idxRef = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false)
      return
    }
    return () => {
      try {
        window.speechSynthesis.cancel()
      } catch {
        /* ignore */
      }
    }
  }, [])

  if (!supported) return null

  const speakNext = () => {
    const synth = window.speechSynthesis
    if (idxRef.current >= queueRef.current.length) {
      setState('idle')
      idxRef.current = 0
      return
    }
    const line = queueRef.current[idxRef.current]
    const u = new SpeechSynthesisUtterance(line)
    u.lang = 'zh-CN'
    u.rate = 0.92
    u.pitch = 0.98
    u.onend = () => {
      idxRef.current += 1
      if (state !== 'paused') speakNext()
    }
    synth.speak(u)
  }

  const start = () => {
    const body = document.querySelector('.prose-custom') as HTMLElement | null
    const text = (body?.innerText ?? '').replace(/\s+/g, ' ').trim()
    if (!text) return
    queueRef.current = text
      .split(/(?<=[。！？…\n])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1)
    idxRef.current = 0
    setState('playing')
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
    speakNext()
  }

  const toggle = () => {
    const synth = window.speechSynthesis
    if (state === 'idle') {
      start()
      return
    }
    if (state === 'playing') {
      synth.pause()
      setState('paused')
    } else {
      synth.resume()
      setState('playing')
    }
  }

  const stop = () => {
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
    setState('idle')
    idxRef.current = 0
  }

  return (
    <span className="listen-btn-group">
      <button type="button" onClick={toggle} className={`listen-btn${state !== 'idle' ? ' is-on' : ''}`}>
        {state === 'playing' ? <Pause className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
        {state === 'idle' ? '念给我听' : state === 'playing' ? '先停一下' : '接着念'}
      </button>
      {state !== 'idle' && (
        <button type="button" onClick={stop} className="listen-btn listen-btn-stop" aria-label="停止朗读">
          <Square className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}
