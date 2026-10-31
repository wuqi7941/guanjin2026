'use client'

import Link from 'next/link'

interface Item {
  text: string
  title: string
  slug: string
}

/* 正在展出：一条慢慢往左流的摘句带。
   不重复下方卡片的标题——这里流的是正文里的一句话，读完想看原文就点它。
   两倍长度首尾相接，鼠标停上去暂停，减少动效时静止。 */
export function ExhibitMarquee({ items }: { items: Item[] }) {
  if (!items.length) return null
  const loop = [...items, ...items]

  return (
    <section className="marquee-band" aria-label="正在展出的一句话">
      <span className="marquee-label">正在展出</span>
      <div className="marquee-viewport">
        <div className="marquee-track">
          {loop.map((item, i) => (
            <Link
              key={`${item.slug}-${i}`}
              href={`/blog/${item.slug}/`}
              className="marquee-item"
              /* 循环带是同一段内容放两遍接成龙：第二遍对读屏隐藏，别念两次 */
              aria-hidden={i >= items.length || undefined}
              tabIndex={i >= items.length ? -1 : undefined}
            >
              <span className="marquee-quote" aria-hidden>
                「
              </span>
              <span className="marquee-title">{item.text.replace(/[。！？]$/, '')}</span>
              <span className="marquee-quote" aria-hidden>
                」
              </span>
              <span className="marquee-tag">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
