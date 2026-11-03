'use client'

import { EASE } from '@/lib/motion'
import { useEffect, useRef, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, ChevronDown } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { lockScroll } from '@/lib/scrollLock'

/* 「文章」下面挂四个去处：全部、年轮、星图、收藏夹。
   年轮与星图原来是文章列表标题下的小字，等于藏起来了。 */
const navLinks = [
  { href: '/', label: '首页', idx: '01' },
  {
    href: '/blog/',
    label: '文章',
    idx: '02',
    sub: [
      { href: '/blog/', label: '全部文章' },
      { href: '/timeline/', label: '火的年轮' },
      { href: '/tags/', label: '标签星图' },
      { href: '/bookmarks/', label: '收藏夹' },
    ],
  },
  { href: '/about/', label: '关于', idx: '03' },
  { href: '/play/', label: '试金石', idx: '04' },
  { href: '/contact/', label: '联系', idx: '05' },
]

const SUB_PREFIX = ['/blog/', '/timeline/', '/tags/', '/bookmarks/']

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const isActive = (href: string) => {
    if (href.includes('#')) return false
    if (href === '/') return pathname === '/'
    if (href === '/blog/') return SUB_PREFIX.some((p) => pathname.startsWith(p))
    return pathname.startsWith(href)
  }

  const isSubActive = (href: string) =>
    href === '/blog/' ? pathname.startsWith('/blog/') : pathname.startsWith(href)

  /* 移动菜单：Esc 关、点外面关、开着锁背后滚动；关上把焦点还给汉堡钮
     （点链接导航走的时候不还焦点——页面都要换了，抢回焦点只会让地址栏闪一下） */
  useEffect(() => {
    if (!open) return
    const unlock = lockScroll()
    let navigated = false
    const onNavClick = () => {
      navigated = true
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (!t?.closest('.glass-nav')) setOpen(false)
    }
    const menuEl = menuRef.current
    menuEl?.addEventListener('click', onNavClick, true)
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      unlock()
      menuEl?.removeEventListener('click', onNavClick, true)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
      if (!navigated) burgerRef.current?.focus()
    }
  }, [open])

  return (
    <m.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="fixed top-0 left-0 right-0 z-[var(--z-nav)] glass-nav nav-safe-top"
    >
      <nav className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2"
          onClick={() => {
            setOpen(false)
            window.dispatchEvent(new CustomEvent('embers-logo-click'))
          }}
        >
          <span className="text-base font-bold tracking-tight">
            <span className="text-[var(--accent)]">余烬</span>
            <span className="text-[var(--ink)]"> EMBERS</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ul className="hidden sm:flex items-center gap-0.5 mr-2">
            {navLinks.map((link) => (
              <li key={link.href} className={link.sub ? 'relative group' : undefined}>
                <Link
                  href={link.href}
                  className={`group relative px-3 py-1.5 text-sm transition-colors duration-200 flex items-baseline gap-1.5 border-b-2 ${
                    isActive(link.href)
                      ? 'text-[var(--ink)] border-[var(--accent)]'
                      : 'text-[var(--ink-muted)] border-transparent hover:text-[var(--ink)] hover:border-[var(--hairline-strong)]'
                  }`}
                >
                  <span className="font-mono text-[10px] text-[var(--ink-tertiary)] group-hover:text-[var(--accent)] transition-colors">
                    {link.idx}
                  </span>
                  {link.label}
                  {link.sub && (
                    <ChevronDown
                      className="w-3 h-3 ml-0.5 opacity-50 transition-transform duration-200 group-hover:rotate-180"
                      aria-hidden
                    />
                  )}
                </Link>

                {link.sub && (
                  <div className="nav-sub">
                    {link.sub.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        className={`nav-sub-item${isSubActive(s.href) ? ' is-active' : ''}`}
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>

          <button
            className="w-11 h-11 sm:w-9 sm:h-9 rounded-[4px] flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-1)] transition-colors"
            onClick={() => window.dispatchEvent(new CustomEvent('embers-search'))}
            onMouseEnter={() => window.dispatchEvent(new CustomEvent('embers-search-prefetch'))}
            onFocus={() => window.dispatchEvent(new CustomEvent('embers-search-prefetch'))}
            aria-label="全站搜索（快捷键 / 或 Ctrl+K）"
            title="搜索…（/ 或 Ctrl+K）"
          >
            <Search className="w-4 h-4" />
          </button>

        <button
          ref={burgerRef}
          className="sm:hidden w-11 h-11 rounded-[4px] flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-1)] transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <ThemeToggle />
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            ref={menuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="sm:hidden overflow-hidden glass-nav"
          >
            <ul className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[4px] text-sm transition-colors ${
                      isActive(link.href)
                        ? 'text-[var(--ink)] bg-[var(--surface-2)]'
                        : 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-1)]'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-[var(--accent)]">{link.idx}</span>
                    {link.label}
                  </Link>

                  {link.sub && (
                    <div className="ml-8 mt-1 space-y-0.5 border-l border-[var(--hairline)] pl-3">
                      {link.sub.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          onClick={() => setOpen(false)}
                          className={`block px-2 py-2 rounded-[4px] text-[13px] transition-colors ${
                            isSubActive(s.href)
                              ? 'text-[var(--accent)]'
                              : 'text-[var(--ink-subtle)] hover:text-[var(--ink)]'
                          }`}
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </m.header>
  )
}
