'use client'

/* 离开页面的低语：切到别的页签 4 秒后，标题变成一句火的话；回来恢复。
   一个很小的「这个站是活的」信号。 */
import { useEffect } from 'react'

const AWAY_TITLE = '火还在烧——'

export function TitleWhisper() {
  useEffect(() => {
    const base = document.title
    let timer: ReturnType<typeof setTimeout> | undefined

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        timer = setTimeout(() => {
          document.title = AWAY_TITLE
        }, 4000)
      } else {
        if (timer) clearTimeout(timer)
        document.title = base
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      if (timer) clearTimeout(timer)
      document.title = base
    }
  }, [])

  return null
}
