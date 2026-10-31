'use client'

import { ThemeProvider } from 'next-themes'
import { LazyMotion, domMax, MotionConfig } from 'framer-motion'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
