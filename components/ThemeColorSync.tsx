'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'

const COLORS: Record<string, string> = {
  light: '#F2ECE1',
  dark: '#17130E',
}

/* 主题切换时同步移动端地址栏配色（meta theme-color）。
   默认主题是 system，所以必须看 resolvedTheme——用 theme 会拿到字符串 'system'，
   那样永远落到浅色分支，系统深色时地址栏和页面不是一个颜色。 */
export function ThemeColorSync() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!resolvedTheme) return
    const color = COLORS[resolvedTheme === 'dark' ? 'dark' : 'light']
    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'theme-color')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', color)
  }, [resolvedTheme])

  return null
}
