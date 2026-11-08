/* 关于页的更新记录：纯静态，服务端渲染，不进客户端 bundle。
   2026-11 之前这里是 ChangelogPanel（常驻浮层 + 首次来访提示 + localStorage 版本比对），
   一进站就抢视线；现在只留时间轴，读者往下翻才看到。 */

import { CHANGELOG_BY_DAY } from '@/lib/changelog'

export function ChangelogTimeline({ limit = 8 }: { limit?: number }) {
  const entries = CHANGELOG_BY_DAY.slice(0, limit)

  return (
    <section aria-labelledby="changelog-heading" className="mt-4">
      <div className="flex items-baseline gap-4 mb-6">
        <h2
          id="changelog-heading"
          className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)]"
        >
          站上发生过什么
        </h2>
        <span className="h-px flex-1 bg-[var(--hairline)]" aria-hidden />
        <span className="text-[11px] font-mono tracking-[0.14em] uppercase text-[var(--ink-tertiary)]">
          Changelog
        </span>
      </div>

      <ol className="relative flex flex-col gap-7 pl-5 sm:pl-6">
        {/* 竖线：一条 1px 的发丝线，不抢内容 */}
        <span
          aria-hidden
          className="absolute left-[3px] sm:left-[7px] top-1.5 bottom-1.5 w-px bg-[var(--hairline)]"
        />
        {entries.map((e) => (
          <li key={e.date} className="relative">
            <span
              aria-hidden
              className="absolute -left-5 sm:-left-6 top-[0.55em] w-[7px] h-[7px] rounded-full bg-[var(--accent)] ring-4 ring-[var(--canvas)]"
            />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
              <time
                dateTime={e.date}
                className="text-[11px] font-mono tracking-[0.12em] text-[var(--ink-tertiary)]"
              >
                {e.date.replace(/-/g, '.')}
              </time>
              <h3 className="text-[15px] font-medium text-[var(--ink)] tracking-[-0.01em]">{e.title}</h3>
            </div>
            <ul className="flex flex-col gap-1.5">
              {e.items.map((it, i) => (
                <li
                  key={i}
                  className="text-[13.5px] leading-relaxed text-[var(--ink-muted)] before:content-['·'] before:mr-2 before:text-[var(--ink-tertiary)]"
                >
                  {it}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
