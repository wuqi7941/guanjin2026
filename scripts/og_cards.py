# og_cards.py -- 为每篇文章生成一张纸感分享卡（1200×630）
# 用法：python scripts/og_cards.py [--limit N]
# 依赖：Pillow；字体用系统宋体/雅黑，找不到会自动回退。
import json
import os
import sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'lib', 'posts.json')
OUT = os.path.join(ROOT, 'public', 'og')

W, H = 1200, 630
PAPER_TOP = (251, 245, 234)
PAPER_BOTTOM = (240, 230, 213)
INK = (34, 27, 19)
INK_SOFT = (110, 96, 78)
ACCENT = (158, 59, 46)


def pick_font(candidates, size):
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


SERIF = [
    r'C:\Windows\Fonts\simsun.ttc',
    r'C:\Windows\Fonts\Songti.ttc',
    r'C:\Windows\Fonts\msyh.ttc',
]
LATIN = [
    r'C:\Windows\Fonts\georgia.ttf',
    r'C:\Windows\Fonts\times.ttf',
    r'C:\Windows\Fonts\msyh.ttc',
]


def gradient(size):
    w, h = size
    img = Image.new('RGB', (w, h), PAPER_TOP)
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(1, h - 1)
        r = int(PAPER_TOP[0] + (PAPER_BOTTOM[0] - PAPER_TOP[0]) * t)
        g = int(PAPER_TOP[1] + (PAPER_BOTTOM[1] - PAPER_TOP[1]) * t)
        b = int(PAPER_TOP[2] + (PAPER_BOTTOM[2] - PAPER_TOP[2]) * t)
        d.line([(0, y), (w, y)], fill=(r, g, b))
    return img


def wrap(draw, text, font, max_w, max_lines):
    lines, cur = [], ''
    for ch in text:
        trial = cur + ch
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            lines.append(cur)
            cur = ch
            if len(lines) >= max_lines:
                break
    if cur and len(lines) < max_lines:
        lines.append(cur)
    if len(lines) == max_lines and ''.join(lines) != text:
        lines[-1] = lines[-1][:-1] + '…'
    return lines


def card(post):
    img = gradient((W, H))
    d = ImageDraw.Draw(img, 'RGBA')

    # 纸面淡格
    for x in range(0, W, 60):
        d.line([(x, 0), (x, H)], fill=(120, 100, 70, 10), width=1)
    for y in range(0, H, 60):
        d.line([(0, y), (W, y)], fill=(120, 100, 70, 10), width=1)

    # 四周压暗
    d.rectangle([0, 0, W, H], outline=(120, 100, 70, 40), width=2)

    eyebrow = pick_font(LATIN, 22)
    small = pick_font(SERIF, 24)
    n = len(post['title'])
    tsize = 76 if n <= 12 else (62 if n <= 18 else 52)
    line_h = int(tsize * 1.26)
    title_font = pick_font(SERIF, tsize)
    foot = pick_font(SERIF, 26)

    # 抬头
    d.text((80, 64), 'EMBERS', font=eyebrow, fill=INK_SOFT)
    d.text((80, 96), '余烬 EMBERS', font=small, fill=INK_SOFT)
    d.line([(80, 148), (W - 80, 148)], fill=(120, 100, 70, 60), width=1)

    # 标题
    lines = wrap(d, post['title'], title_font, W - 260, 3)
    y = 220
    for line in lines:
        d.text((80, y), line, font=title_font, fill=INK)
        y += line_h

    # 摘要一行
    excerpt = (post.get('excerpt') or '').strip()
    if excerpt:
        d.text((80, y + 26), excerpt[:34] + ('…' if len(excerpt) > 34 else ''), font=small, fill=INK_SOFT)

    # 底部
    d.line([(80, H - 118), (W - 80, H - 118)], fill=(120, 100, 70, 60), width=1)
    d.text((80, H - 88), post['date'].replace('-', '.'), font=foot, fill=INK_SOFT)
    tag = (post.get('tags') or ['随笔'])[0]
    d.text((220, H - 88), '· ' + tag, font=foot, fill=INK_SOFT)
    d.text((W - 320, H - 88), '观烬 · 数字花园', font=foot, fill=INK_SOFT)

    # 朱印
    seal_size = 82
    sx, sy = W - 80 - seal_size, 70
    d.rectangle([sx, sy, sx + seal_size, sy + seal_size], fill=ACCENT)
    seal_font = pick_font(SERIF, 52)
    d.text((sx + seal_size / 2, sy + seal_size / 2 + 2), '余', font=seal_font, fill=(251, 245, 234), anchor='mm')

    return img


def main():
    limit = None
    if '--limit' in sys.argv:
        limit = int(sys.argv[sys.argv.index('--limit') + 1])

    with open(SRC, encoding='utf-8') as f:
        posts = json.load(f)
    if limit:
        posts = posts[:limit]

    os.makedirs(OUT, exist_ok=True)
    for i, post in enumerate(posts, 1):
        img = card(post)
        img.save(os.path.join(OUT, post['slug'] + '.png'), optimize=True)
        if i % 40 == 0:
            print('  ...', i, '/', len(posts))

    print('done:', len(posts), 'cards ->', OUT)


if __name__ == '__main__':
    main()
