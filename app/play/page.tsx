import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AuroraBackground } from '@/components/AuroraBackground'
import { PlayHub } from '@/components/play/PlayHub'
import Link from 'next/link'

export const metadata = {
  title: '试金石 — 余烬 EMBERS',
  description: '观烬的站内小测试：十六型 MBTI 正经测、你是哪种火快测。纯前端，答案不上传。',
  alternates: { canonical: '/play/' },
}

export default function PlayPage() {
  return (
    <main id="main-content" className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />

      <section className="relative pt-28 md:pt-32 pb-20 px-6">
        <span className="poster-number" aria-hidden>
          N°009
        </span>
        <div className="max-w-5xl mx-auto relative z-10">
          <header className="mb-12">
            <span className="kicker flex items-center gap-3 mb-4 text-[var(--ink-subtle)]">
              <span className="w-8 h-[2px] bg-[var(--accent)]" />
              TOUCHSTONE
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.02em] text-[var(--ink)]">
              试金石
            </h1>
            <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-[var(--ink-subtle)] max-w-[52ch]">
              石头碰石头，才知道彼此是什么质地。这里放几个小测试——认真做的和闹着玩的都有。
              结果只在你的浏览器里，想留下就自己复制。
            </p>
            <p className="mt-3 text-xs text-[var(--ink-tertiary)]">
              还想玩别的？去{' '}
              <Link href="/blog/" className="text-[var(--accent)] hover:underline underline-offset-4">
                文章库
              </Link>{' '}
              翻翻，两千多个答案都在那儿。
            </p>
          </header>

          <PlayHub />
        </div>
      </section>

      <Footer />
    </main>
  )
}
