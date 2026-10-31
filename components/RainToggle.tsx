'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CloudRain } from 'lucide-react'
import { getAudioCtx } from '@/lib/sound'

/* 雨声开关：不用音频文件——白噪声过低通，再叠一层缓慢起伏，
   就是雨落在纸上的声音。默认关，只在文章页出现。 */
export function RainToggle() {
  const [on, setOn] = useState(false)
  const nodesRef = useRef<{ src: AudioBufferSourceNode; gain: GainNode; lfo?: OscillatorNode } | null>(null)

  const stop = useCallback(() => {
    const n = nodesRef.current
    if (!n) return
    try {
      n.src.stop()
      n.lfo?.stop()
    } catch {
      /* ignore */
    }
    n.gain.disconnect()
    nodesRef.current = null
  }, [])

  useEffect(() => () => stop(), [stop])

  const start = () => {
    const ctx = getAudioCtx()
    if (!ctx) return

    /* 2 秒白噪声，循环播放 */
    const seconds = 2
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.loop = true

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1400
    lp.Q.value = 0.4

    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 220

    const gain = ctx.createGain()
    gain.gain.value = 0
    gain.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 1.2)

    /* 极慢的呼吸，让雨别太机械 */
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 0.07
    lfoGain.gain.value = 0.025
    lfo.connect(lfoGain)
    lfoGain.connect(gain.gain)

    src.connect(hp)
    hp.connect(lp)
    lp.connect(gain)
    gain.connect(ctx.destination)

    src.start()
    lfo.start()
    nodesRef.current = { src, gain, lfo }
    ;(window as unknown as Record<string, unknown>).__embersRain = true
    ;(window as unknown as Record<string, unknown>).__embersRainStop = () => {
      stop()
      setOn(false)
    }
  }

  const toggle = () => {
    if (on) {
      stop()
      setOn(false)
      ;(window as unknown as Record<string, unknown>).__embersRain = false
    } else {
      start()
      setOn(true)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`listen-btn${on ? ' is-on' : ''}`}
      aria-pressed={on}
      title={on ? '关掉雨声' : '下雨'}
    >
      <CloudRain className="w-3.5 h-3.5" />
      {on ? '雨在落' : '下雨'}
    </button>
  )
}
