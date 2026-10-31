/* 全站统一动画常量：缓动曲线（framer-motion transition 使用） */

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
/* 更安静的入场：先快后慢，用于内容浮现与面板滑入 */
export const EASE_QUIET: [number, number, number, number] = [0.16, 1, 0.3, 1]
/* 出场（ease-in 方向）：墨染铺满 */
export const EASE_IN: [number, number, number, number] = [0.55, 0, 0.55, 0.2]
/* 入场（ease-out 方向）：墨染揭开 */
export const EASE_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1]
