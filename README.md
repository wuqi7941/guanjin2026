# 余烬 EMBERS

> 火灭了，但还有温度。

一个十六岁少年的数字花园，也是我写字的地方。二百多篇随笔、短篇和一首没写完的长诗，都在这座园子里。

线上：**https://embers-blog.pages.dev**

---

## 这是什么

不是模板站，也没有花哨的框架。就是一个人从初二写到高一的东西，加上一个想把它们摆好看一点的执念。

- **纸本质感**：宣纸底、墨色字、朱印红。全局 CSS 变量做的一套纸墨色板，亮暗两套。
- **不赶时间**：页面之间用墨染过渡，翻页时盖一枚「余」字印。鼠标划过会有一声很轻的音。
- **本地优先**：阅读进度、书签、暗语收集全在 `localStorage`，不上传、不统计、不埋点。
- **藏了二十三枚暗语**：会按你打开的时间换一句话，也会因为你在钢琴上弹对《小星星》而亮起来。

## 技术栈

| 层 | 选择 |
|---|---|
| 框架 | Next.js 14（App Router，`output: 'export'` 静态导出） |
| 样式 | Tailwind + 一份手写的 `app/globals.css`（约 3.7k 行） |
| 动效 | framer-motion（`LazyMotion` + `m.*`，尊重 `prefers-reduced-motion`） |
| 内容 | `lib/posts.json`（纯 JSON，不接 CMS） |
| 部署 | Cloudflare Pages |

## 本地跑起来

```bash
npm install
npm run dev          # http://localhost:3000
```

构建静态站：

```bash
npm run typecheck    # tsc --noEmit
npm run build        # 产物在 dist/
```

## 目录

```
app/              页面（首页 / 文章 / 关于 / 联系 / 时间线 / 标签星图 / 彩蛋册）
components/       组件（播放器、搜索、过渡、彩蛋、阅读工具）
lib/              posts.json、文案、彩蛋、播放列表
public/           字体与图片
scripts/          曲库解析与体检、分享卡生成、旧混淆脚本
```

## 一些可以复用的东西

- `scripts/og_cards.py`：给每篇文章生成一张 1200×630 的纸感分享卡（Pillow + 系统宋体）
- `scripts/resolve-tracks.mjs`：把「歌名 / 歌手」清单解析成可播的曲目
- `scripts/check-tracks.mjs`：逐首探测音源是否活着，结果落盘
- `components/PageTransition.tsx`：墨染 + 纸页翻页 + 印章的过渡实现

## 关于内容

里面的文章是我自己写的，可以读、可以引用（注明出处就行），但请不要整篇搬走当成自己的。代码部分（组件、样式、脚本）随便用。

## 联系

- 邮箱：2321833732@qq.com
- 站点：https://embers-blog.pages.dev
