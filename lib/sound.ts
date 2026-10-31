/* 共享 WebAudio：单例 AudioContext + 简单音色（钢琴、印章轻响等共用） */

let ctx: AudioContext | null = null

export function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!ctx) ctx = new Ctor()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/* 印章点亮的一声轻响（短促上行，带指数衰减） */
export function chime() {
  const c = getAudioCtx()
  if (!c) return
  try {
    const t = c.currentTime
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(880, t)
    o.frequency.exponentialRampToValueAtTime(1320, t + 0.18)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)
    o.connect(g)
    g.connect(c.destination)
    o.start(t)
    o.stop(t + 1)
  } catch {
    /* 无音频环境静默 */
  }
}
