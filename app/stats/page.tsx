import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AuroraBackground } from '@/components/AuroraBackground'
import { StatsClient } from '@/components/StatsClient'

/* 隐藏页：不在导航、不进 sitemap、robots 里 disallow，也不写触发方式。
   只有知道暗门的人到得了。 */
export const metadata = {
  title: '来过的人 — 余烬 EMBERS',
  description: '一串不记名字的脚印。',
  robots: { index: false, follow: false },
}

export default function StatsPage() {
  return (
    <main id="main-content" className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />

      <section className="relative pt-28 md:pt-32 pb-20 px-6">
        <span className="poster-number" aria-hidden>
          N°010
        </span>
        <div className="max-w-3xl mx-auto relative z-10">
          <header className="mb-12">
            <span className="kicker flex items-center gap-3 mb-4 text-[var(--ink-subtle)]">
              <span className="w-8 h-[2px] bg-[var(--accent)]" />
              VISITS
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.02em] text-[var(--ink)]">
              来过的人
            </h1>
            <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-[var(--ink-subtle)] max-w-[52ch]">
              每一次点进来，都记一笔。不记名字，不记来处，只记得有人来过。
            </p>
          </header>

          <StatsClient />
        </div>
      </section>

      <Footer />
    </main>
  )
}
