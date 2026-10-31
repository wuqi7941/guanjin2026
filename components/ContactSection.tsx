'use client'

import { EASE } from '@/lib/motion'
import { m } from 'framer-motion'
import Image from 'next/image'
import { Phone, Mail, MapPin } from 'lucide-react'

export function ContactSection() {
  return (
    <section id="contact" className="relative py-28 px-6">
      <span className="poster-number" aria-hidden>N°004</span>
      <div className="max-w-5xl mx-auto relative z-10">
        <m.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-16"
        >
          <span className="flex items-center gap-3 kicker mb-6 text-[var(--ink-subtle)]">
            <span className="w-8 h-[2px] bg-[var(--accent)]" />
            Contact — 04 / 04
          </span>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-[0.01em] text-[var(--ink)] mb-6">
            保持联系
          </h2>
          <p className="text-lg text-[var(--ink-muted)] max-w-2xl">
            有项目、想法或单纯想聊聊设计与技术，随时找我。
          </p>
        </m.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="p-8 card-static flex flex-col justify-center gap-4"
          >
            <h3 className="kicker mb-2 text-[var(--ink-subtle)]">DIRECT LINE</h3>

            <a
              href="tel:15077577602"
              className="group flex items-center gap-4 p-4 bg-[var(--surface-2)] border border-[var(--hairline)] hover:border-[var(--accent)] transition-colors duration-300 rounded-[14px]"
            >
              <div className="w-11 h-11 rounded-[12px] bg-[var(--surface-3)] flex items-center justify-center text-[var(--ink-subtle)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-soft)] transition-colors duration-300">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="kicker text-[10px] mb-0.5">电话 TEL</p>
                <p className="text-lg font-medium text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                  150 7757 7602
                </p>
              </div>
            </a>

            <a
              href="mailto:2321833732@qq.com"
              className="group flex items-center gap-4 p-4 bg-[var(--surface-2)] border border-[var(--hairline)] hover:border-[var(--accent)] transition-colors duration-300 rounded-[14px]"
            >
              <div className="w-11 h-11 rounded-[12px] bg-[var(--surface-3)] flex items-center justify-center text-[var(--ink-subtle)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent-soft)] transition-colors duration-300">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="kicker text-[10px] mb-0.5">邮箱 MAIL</p>
                <p className="text-lg font-medium text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                  2321833732@qq.com
                </p>
              </div>
            </a>

            <div className="flex items-center gap-4 p-4 bg-[var(--surface-2)] border border-[var(--hairline)] rounded-[14px]">
              <div className="w-11 h-11 rounded-[12px] bg-[var(--surface-3)] flex items-center justify-center text-[var(--ink-subtle)]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="kicker text-[10px] mb-0.5">位置 LOC</p>
                <p className="text-lg font-medium text-[var(--ink)]">中国 CHINA</p>
              </div>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="p-8 card-static flex flex-col items-center justify-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-12 h-[3px] bg-[var(--accent)]" />
            <h3 className="kicker mb-3 text-[var(--ink-subtle)]">SUPPORT — 赞赏</h3>
            <p className="text-sm text-[var(--ink-subtle)] mb-6">
              如果我的文章对你有帮助，可以扫码支持。
            </p>
            <div className="relative w-52 h-52 bg-white p-2 border border-[var(--hairline)] rounded-[14px] overflow-hidden">
              <Image
                src="/images/reward-qrcode.jpg"
                alt="观烬的微信赞赏码"
                fill
                className="object-contain rounded-[10px]"
              />
            </div>
            <p className="index-num mt-5">WECHAT PAY / 微信赞赏</p>
          </m.div>
        </div>
      </div>
    </section>
  )
}