'use client'

import { EASE } from '@/lib/motion'
import { useTheme } from 'next-themes'
import { m, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full card flex items-center justify-center">
        <span className="sr-only">加载主题切换</span>
      </div>
    )
  }

  const isDark = theme === 'dark'

  return (
    <m.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-10 h-10 rounded-full card flex items-center justify-center overflow-hidden"
      aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <m.div
            key="sun"
            initial={{ y: -20, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <Sun className="w-4 h-4 text-[var(--accent)]" />
          </m.div>
        ) : (
          <m.div
            key="moon"
            initial={{ y: -20, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <Moon className="w-4 h-4 text-[var(--ink-muted)]" />
          </m.div>
        )}
      </AnimatePresence>
    </m.button>
  )
}
