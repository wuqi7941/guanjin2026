import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Providers } from './providers'
import { SITE } from '@/lib/site'
import { DeferredWidgets } from '@/components/DeferredWidgets'
import { PageTransition } from '@/components/PageTransition'
import { ScrollManager } from '@/components/ScrollManager'
import { ThemeColorSync } from '@/components/ThemeColorSync'
import { GlowFollow } from '@/components/GlowFollow'
import { PaperLight } from '@/components/PaperLight'
import { CopyGuard } from '@/components/CopyGuard'
import { ScrollProgress } from '@/components/ScrollProgress'
import { QuickNav } from '@/components/QuickNav'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.title,
  description: SITE.description,
  keywords: SITE.keywords,
  authors: [{ name: SITE.author }],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    type: 'website',
    locale: 'zh_CN',
    siteName: SITE.name,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: '余烬 EMBERS · 观烬的个人博客' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.name,
    description: SITE.description,
    images: ['/og.png'],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 首次进站：把灯拧亮一次（只执行一次，标记写进 localStorage）。
            写成阻塞脚本，保证在首帧之前就把 html 类挂上，避免亮一下再黑回去。 */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!localStorage.getItem('embers_lit')){document.documentElement.classList.add('first-light');localStorage.setItem('embers_lit','1')}}catch(e){}",
          }}
        />
        {/* 字体本地托管（原 Google Fonts 国内访问不稳，导致回退宋体、观感打折） */}
        <link rel="stylesheet" href="/fonts/fonts.css" />
        {/* 首屏标题英文字体预载（Cormorant 拉丁分片，避免标题字体闪烁） */}
        <link
          rel="preload"
          href="/fonts/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/co3ZmX5slCNuHLi8bLeY9MK7whWMhyjYrEtImSo.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* iOS：不把长数字识别成电话号码 */}
        <meta name="format-detection" content="telephone=no" />
        {/* 移动端地址栏配色（默认宣纸色，ThemeColorSync 随主题切换） */}
        <meta name="theme-color" content="#F2ECE1" />
        {/* RSS 订阅 */}
        <link rel="alternate" type="application/rss+xml" title="余烬 EMBERS" href="/feed.xml" />
        {/* 音乐源域名预解析（播放器首次播放更快） */}
        
        <link rel="dns-prefetch" href="//api.injahow.cn" />
        <link rel="dns-prefetch" href="//music.163.com" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} grain`}>
        <a href="#main-content" className="skip-link">
          跳到主内容
        </a>
        <Providers>
          {children}
          <DeferredWidgets />
          <PageTransition />
          <ScrollManager />
          <ThemeColorSync />
          <GlowFollow />
          <PaperLight />
          <CopyGuard />
          <ScrollProgress />
          <QuickNav />
        </Providers>
      </body>
    </html>
  )
}
