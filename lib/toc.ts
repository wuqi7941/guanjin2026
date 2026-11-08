/* 标题 → 锚点 id。
   原实现不裁剪首尾连字符：`## 「离别」。` 会得到 `-离别-`，
   URL 里带着首尾横线，锚点又丑又容易在复制时丢掉。
   现在统一成「连续非文字字符压成一个 -，并裁掉首尾」。 */
export function slugifyHeading(text: string): string {
  return text
    .trim()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}
