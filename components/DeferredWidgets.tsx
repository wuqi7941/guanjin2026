'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

/* 首屏只保留「随时可能被按到」的搜索与播放器；
   三个无可见 UI 的组件（到访计数 / 彩蛋 / 墨点波纹）等浏览器空闲再挂。
   原来 hydration 后 5 个 dynamic chunk 一起抢主线程，是首屏发涩的主要来源。 */
const MusicPlayer = dynamic(() => import('./MusicPlayer').then((m) => m.MusicPlayer), { ssr: false })
const EasterEggs = dynamic(() => import('./EasterEggs').then((m) => m.EasterEggs), { ssr: false })
const EggTracker = dynamic(() => import('./EggTracker').then((m) => m.EggTracker), { ssr: false })
const InkRipple = dynamic(() => import('./InkRipple').then((m) => m.InkRipple), { ssr: false })
const SearchDialog = dynamic(() => import('./SearchDialog').then((m) => m.SearchDialog), { ssr: false })

export function DeferredWidgets() {
  const [idleReady, setIdleReady] = useState(false)

  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setIdleReady(true), { timeout: 2500 })
      return () => w.cancelIdleCallback?.(id)
    }
    const t = window.setTimeout(() => setIdleReady(true), 1200)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <>
      <SearchDialog />
      <MusicPlayer />
      {idleReady && (
        <>
          <EggTracker />
          <EasterEggs />
          <InkRipple />
        </>
      )}
    </>
  )
}
