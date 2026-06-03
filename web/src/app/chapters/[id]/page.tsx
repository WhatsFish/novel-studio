import Link from "next/link";
import { notFound } from "next/navigation";
import { one, query } from "@/lib/db";
import { STATUS_LABEL, type Chapter, type Volume, type Arc, type ChapterStatus } from "@/lib/types";
import { updateChapter, deleteChapter } from "../../actions";

export const dynamic = "force-dynamic";

const STATUSES: ChapterStatus[] = ["outline", "draft", "review", "final"];

export default async function ChapterEditor({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const chapter = await one<Chapter>("SELECT * FROM chapters WHERE id=$1", [id]);
  if (!chapter) notFound();
  const volumes = await query<Volume>("SELECT * FROM volumes ORDER BY ord, id");
  const arcs = await query<Arc>("SELECT * FROM arcs ORDER BY ord, id");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/volumes" className="text-sm text-sky-600 hover:underline">
          ← 卷 · 章
        </Link>
        <span className="text-xs text-neutral-400 tabular-nums">{chapter.word_count} 字</span>
      </div>

      <form action={updateChapter} className="space-y-5">
        <input type="hidden" name="id" value={chapter.id} />

        <div className="grid grid-cols-12 gap-3">
          <label className="col-span-2">
            <span className={lbl}>章号</span>
            <input name="number" type="number" defaultValue={chapter.number} className={inp} />
          </label>
          <label className="col-span-6">
            <span className={lbl}>标题</span>
            <input name="title" defaultValue={chapter.title} className={inp} placeholder="章标题" />
          </label>
          <label className="col-span-2">
            <span className={lbl}>状态</span>
            <select name="status" defaultValue={chapter.status} className={sel}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-2">
            <span className={lbl}>视角 POV</span>
            <input name="pov" defaultValue={chapter.pov} className={inp} placeholder="如 主角第一人称" />
          </label>
        </div>

        <div className="grid grid-cols-12 gap-3">
          <label className="col-span-6">
            <span className={lbl}>所属卷</span>
            <select name="volume_id" defaultValue={chapter.volume_id ?? ""} className={sel}>
              <option value="">（无）</option>
              {volumes.map((v) => (
                <option key={v.id} value={v.id}>
                  卷{v.ord} {v.title}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-6">
            <span className={lbl}>所属剧情块</span>
            <select name="arc_id" defaultValue={chapter.arc_id ?? ""} className={sel}>
              <option value="">（不归块）</option>
              {arcs.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className={lbl}>细纲</span>
            <textarea
              name="outline"
              defaultValue={chapter.outline}
              rows={26}
              className={`${inp} font-mono leading-relaxed`}
              placeholder="本章细纲、要埋/回收的伏笔、推进的线索…"
            />
          </label>
          <label className="block">
            <span className={lbl}>正文</span>
            <textarea
              name="content"
              defaultValue={chapter.content}
              rows={26}
              className={`${inp} font-serif text-[15px] leading-loose`}
              placeholder="正文…"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded bg-emerald-600 text-white px-4 py-2 text-sm hover:bg-emerald-700">
            保存
          </button>
          <span className="text-xs text-neutral-400">当前：{STATUS_LABEL[chapter.status]}</span>
        </div>
      </form>

      <form action={deleteChapter} className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <input type="hidden" name="id" value={chapter.id} />
        <button className="text-xs text-red-500 hover:underline">删除本章</button>
      </form>
    </div>
  );
}

const lbl = "block text-xs text-neutral-400 mb-1";
const inp =
  "w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-sm";
const sel =
  "w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-2 py-1.5 text-sm";
