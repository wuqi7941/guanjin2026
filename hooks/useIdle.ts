'use client'

import { useEffect, useState } from 'react'

/* 静息检测：一段时间无任何输入（指针/键盘/滚动/触摸）后返回 true。
   页面不可见时不计入（人不在，不算发呆）。 */
export function useIdle(timeout = 15000) {
  const [idle, setIdle] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let lastEvent = 0

    const arm = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        if (document.visibilityState === 'visible') setIdle(true)
        else arm()
      }, timeout)
    }

    const onActivity = () => {
      const now = Date.now()
      if (now - lastEvent < 500) return
      lastEvent = now
      setIdle((v) => (v ? false : v))
      arm()
    }

    const events: (keyof WindowEventMap)[] = [
      'pointermove',
      'pointerdown',
      'keydown',
      'scroll',
      'wheel',
      'touchstart',
    ]
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))
    arm()
    return () => {
      if (timer) clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, onActivity))
    }
  }, [timeout])

  return idle
}
