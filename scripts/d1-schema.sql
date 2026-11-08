-- 余烬评论表：免登录，昵称 + 内容 + 可选回复
-- secret 是发评时下发给本人的删除凭据（前端存 localStorage）
-- ip_hash 只用于防刷频率限制，不存原始 IP
-- avatar 是头像索引 0–11（2026-11-02 起的必选头像）
--   ⚠️ 老库是先用旧版脚本建的表、后来手工补的列；新库直接跑本脚本即可。
--   已存在但没有该列的库，执行一次：
--     ALTER TABLE comments ADD COLUMN avatar INTEGER;
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  reply_to INTEGER,
  secret TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  avatar INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comments_slug ON comments(slug, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_ip ON comments(ip_hash, created_at);

-- 访问量：每次页面进入记一笔。不存原始 IP，ip_hash 只用于 60 秒防刷
-- day 是北京时间（UTC+8）的日历日，凌晨不会算到前一天
CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  day TEXT NOT NULL,
  path TEXT NOT NULL,
  ip_hash TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_visits_day ON visits(day);
CREATE INDEX IF NOT EXISTS idx_visits_ip ON visits(ip_hash, ts);
