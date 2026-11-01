-- 余烬评论表：免登录，昵称 + 内容 + 可选回复
-- secret 是发评时下发给本人的删除凭据（前端存 localStorage）
-- ip_hash 只用于防刷频率限制，不存原始 IP
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  reply_to INTEGER,
  secret TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comments_slug ON comments(slug, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_ip ON comments(ip_hash, created_at);
