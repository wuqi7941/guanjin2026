import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AuroraBackground } from '@/components/AuroraBackground'
import { EggBook } from '@/components/EggBook'

export const metadata = {
  title: '暗语全册 — 余烬 EMBERS',
  description: '全部暗语的触发方式。这一页不在导航里，只有在搜索框敲「观烬」才到得了。',
}

export default function EggsPage() {
  return (
    <main id="main-content" className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />

      <section className="relative pt-28 md:pt-32 pb-24 px-6 overflow-hidden">
        <span className="poster-number" aria-hidden>N°012</span>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-5">
              <span className="w-8 h-[2px] bg-[var(--accent)]" />
              <span className="kicker">Hidden · 暗语</span>
              <span className="hidden sm:block flex-1 h-px bg-[var(--hairline)]" aria-hidden />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em] text-[var(--ink)] mb-4">
              暗语全册
            </h1>
            <p className="text-lg text-[var(--ink-muted)] max-w-2xl">
              都藏在这座园子里。这一页不在任何导航里——只有知道在搜索框敲「观烬」的人才到得了。
            </p>
          </div>

          <EggBook />

          <p className="mt-12 text-sm leading-relaxed text-[var(--ink-tertiary)]">
            点亮状态只记在这台设备的 localStorage 里，清缓存就归零。页脚那本收集册读的是同一份数据。
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
