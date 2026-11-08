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

  /* 文章页已经有一枚 H1（PostContent 的 .post-headline）。
     旧稿里有 5 篇正文第一行还带 # 标题，直接渲染会变成双 H1——
     只剥掉「全文第一行」的 H1，正文中间的小标题一律保留。 */
  const body = content.replace(/^\s*#\s+[^\n]*\n+/, '')

  /* 落日首字只对「以汉字/字母开头」的文章启用：
     引号/括号/空格开头的（全站 7 篇）first-letter 匹配会异常或丑，禁用之 */
  const dropcap = (() => {
    const first = content
      .split('\n')
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith('#'))
    return !!first && /^[A-Za-z0-9\u4e00-\u9fff]/.test(first)
  })()

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
    <article ref={articleRef} className={`prose-custom prose prose-lg max-w-none${novel ? ' prose-novel' : ''}${dropcap ? '' : ' no-dropcap'}`}>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          /* 正文中间的 `#` 也交给 Heading：以前只有全文第一行的 H1 被剥掉，
             中间出现的 `# xxx` 会渲染成一个裸 h1（没有 id、也没有本站在用的字号），
             一个页面出现两个 H1 对 SEO 也是减分项。 */
          h1: (props) => <Heading level={2} {...props} />,
          h2: (props) => <Heading level={2} {...props} />,
          h3: (props) => <Heading level={3} {...props} />,
          h4: (props) => <Heading level={4} {...props} />,
        }}
      >
        {body}
      </ReactMarkdown>
    </article>
  )
}