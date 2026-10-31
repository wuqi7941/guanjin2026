import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AuroraBackground } from '@/components/AuroraBackground'
import { Relight } from '@/components/Relight'
import { EggOnMount } from '@/components/EggOnMount'

export default function NotFound() {
  return (
    <main id="main-content" className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />

      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <span className="poster-number" aria-hidden>N°404</span>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <p className="font-mono text-sm tracking-[0.3em] text-[var(--ink-subtle)] mb-8">
            ERROR · 404
          </p>
          <h1 className="text-7xl sm:text-8xl font-semibold tracking-[-0.04em] text-[var(--ink)] mb-6">
            这一页
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--sun-a)] via-[var(--accent)] to-[var(--sun-b)]">
              烧完了
            </span>
          </h1>
          <p className="text-lg text-[var(--ink-subtle)] mb-4">
            像炉膛里最后一块炭，它已经凉透了。
          </p>
          <p className="text-sm text-[var(--ink-tertiary)] mb-12">
            别伤心，火只是挪了个地方。回首页，或去展馆里走走，那里还亮着。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/" className="btn-primary px-8 py-3.5 text-[15px] font-medium">
              回到首页
            </Link>
            <Link href="/blog/" className="btn-secondary px-8 py-3.5 text-[15px] font-medium">
              浏览文章
            </Link>
          </div>
          <Relight />
        </div>
      </section>

      <EggOnMount egg="lost" />
      <Footer />
    </main>
  )
}
