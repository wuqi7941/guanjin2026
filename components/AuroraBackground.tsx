'use client'

import { useEffect, useRef } from 'react'
import { m, useReducedMotion } from 'framer-motion'

/* 炭火余烬：远近两层火星粒子 + 尘埃层 + 呼吸光晕（sprite 缓存，低耗） */
export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduce = !!useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    /* 触屏/低端设备：降级 */
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const lowEnd = (navigator.hardwareConcurrency || 8) <= 4

    let animationId: number
    let width = 0
    let height = 0
    let running = true

    /* 预渲染光晕 sprite：一次生成，每帧只 drawImage，不再建渐变 */
    const spriteCache = new Map<number, HTMLCanvasElement>()
    const getSprite = (hue: number): HTMLCanvasElement => {
      let s = spriteCache.get(hue)
      if (s) return s
      s = document.createElement('canvas')
      s.width = 256
      s.height = 256
      const g = s.getContext('2d')!
      const r = 128
      const grad = g.createRadialGradient(128, 128, 0, 128, 128, r)
      grad.addColorStop(0, `hsla(${hue}, 68%, 46%, 0.75)`)
      grad.addColorStop(0.55, `hsla(${hue}, 64%, 40%, 0.32)`)
      grad.addColorStop(1, 'transparent')
      g.fillStyle = grad
      g.fillRect(0, 0, 256, 256)
      spriteCache.set(hue, s)
      return s
    }

    /* 近层：大而亮的火星（数量少） */
    let embers: Array<{
      x: number
      y: number
      vx: number
      vy: number
      r: number
      hue: number
      phase: number
    }> = []
    /* 远层：小而暗的尘埃 */
    let dust: Array<{
      x: number
      y: number
      vx: number
      vy: number
      r: number
      phase: number
    }> = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      init()
    }

    const init = () => {
      /* 粒子密度：高端桌面 1x，触屏/低端减半或更少 */
      const scale = coarse ? (lowEnd ? 0.3 : 0.5) : lowEnd ? 0.6 : 1
      const density = width * height
      const emberCount = Math.max(3, Math.round(Math.min(9, density / 160000) * scale))
      const dustCount = Math.max(4, Math.round(Math.min(22, density / 52000) * scale))
      embers = []
      dust = []
      for (let i = 0; i < emberCount; i++) {
        embers.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.14,
          vy: (Math.random() - 0.5) * 0.14,
          r: Math.random() * 130 + 70,
          hue: 8 + Math.floor(Math.random() * 10),
          phase: Math.random() * Math.PI * 2,
        })
      }
      for (let i = 0; i < dustCount; i++) {
        dust.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.05,
          vy: (Math.random() - 0.5) * 0.05 - 0.02,
          r: Math.random() * 42 + 14,
          phase: Math.random() * Math.PI * 2,
        })
      }
    }

    const drawSpr = (
      sprite: HTMLCanvasElement,
      x: number,
      y: number,
      r: number,
      alpha: number
    ) => {
      ctx.globalAlpha = alpha
      ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2)
    }

    const animate = () => {
      if (!running) return

      /* 滚动中：背景粒子不随视口变化，暂停绘制省 CPU（停止后自动恢复） */
      if (document.documentElement.classList.contains('scrolling')) {
        animationId = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'

      /* 远层尘埃 */
      dust.forEach((p) => {
        p.phase += 0.002
        p.x += p.vx
        p.y += p.vy
        if (p.y < -p.r) p.y = height + p.r
        if (p.y > height + p.r) p.y = -p.r
        if (p.x < -p.r) p.x = width + p.r
        if (p.x > width + p.r) p.x = -p.r
        const o = 0.038 + Math.sin(p.phase) * 0.02
        drawSpr(getSprite(24), p.x, p.y, p.r, o)
      })

      /* 近层火星 */
      embers.forEach((p, i) => {
        if (i % 2 !== 0) return
        p.phase += 0.0028
        p.x += p.vx
        p.y += p.vy
        if (p.x < -p.r) p.x = width + p.r
        if (p.x > width + p.r) p.x = -p.r
        if (p.y < -p.r) p.y = height + p.r
        if (p.y > height + p.r) p.y = -p.r
        const o = 0.09 + Math.sin(p.phase) * 0.035
        drawSpr(getSprite(p.hue), p.x, p.y, p.r, o)
      })

      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1

      animationId = requestAnimationFrame(animate)
    }

    const onVisibility = () => {
      running = document.visibilityState === 'visible'
      if (running) {
        cancelAnimationFrame(animationId)
        animationId = requestAnimationFrame(animate)
      }
    }

    resize()
    animationId = requestAnimationFrame(animate)

    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      spriteCache.clear()
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 embers-bg" />
      {/* 顶层呼吸光晕：纯 CSS opacity，零布局开销（减动时保持静止） */}
      <m.div
        initial={{ opacity: 0.5 }}
        animate={reduce ? { opacity: 0.7 } : { opacity: [0.5, 0.85, 0.5] }}
        transition={reduce ? { duration: 0 } : { duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[70vw] h-[70vh]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(158, 59, 46, 0.05), transparent 70%)',
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full embers-canvas mix-blend-screen"
      />
      <div className="absolute inset-0 grid-overlay" />
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 1.5 }}
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--canvas)]"
      />
    </div>
  )
}