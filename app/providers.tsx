'use client'

import { ThemeProvider } from 'next-themes'
import { LazyMotion, domMax, MotionConfig } from 'framer-motion'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        {/* 2026-11 改动：defaultTheme 从写死的 "light" 改成 "system"。
            纸墨的暗色是一整夜墨纸 + 朱印，本来就该跟着系统走；
            写死浅色等于替读者做了选择，也是「暗色默认」这条基线一直被违反的原因。
            想固定某一档的人，右上角切换器里选一次就记在 localStorage。 */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          themes={['light', 'dark']}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
