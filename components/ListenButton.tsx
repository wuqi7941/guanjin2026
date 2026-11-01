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
  /* 语音回调是异步的，闭包里读 state 会拿到旧值：改用 ref 同步一份 */
  const stateRef = useRef<'idle' | 'playing' | 'paused'>('idle')
  /* 朗读代数：每次 start / stop 加一，旧 utterance 的 onend 一看到代数变了就作废 */
  const genRef = useRef(0)
  const setPhase = (s: 'idle' | 'playing' | 'paused') => {
    stateRef.current = s
    setState(s)
  }

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
      setPhase('idle')
      idxRef.current = 0
      return
    }
    const line = queueRef.current[idxRef.current]
    const u = new SpeechSynthesisUtterance(line)
    u.lang = 'zh-CN'
    u.rate = 0.92
    u.pitch = 0.98
    const gen = genRef.current
    u.onend = () => {
      /* 两重保险：代数变了（stop / 重新开始）说明这条已作废，直接丢弃。
         否则 cancel() 触发的 onend 会把整段从头再念一遍。 */
      if (gen !== genRef.current) return
      idxRef.current += 1
      if (stateRef.current === 'playing') speakNext()
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
    genRef.current += 1
    setPhase('playing')
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
      setPhase('paused')
    } else {
      synth.resume()
      setPhase('playing')
    }
  }

  const stop = () => {
    genRef.current += 1
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
    /* 必须走 setPhase：只调 setState 的话 stateRef 还停在 'playing'，
       cancel() 触发的 onend 会继续 speakNext() —— 点"停止"反而接着念下一句 */
    setPhase('idle')
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
