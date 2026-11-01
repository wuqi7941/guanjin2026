/* 站点级配置：集中一处，改信息不用翻组件 */

export const SITE = {
  url: 'https://guanjin2011.de5.net',
  name: '余烬 EMBERS',
  author: '观烬',
  lang: 'zh-CN',
  title: '余烬 EMBERS — 观烬的个人博客',
  description:
    '余烬 EMBERS——一个十六岁少年的数字花园。二百多篇随笔、短篇和一部长篇，都写在一张会泛黄的纸上。',
  keywords: ['观烬', '余烬', '设计', '前端', 'React', 'Next.js', '博客', '随笔', '小说'],
}

/* GitHub Discussions 评论（giscus）
   2026-11-01：仓库名从 guanjin2011 修正为 guanjin2026（原来配错，giscus 从未加载成功）。
   repoId/categoryId 由 GraphQL API 查证：R_kgDOVeGgZw / Announcements 类目。 */
export const GISCUS = {
  repo: 'wuqi7941/guanjin2026',
  repoId: 'R_kgDOVeGgZw',
  category: 'Announcements',
  categoryId: 'DIC_kwDOVeGgZ84DKHo7',
}
