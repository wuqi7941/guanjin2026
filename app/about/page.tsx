import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AuroraBackground } from '@/components/AuroraBackground'
import { AboutSection } from '@/components/AboutSection'
import { ChangelogPanel } from '@/components/ChangelogPanel'

export const metadata = {
  title: '关于 — 余烬 EMBERS',
  description: '观烬是谁？十六岁的高中生、深夜的代码、一架在等的琴。关于「余烬 EMBERS」这个数字花园的一切。',
}

export default function AboutPage() {
  return (
    <main id="main-content" className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />
      <AboutSection />
      <div className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <ChangelogPanel />
        </div>
      </div>
      <Footer />
    </main>
  )
}