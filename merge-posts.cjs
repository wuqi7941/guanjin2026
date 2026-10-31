const fs = require('fs')
const path = require('path')

const postsPath = path.join(__dirname, 'lib', 'posts.json')
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'))

const writingDir = path.join(__dirname, 'lib', 'writing')
const readMd = (file) => fs.readFileSync(path.join(writingDir, file), 'utf8').trim()

const newPosts = [
  {
    slug: 'piano-06',
    title: '琴键上的余烬',
    date: '2026-08-20',
    tags: ['钢琴', '音乐梦', '成长', '随笔'],
    excerpt: '它不是火。它比火安静。它是火熄灭之后，炉膛里那层慢慢暗下去的红。',
    readingTime: '25 分钟',
    content: readMd('piano-06-long.md'),
  },
  {
    slug: 'piano-05',
    title: '黑白之外',
    date: '2026-08-18',
    tags: ['钢琴', '随笔'],
    excerpt: '琴声不一定需要琴。这句话我是后来才敢在心里说的。',
    readingTime: '4 分钟',
    content: readMd('piano-05.md'),
  },
  {
    slug: 'piano-04',
    title: '月光',
    date: '2026-08-17',
    tags: ['钢琴', '随笔'],
    excerpt: '第一乐章那么慢，那么轻，叫什么月光，真是浪费了这个名字，月亮哪有那么温柔。',
    readingTime: '4 分钟',
    content: readMd('piano-04.md'),
  },
  {
    slug: 'piano-03',
    title: '雨滴',
    date: '2026-08-16',
    tags: ['钢琴', '随笔'],
    excerpt: '重复的声音里藏着一个不重复的世界，同一个音，有时候轻得像叹气，有时候重得像捶门。',
    readingTime: '4 分钟',
    content: readMd('piano-03.md'),
  },
  {
    slug: 'piano-02',
    title: '哈农与音阶',
    date: '2026-08-15',
    tags: ['钢琴', '随笔'],
    excerpt: '手比脑子先记住，这件事我是在电脑上才真正信了的。琴都不在了，我的左手还知道小指要去哪。',
    readingTime: '4 分钟',
    content: readMd('piano-02.md'),
  },
  {
    slug: 'piano-01',
    title: '第一架琴',
    date: '2026-08-14',
    tags: ['钢琴', '随笔'],
    excerpt: '那是我的第一个音，中指的，不知道是哪个键。声音在房间里响起来，圆圆的，撞到墙上又收回来。',
    readingTime: '4 分钟',
    content: readMd('piano-01.md'),
  },
]

for (const p of newPosts) {
  if (posts.some((x) => x.slug === p.slug)) {
    console.log('SKIP existing:', p.slug)
    continue
  }
  posts.unshift(p)
  console.log('ADDED:', p.slug, p.title, p.content.length, 'chars')
}

fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), 'utf8')
console.log('TOTAL:', posts.length)
