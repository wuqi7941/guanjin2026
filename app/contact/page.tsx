import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AuroraBackground } from '@/components/AuroraBackground'
import { ContactSection } from '@/components/ContactSection'

export const metadata = {
  title: '联系 — 余烬 EMBERS',
  description: '有项目、想法，或单纯想聊聊设计与技术，随时找观烬。',
}

/* 联系从首页搬出来成一页：首页不再一路滚到「保持联系」，
   入口只留导航栏的「04 联系」。 */
export default function ContactPage() {
  return (
    <main id="main-content" className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />
      <ContactSection />
      <Footer />
    </main>
  )
}
