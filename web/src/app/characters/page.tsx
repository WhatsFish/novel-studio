import { query } from "@/lib/db";
import { factionColor, type Character, type Relationship } from "@/lib/types";
import {
  createCharacter,
  updateCharacter,
  deleteCharacter,
  createRelationship,
  deleteRelationship,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function CharactersPage() {
  const chars = await query<Character>("SELECT * FROM characters ORDER BY first_appearance NULLS LAST, id");
  const rels = await query<Relationship>(`
    SELECT r.id, r.from_id, r.to_id, r.kind, r.description,
           a.name AS from_name, b.name AS to_name
    FROM relationships r
    JOIN characters a ON a.id = r.from_id
    JOIN characters b ON b.id = r.to_id
    ORDER BY r.id`);

  const relsOf = (cid: number) =>
    rels.filter((r) => r.from_id === cid || r.to_id === cid);

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">人物 · 关系</h1>
        <span className="text-sm text-neutral-500">
          {chars.length} 人 · {rels.length} 关系
        </span>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {chars.map((c) => (
          <article key={c.id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-base font-semibold">{c.name}</h2>
              {c.aliases && <span className="text-xs text-neutral-400">（{c.aliases}）</span>}
              {c.faction && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${factionColor(c.faction)}`}>
                  {c.faction}
                </span>
              )}
              {c.first_appearance != null && (
                <span className="text-xs text-neutral-400">首登第{c.first_appearance}章</span>
              )}
            </div>
            {c.bio && <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2">{c.bio}</p>}
            {c.secret && (
              <p className="text-sm mt-1.5">
                <span className="text-amber-600">秘密：</span>
                <span className="text-neutral-600 dark:text-neutral-300">{c.secret}</span>
              </p>
            )}
            {c.arc && (
              <p className="text-sm mt-1.5">
                <span className="text-sky-600">弧光：</span>
                <span className="text-neutral-600 dark:text-neutral-300">{c.arc}</span>
              </p>
            )}

            {relsOf(c.id).length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-neutral-100 dark:border-neutral-800 pt-2">
                {relsOf(c.id).map((r) => {
                  const other = r.from_id === c.id ? r.to_name : r.from_name;
                  const dir = r.from_id === c.id ? "→" : "←";
                  return (
                    <li key={r.id} className="text-xs text-neutral-500 flex gap-1.5">
                      <span className="text-neutral-400">{dir}</span>
                      <span className="font-medium text-neutral-600 dark:text-neutral-300">{other}</span>
                      <span className="text-rose-500">[{r.kind}]</span>
                      {r.description && <span className="truncate">{r.description}</span>}
                    </li>
                  );
                })}
              </ul>
            )}

            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-xs text-neutral-400 hover:text-neutral-600">编辑</summary>
              <form action={updateCharacter} className="space-y-2 mt-2">
                <input type="hidden" name="id" value={c.id} />
                <div className="grid grid-cols-2 gap-2">
                  <input name="name" defaultValue={c.name} className={inp} placeholder="名" />
                  <input name="aliases" defaultValue={c.aliases} className={inp} placeholder="别名" />
                  <input name="faction" defaultValue={c.faction} className={inp} placeholder="阵营" />
                  <input name="status" defaultValue={c.status} className={inp} placeholder="状态" />
                  <input name="first_appearance" type="number" defaultValue={c.first_appearance ?? ""} className={inp} placeholder="首登章号" />
                </div>
                <textarea name="bio" defaultValue={c.bio} className={inp} rows={2} placeholder="小传" />
                <textarea name="secret" defaultValue={c.secret} className={inp} rows={2} placeholder="秘密" />
                <textarea name="arc" defaultValue={c.arc} className={inp} rows={2} placeholder="人物弧" />
                <div className="flex justify-between items-center">
                  <button className={btn}>保存</button>
                </div>
              </form>
              <form action={deleteCharacter} className="mt-1">
                <input type="hidden" name="id" value={c.id} />
                <button className="text-xs text-red-500 hover:underline">删除此人</button>
              </form>
            </details>
          </article>
        ))}
      </div>

      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-4">
          <h2 className="text-sm font-medium mb-3">新建人物</h2>
          <form action={createCharacter} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input name="name" placeholder="名" className={inp} required />
              <input name="aliases" placeholder="别名" className={inp} />
              <input name="faction" placeholder="阵营 如 新难民/旧族/人类" className={inp} />
              <input name="first_appearance" type="number" placeholder="首登章号" className={inp} />
            </div>
            <textarea name="bio" placeholder="小传" className={inp} rows={2} />
            <textarea name="secret" placeholder="秘密" className={inp} rows={2} />
            <textarea name="arc" placeholder="人物弧" className={inp} rows={2} />
            <button className={btn}>新建人物</button>
          </form>
        </div>

        <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-4">
          <h2 className="text-sm font-medium mb-3">新建关系</h2>
          <form action={createRelationship} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <select name="from_id" className={sel} required defaultValue="">
                <option value="" disabled>从…</option>
                {chars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select name="to_id" className={sel} required defaultValue="">
                <option value="" disabled>到…</option>
                {chars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <input name="kind" placeholder="关系类型 如 宿主共生/夫妻/敌对" className={inp} />
            <input name="description" placeholder="描述" className={inp} />
            <button className={btn}>添加关系</button>
          </form>

          <div className="mt-4 border-t border-neutral-100 dark:border-neutral-800 pt-3">
            <div className="text-xs text-neutral-400 mb-2">全部关系</div>
            <ul className="space-y-1">
              {rels.map((r) => (
                <li key={r.id} className="text-xs flex items-center gap-1.5">
                  <span className="text-neutral-600 dark:text-neutral-300">{r.from_name}</span>
                  <span className="text-neutral-400">→</span>
                  <span className="text-neutral-600 dark:text-neutral-300">{r.to_name}</span>
                  <span className="text-rose-500">[{r.kind}]</span>
                  <form action={deleteRelationship} className="inline">
                    <input type="hidden" name="id" value={r.id} />
                    <button className="text-neutral-300 hover:text-red-500">✕</button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

const inp =
  "w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm";
const sel =
  "w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-2 py-1 text-sm";
const btn =
  "rounded bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 px-3 py-1.5 text-sm hover:opacity-90";
