import Link from "next/link";
import { query } from "@/lib/db";
import { STATUS_LABEL, STATUS_COLOR, type Volume, type Arc, type Chapter } from "@/lib/types";
import { createVolume, createArc, createChapter } from "../actions";

export const dynamic = "force-dynamic";

export default async function VolumesPage() {
  const volumes = await query<Volume>("SELECT * FROM volumes ORDER BY ord, id");
  const arcs = await query<Arc>("SELECT * FROM arcs ORDER BY ord, id");
  const chapters = await query<Chapter>("SELECT * FROM chapters ORDER BY number, id");

  const arcsByVol = (vid: number) => arcs.filter((a) => a.volume_id === vid);
  const chaptersByArc = (aid: number) => chapters.filter((c) => c.arc_id === aid);
  const looseChapters = (vid: number) =>
    chapters.filter((c) => c.volume_id === vid && c.arc_id === null);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">卷 · 章</h1>
        <span className="text-sm text-neutral-500">{chapters.length} 章</span>
      </header>

      {volumes.length === 0 && (
        <p className="text-sm text-neutral-500">还没有卷。用下面的表单新建第一卷。</p>
      )}

      <div className="space-y-6">
        {volumes.map((v) => (
          <section key={v.id} className="rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-neutral-400">卷{v.ord}</span>
                <h2 className="text-lg font-medium">{v.title}</h2>
                {v.scope && <span className="text-xs text-neutral-400">· {v.scope}</span>}
              </div>
              {v.summary && <p className="text-sm text-neutral-500 mt-1">{v.summary}</p>}
            </div>

            <div className="p-4 space-y-4">
              {arcsByVol(v.id).map((a) => (
                <div key={a.id}>
                  <div className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    {a.title}
                    {a.chapter_range && (
                      <span className="text-xs text-neutral-400 ml-2">{a.chapter_range}</span>
                    )}
                  </div>
                  {a.function && <p className="text-xs text-neutral-400 mt-0.5">{a.function}</p>}
                  <ChapterList chapters={chaptersByArc(a.id)} />
                </div>
              ))}

              {looseChapters(v.id).length > 0 && (
                <div>
                  <div className="text-xs text-neutral-400">未归块章节</div>
                  <ChapterList chapters={looseChapters(v.id)} />
                </div>
              )}

              <details className="text-sm">
                <summary className="cursor-pointer text-neutral-500 hover:text-neutral-700">
                  + 新建剧情块 / 章节
                </summary>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <form action={createArc} className="space-y-2">
                    <input type="hidden" name="volume_id" value={v.id} />
                    <div className="text-xs text-neutral-400">新剧情块</div>
                    <input name="title" placeholder="块标题" className={inp} required />
                    <input name="chapter_range" placeholder="章节范围 如 1-6" className={inp} />
                    <input name="function" placeholder="功能" className={inp} />
                    <button className={btn}>添加块</button>
                  </form>
                  <form action={createChapter} className="space-y-2">
                    <input type="hidden" name="volume_id" value={v.id} />
                    <div className="text-xs text-neutral-400">新章节</div>
                    <input name="number" type="number" placeholder="章号" className={inp} required />
                    <input name="title" placeholder="章标题" className={inp} />
                    <select name="arc_id" className={sel} defaultValue="">
                      <option value="">（不归块）</option>
                      {arcsByVol(v.id).map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.title}
                        </option>
                      ))}
                    </select>
                    <button className={btn}>新建并编辑 →</button>
                  </form>
                </div>
              </details>
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-4">
        <h2 className="text-sm font-medium mb-3">新建卷</h2>
        <form action={createVolume} className="grid grid-cols-2 gap-3">
          <input name="title" placeholder="卷标题 如《醒来》" className={inp} required />
          <input name="scope" placeholder="格局层 如 个人/生存" className={inp} />
          <input name="theme" placeholder="主题" className={inp} />
          <input name="summary" placeholder="卷梗概" className={inp} />
          <button className={`${btn} col-span-2`}>新建卷</button>
        </form>
      </section>
    </div>
  );
}

function ChapterList({ chapters }: { chapters: Chapter[] }) {
  if (chapters.length === 0) return null;
  return (
    <ul className="mt-1.5 space-y-1">
      {chapters.map((c) => (
        <li key={c.id}>
          <Link
            href={`/chapters/${c.id}`}
            className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <span className="text-xs text-neutral-400 tabular-nums w-10">第{c.number}章</span>
            <span className="flex-1 truncate">{c.title || <span className="text-neutral-400">（无标题）</span>}</span>
            <span className="text-xs text-neutral-400 tabular-nums">{c.word_count} 字</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_COLOR[c.status]}`}>
              {STATUS_LABEL[c.status]}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const inp =
  "w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm";
const sel =
  "w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-2 py-1 text-sm";
const btn =
  "rounded bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 px-3 py-1.5 text-sm hover:opacity-90";
