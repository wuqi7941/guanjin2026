'use client'

import { EASE } from '@/lib/motion'
import { m } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, Piano, Code2, Flame } from 'lucide-react'


const facts = [
  { label: 'AGE', value: '16 岁' },
  { label: 'ROLE', value: '学生 / 开发者 / 写作者' },
  { label: 'EST', value: '2026 春' },
  { label: 'STACK', value: 'Next.js · TS · Tailwind' },
]

const emberPoints = [
  {
    icon: Code2,
    title: '深夜写代码',
    text: '这个站从设计到部署都是我一个人弄的。喜欢把界面打磨到"看起来对"为止——宣纸底、墨色字、一枚朱印，都是我在灯下一点点调出来的。',
  },
  {
    icon: Piano,
    title: '一架琴在等我',
    text: '写了篇两万字的小说《攒一架琴》：一个少年想学琴，从一百七十三块攒到两千二。故事是虚构的，想学琴这件事，是真的。',
  },
  {
    icon: Flame,
    title: '为什么叫余烬',
    text: '火灭过，但炭还是热的。余烬是没烧完的部分——看着暗了，其实还能点燃别的东西。这里装着我所有烧过、和还在烧的想法。',
  },
]

export function AboutSection() {
  return (
    <section className="relative pt-36 pb-32 px-6">
      <span className="poster-number" aria-hidden>N°001</span>
      <div className="max-w-5xl mx-auto relative z-10">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-16"
        >
          <span className="flex items-center gap-3 kicker mb-6 text-[var(--ink-subtle)]">
            <span className="w-8 h-[2px] bg-[var(--accent)]" />
            About — 关于余烬
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em] text-[var(--ink)] mb-6 leading-tight">
            火灭了，<br />
            <span className="hero-ember">炭还是热的。</span>
          </h1>
          <p className="text-lg text-[var(--ink-muted)] max-w-2xl leading-relaxed">
            你好，我是观烬——一个十六岁的高中生。白天被作业追着跑，晚上写代码、做设计、写小说。
            这个站是我的数字花园，也是我烧过的一切的陈列柜。
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: EASE }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {facts.map((f) => (
            <div key={f.label} className="card-static p-5">
              <p className="exhibit-meta mb-2">{f.label}</p>
              <p className="text-sm font-medium text-[var(--ink)] leading-6">{f.value}</p>
            </div>
          ))}
        </m.div>

        <div className="space-y-5 mb-16">
          {emberPoints.map((p, i) => (
            <m.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: EASE }}
              className="card-static p-7 sm:p-8 flex flex-col sm:flex-row gap-5 items-start"
            >
              <div className="w-11 h-11 shrink-0 rounded-[12px] bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
                <p.icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-[var(--ink)] mb-2">
                  {p.title}
                </h2>
                <p className="text-[15px] text-[var(--ink-muted)] leading-relaxed">{p.text}</p>
              </div>
            </m.div>
          ))}
        </div>

        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="card-static p-8 sm:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-12 h-[3px] bg-[var(--accent)]" />
          <Sparkles className="w-6 h-6 text-[var(--accent)] mx-auto mb-4" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.01em] text-[var(--ink)] mb-3">
            想看看余烬烧得最亮的时候？
          </h2>
          <p className="text-[var(--ink-muted)] max-w-xl mx-auto mb-8 leading-relaxed">
            去展馆里走一圈吧。有技术笔记、深夜随笔、诗，还有那篇攒琴的小说。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/blog/"
              className="btn-primary px-8 py-3.5 text-[15px] font-semibold inline-flex items-center gap-2"
            >
              进入展馆
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/blog/novel-01/" className="btn-secondary px-8 py-3.5 text-[15px] font-medium">
              读《攒一架琴》
            </Link>
          </div>
        </m.div>
      </div>
    </section>
  )
}