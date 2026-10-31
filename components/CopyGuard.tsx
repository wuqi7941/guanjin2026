'use client'

import { useEffect, useState } from 'react'
import { collectEgg } from '@/lib/eggs'

const UNLOCK_KEY = 'embers_unlocked'
export const UNLOCK_PHRASE = '观烬'

export function unlockCopy() {
  try {
    localStorage.setItem(UNLOCK_KEY, '1')
  } catch {
    /* ignore */
  }
  document.documentElement.classList.add('is-unlocked')
  window.dispatchEvent(new CustomEvent('embers-unlocked'))
}

export function isCopyUnlocked() {
  try {
    return localStorage.getItem(UNLOCK_KEY) === '1'
  } catch {
    return false
  }
}

/* 复制锁：未解锁时禁止右键、选中、复制、拖拽（输入框除外）。
   在搜索框里敲出「观烬」即解锁，并记住这台设备。
   注意：这只能挡住随手复制，挡不住开发者工具——浏览器总得把网页下载下来。 */
export function CopyGuard() {
  const [tip, setTip] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    if (isCopyUnlocked()) {
      root.classList.add('is-unlocked')
      return
    }

    let timer: number | undefined
    const showTip = () => {
      setTip(true)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setTip(false), 2800)
    }

    const locked = () => !document.documentElement.classList.contains('is-unlocked')
    const inField = (el: EventTarget | null) => {
      const t = el as HTMLElement | null
      return !!t && !!t.closest('input, textarea, select, [contenteditable="true"]')
    }

    const onContext = (e: MouseEvent) => {
      if (!locked() || inField(e.target)) return
      e.preventDefault()
      showTip()
    }
    const onSelect = (e: Event) => {
      if (!locked() || inField(e.target)) return
      e.preventDefault()
    }
    const onCopy = (e: Event) => {
      if (!locked() || inField(e.target)) return
      e.preventDefault()
      collectEgg('copy')
      console.log('%c你带走了它。', 'color:#c4634a;font-size:12px;')
      showTip()
    }
    const onDrag = (e: Event) => {
      if (!locked() || inField(e.target)) return
      e.preventDefault()
    }
    const onUnlocked = () => setTip(false)

    document.addEventListener('contextmenu', onContext)
    document.addEventListener('selectstart', onSelect)
    document.addEventListener('copy', onCopy)
    document.addEventListener('cut', onCopy)
    document.addEventListener('dragstart', onDrag)
    window.addEventListener('embers-unlocked', onUnlocked)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('contextmenu', onContext)
      document.removeEventListener('selectstart', onSelect)
      document.removeEventListener('copy', onCopy)
      document.removeEventListener('cut', onCopy)
      document.removeEventListener('dragstart', onDrag)
      window.removeEventListener('embers-unlocked', onUnlocked)
    }
  }, [])

  return tip ? (
    <div className="copy-tip" role="status">
      复制和右键被锁住了 —— 在搜索框里敲「观烬」可以解开
    </div>
  ) : null
}
