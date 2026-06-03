import Link from "next/link";
import { query, one } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const stats = await one<{
    volumes: number;
    chapters: number;
    words: number;
    final: number;
    draftish: number;
    characters: number;
    settings: number;
  }>(`
    SELECT
      (SELECT count(*) FROM volumes)                              AS volumes,
      (SELECT count(*) FROM chapters)                             AS chapters,
      (SELECT COALESCE(SUM(word_count),0) FROM chapters)          AS words,
      (SELECT count(*) FROM chapters WHERE status='final')        AS final,
      (SELECT count(*) FROM chapters WHERE status IN ('draft','review')) AS draftish,
      (SELECT count(*) FROM characters)                           AS characters,
      (SELECT count(*) FROM settings)                             AS settings
  `);

  const openForeshadows = await query<{ code: string; description: string; payoff_where: string }>(
    "SELECT code, description, payoff_where FROM foreshadows WHERE status <> 'paid' ORDER BY ord",
  );

  const target = 1_000_000;
  const words = Number(stats?.words ?? 0);
  const pct = Math.min(100, Math.round((words / target) * 1000) / 10);

  const cards = [
    { label: "卷", value: stats?.volumes ?? 0, href: "/volumes" },
    { label: "章节", value: stats?.chapters ?? 0, href: "/volumes" },
    { label: "定稿章", value: stats?.final ?? 0, href: "/volumes" },
    { label: "草稿/待审", value: stats?.draftish ?? 0, href: "/volumes" },
    { label: "人物", value: stats?.characters ?? 0, href: "/characters" },
    { label: "设定条目", value: stats?.settings ?? 0, href: "/settings" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">仪表盘</h1>
        <p className="text-sm text-neutral-500 mt-1">《醒来》创作进度总览</p>
      </header>

      <section>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm text-neutral-500">总字数</span>
          <span className="text-sm tabular-nums">
            {words.toLocaleString()} / {target.toLocaleString()}（{pct}%）
          </span>
        </div>
        <div className="h-2 w-full rounded bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <div className="text-2xl font-semibold tabular-nums">{Number(c.value)}</div>
            <div className="text-xs text-neutral-500 mt-1">{c.label}</div>
          </Link>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">未回收的伏笔</h2>
          <Link href="/foreshadows" className="text-sm text-sky-600 hover:underline">
            管理伏笔 →
          </Link>
        </div>
        {openForeshadows.length === 0 ? (
          <p className="text-sm text-neutral-500">暂无登记的伏笔。</p>
        ) : (
          <ul className="space-y-2">
            {openForeshadows.map((f) => (
              <li
                key={f.code}
                className="flex gap-3 text-sm rounded border border-neutral-200 dark:border-neutral-800 px-3 py-2"
              >
                <span className="font-mono text-amber-600 shrink-0">{f.code}</span>
                <span className="flex-1">{f.description}</span>
                <span className="text-neutral-400 shrink-0">收：{f.payoff_where || "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
