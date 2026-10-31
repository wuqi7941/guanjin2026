'use client'

import { EASE } from '@/lib/motion'
import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

const navLinks = [
  { href: '/', label: '首页', idx: '01' },
  { href: '/blog/', label: '文章', idx: '02' },
  { href: '/about', label: '关于', idx: '03' },
  { href: '/contact/', label: '联系', idx: '04' },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => {
    if (href.includes('#')) return false
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <m.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="fixed top-0 left-0 right-0 z-50 glass-nav"
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
            <span className="ml-1.5 kicker hidden sm:inline text-[9px]">®</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ul className="hidden sm:flex items-center gap-0.5 mr-2">
            {navLinks.map((link) => (
              <li key={link.href}>
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
                </Link>
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
            className="sm:hidden w-11 h-11 rounded-[4px] flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-1)] transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? '关闭菜单' : '打开菜单'}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <ThemeToggle />
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <m.div
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
                    className={`flex items-center gap-2.5 block px-3 py-2.5 rounded-[4px] text-sm transition-colors ${
                      isActive(link.href)
                        ? 'text-[var(--ink)] bg-[var(--surface-2)]'
                        : 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-1)]'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-[var(--accent)]">{link.idx}</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </m.header>
  )
}