import postsData from './posts.json'

/* 标签星图：31 个分区按篇数排在一圈圈星轨上，
   两个标签在同一篇里出现过就连一条线（权重 = 共现次数）。 */

export interface TagNode {
  name: string
  count: number
  x: number
  y: number
  r: number
}

export interface TagEdge {
  a: string
  b: string
  w: number
}

export interface TagMapData {
  nodes: TagNode[]
  edges: TagEdge[]
}

interface RawPost {
  slug: string
  tags?: string[]
}

export function getTagMap(): TagMapData {
  const posts = postsData as RawPost[]
  const counts = new Map<string, number>()
  const pairs = new Map<string, number>()

  for (const post of posts) {
    const tags = post.tags ?? []
    for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1)
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        const key = [tags[i], tags[j]].sort().join('|')
        pairs.set(key, (pairs.get(key) ?? 0) + 1)
      }
    }
  }

  /* 黄金角螺旋：篇数多的落在里圈，一眼能看出哪几个是主干 */
  const ordered = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  const nodes: TagNode[] = ordered.map(([name, count], i) => {
    const angle = i * 2.399963
    const radius = 62 + 36 * Math.sqrt(i)
    return {
      name,
      count,
      x: Math.round(Math.cos(angle) * radius),
      y: Math.round(Math.sin(angle) * radius),
      r: Math.round(4 + Math.sqrt(count) * 1.6),
    }
  })

  const known = new Set(nodes.map((n) => n.name))
  const edges: TagEdge[] = []
  pairs.forEach((w, key) => {
    const [a, b] = key.split('|')
    if (w < 2 || !known.has(a) || !known.has(b)) return
    edges.push({ a, b, w })
  })

  return { nodes, edges }
}
