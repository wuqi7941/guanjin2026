'use client'

import dynamic from 'next/dynamic'

/* 首屏不必需的浮层组件：hydration 后异步加载（音乐小球、彩蛋、墨点波纹等），
   把它们的 JS 从首屏关键路径上摘下来 */
const MusicPlayer = dynamic(() => import('./MusicPlayer').then((m) => m.MusicPlayer), { ssr: false })
const EasterEggs = dynamic(() => import('./EasterEggs').then((m) => m.EasterEggs), { ssr: false })
const EggTracker = dynamic(() => import('./EggTracker').then((m) => m.EggTracker), { ssr: false })
const InkRipple = dynamic(() => import('./InkRipple').then((m) => m.InkRipple), { ssr: false })
const SearchDialog = dynamic(() => import('./SearchDialog').then((m) => m.SearchDialog), { ssr: false })

export function DeferredWidgets() {
  return (
    <>
      <MusicPlayer />
      <EasterEggs />
      <EggTracker />
      <InkRipple />
      <SearchDialog />
    </>
  )
}
