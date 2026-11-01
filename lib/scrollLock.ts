/* 全站滚动锁（引用计数）。
 *
 * 站里有四个地方会同时要求「锁住页面滚动」：搜索弹窗、播放器面板、沉浸歌词、
 * 首页钢琴全屏。它们原来各自 `prev = body.style.overflow; body.style.overflow='hidden'`
 * 再各自恢复——于是「A 开 → B 开 → A 关」时，A 的恢复把 B 的锁顶掉了：
 * 面板还开着，页面却可以滚。
 *
 * 这里改成计数：第一个锁的人记住原值，最后一个解锁的人还回去。
 * 返回值是幂等的解锁函数，重复调用只生效一次。
 */
let locks = 0
let prevOverflow = ''

export function lockScroll(): () => void {
  if (typeof document === 'undefined') return () => {}
  if (locks === 0) {
    prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  locks += 1

  let released = false
  return () => {
    if (released) return
    released = true
    locks = Math.max(0, locks - 1)
    if (locks === 0) document.body.style.overflow = prevOverflow
  }
}
