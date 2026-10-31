'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'

const COLORS: Record<string, string> = {
  light: '#F2ECE1',
  dark: '#17130E',
}

/* 主题切换时同步移动端地址栏配色（meta theme-color） */
export function ThemeColorSync() {
  const { theme } = useTheme()

  useEffect(() => {
    const color = COLORS[theme === 'dark' ? 'dark' : 'light']
    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'theme-color')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', color)
  }, [theme])

  return null
}
