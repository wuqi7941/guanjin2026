'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import { slugifyHeading } from '@/lib/toc'

interface MarkdownRendererProps {
  content: string
  variant?: 'default' | 'novel'
}

interface HeadingProps {
  level: 1 | 2 | 3 | 4
  children?: React.ReactNode
}

function Heading({ level, children }: HeadingProps) {
  const text = String(children ?? '').trim()
  const id = text ? slugifyHeading(text) : undefined
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'

  return (
    <Tag id={id} className="group">
      {id ? (
        <a href={`#${id}`} className="anchor-link" aria-label="链接到本节">
          #
        </a>
      ) : null}
      {children}
    </Tag>
  )
}

export function MarkdownRenderer({ content, variant = 'default' }: MarkdownRendererProps) {
  const articleRef = useRef<HTMLElement>(null)
  const novel = variant === 'novel'

  /* 段落滚动渐入：加载后逐个交点观察，进视口再展开（无 JS 时内容照常可见）。
     长文模式（小说）关闭渐入：段落几百个，逐个点亮既拖慢滚动也增加合成层开销，直接全文可见更流畅 */
  useEffect(() => {
    if (novel) return
    const root = articleRef.current
    if (!root) return

    const blocks = Array.from(root.children) as HTMLElement[]
    if (blocks.length === 0) return

    root.classList.add('reveal-ready')
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in')
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.02 }
    )

    /* 首屏内的块直接点亮，其余排队 */
    blocks.forEach((el) => {
      el.classList.add('reveal')
      io.observe(el)
    })
    const rect = root.getBoundingClientRect()
    blocks.forEach((el) => {
      const top = el.getBoundingClientRect().top
      if (top >= 0 && top <= rect.bottom * 0.9) {
        el.classList.add('reveal-in')
        io.unobserve(el)
      }
    })

    return () => {
      io.disconnect()
      root.classList.remove('reveal-ready')
      blocks.forEach((el) => el.classList.remove('reveal', 'reveal-in'))
    }
  }, [content, novel])

  return (
    <article ref={articleRef} className={`prose-custom prose prose-lg max-w-none${novel ? ' prose-novel' : ''}`}>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          h2: (props) => <Heading level={2} {...props} />,
          h3: (props) => <Heading level={3} {...props} />,
          h4: (props) => <Heading level={4} {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}