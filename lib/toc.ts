export function slugifyHeading(text: string): string {
  return text.trim().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
}
