import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AuroraBackground } from '@/components/AuroraBackground'
import { getAllPosts, toCard } from '@/lib/posts'

export const metadata = {
  title: '火的年轮 — 余烬 EMBERS',
  description: '按月份排开的一年：哪个月写得密，哪个月几乎熄了。',
  alternates: { canonical: '/timeline/' },
}

/* 火的年轮：把全部文章按月份排开（数量从 lib/posts.json 实时算，不要在注释里写死），柱子的长短就是那个月写了多少。
   没有花哨交互，只有时间和密度——这张图本身就是一个作品。 */
export default function TimelinePage() {
  const posts = getAllPosts().map(toCard)

  const byMonth = new Map<string, ReturnType<typeof toCard>[]>()
  for (const p of posts) {
    const key = p.date.slice(0, 7)
    if (!byMonth.has(key)) byMonth.set(key, [])
    byMonth.get(key)!.push(p)
  }
  const months = Array.from(byMonth.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  const max = Math.max(...months.map(([, list]) => list.length))

  return (
    <main id="main-content" className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />

      <section className="relative pt-28 md:pt-32 pb-24 px-6 overflow-hidden">
        <span className="poster-number" aria-hidden>N°005</span>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-5">
              <span className="w-8 h-[2px] bg-[var(--accent)]" />
              <span className="kicker">Rings · 火的年轮</span>
              <span className="hidden sm:block flex-1 h-px bg-[var(--hairline)]" aria-hidden />
              <span className="exhibit-meta tabular-nums">{posts.length} 篇 · {months.length} 个月</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em] text-[var(--ink)] mb-4">
              火的年轮
            </h1>
            <p className="text-lg text-[var(--ink-muted)] max-w-2xl">
              柱子有多长，那个月就烧得有多旺。熄着的月份也在上面——树记得每一年，哪怕那年只长了一点点。
            </p>
          </div>

          <ol className="rings-list">
            {months.map(([month, list]) => {
              const [y, m] = month.split('-')
              const width = Math.max(3, Math.round((list.length / max) * 100))
              return (
                <li key={month} className="rings-row">
                  <div className="rings-label">
                    <span className="rings-year">{y}</span>
                    <span className="rings-month">{m} 月</span>
                  </div>

                  <div className="rings-bar-wrap">
                    <span className="rings-bar" style={{ width: `${width}%` }} aria-hidden />
                    <span className="rings-count tabular-nums">{list.length} 篇</span>
                  </div>

                  <div className="rings-titles">
                    {list.slice(0, 10).map((p) => (
                      <Link key={p.slug} href={`/blog/${p.slug}/`} className="rings-title">
                        {p.title}
                      </Link>
                    ))}
                    {list.length > 10 && <span className="rings-more">…还有 {list.length - 10} 篇</span>}
                  </div>
                </li>
              )
            })}
          </ol>

          <p className="mt-12 text-sm leading-relaxed text-[var(--ink-tertiary)]">
            最早的一篇在 {months[months.length - 1]?.[0].replace('-', ' 年 ')} 月，最新的一篇在{' '}
            {months[0]?.[0].replace('-', ' 年 ')} 月。
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
