import { query } from "@/lib/db";
import type { Setting, Economy, PowerLevel, Plotline } from "@/lib/types";
import {
  createSetting, updateSetting, deleteSetting,
  updateEconomy, createEconomy, updatePower, updatePlotline,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await query<Setting>("SELECT * FROM settings ORDER BY ord, id");
  const economy = await query<Economy>("SELECT * FROM economy ORDER BY ord, id");
  const powers = await query<PowerLevel>("SELECT * FROM power_levels ORDER BY ord, id");
  const plotlines = await query<Plotline>("SELECT * FROM plotlines ORDER BY ord, id");

  const categories = Array.from(new Set(settings.map((s) => s.category)));

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold">设定 · 体系</h1>
        <p className="text-sm text-neutral-500 mt-1">世界观 wiki · 魂晶经济 · 精神力升级 · 三线</p>
      </header>

      {/* ---------- 世界观 wiki ---------- */}
      <section className="space-y-5">
        {categories.map((cat) => (
          <div key={cat}>
            <h2 className="text-lg font-medium mb-3">{cat}</h2>
            <div className="space-y-3">
              {settings.filter((s) => s.category === cat).map((s) => (
                <article key={s.id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
                  <h3 className="font-medium">{s.title}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2 whitespace-pre-wrap leading-relaxed">
                    {s.body}
                  </p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-neutral-400 hover:text-neutral-600">编辑</summary>
                    <form action={updateSetting} className="space-y-2 mt-2">
                      <input type="hidden" name="id" value={s.id} />
                      <div className="grid grid-cols-2 gap-2">
                        <input name="category" defaultValue={s.category} className={inp} />
                        <input name="title" defaultValue={s.title} className={inp} />
                      </div>
                      <textarea name="body" defaultValue={s.body} rows={8} className={`${inp} font-mono leading-relaxed`} />
                      <div className="flex items-center gap-3">
                        <button className={btn}>保存</button>
                      </div>
                    </form>
                    <form action={deleteSetting} className="mt-1">
                      <input type="hidden" name="id" value={s.id} />
                      <button className="text-xs text-red-500 hover:underline">删除条目</button>
                    </form>
                  </details>
                </article>
              ))}
            </div>
          </div>
        ))}

        <details className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-4">
          <summary className="cursor-pointer text-sm font-medium">+ 新增设定条目</summary>
          <form action={createSetting} className="space-y-2 mt-3">
            <div className="grid grid-cols-2 gap-2">
              <input name="category" placeholder="分类 如 世界观/阵营组织/地点/概念" className={inp} />
              <input name="title" placeholder="标题" className={inp} required />
            </div>
            <textarea name="body" placeholder="正文（支持换行）" rows={6} className={`${inp} font-mono`} />
            <button className={btn}>新增</button>
          </form>
        </details>
      </section>

      {/* ---------- 魂晶经济 ---------- */}
      <section>
        <h2 className="text-lg font-medium mb-3">魂晶经济系统</h2>
        <div className="space-y-2">
          {economy.map((e) => (
            <form key={e.id} action={updateEconomy} className="grid grid-cols-12 gap-2 items-center">
              <input type="hidden" name="id" value={e.id} />
              <input name="name" defaultValue={e.name} className={`${inp} col-span-2`} />
              <input name="category" defaultValue={e.category} className={`${inp} col-span-1`} />
              <input name="rule" defaultValue={e.rule} className={`${inp} col-span-5`} />
              <input name="value" defaultValue={e.value} className={`${inp} col-span-1`} />
              <input name="notes" defaultValue={e.notes} className={`${inp} col-span-2`} />
              <button className="col-span-1 text-xs text-emerald-600 hover:underline">存</button>
            </form>
          ))}
        </div>
        <form action={createEconomy} className="grid grid-cols-12 gap-2 items-center mt-2">
          <input name="name" placeholder="项目" className={`${inp} col-span-2`} required />
          <input name="category" placeholder="类" className={`${inp} col-span-1`} />
          <input name="rule" placeholder="规则" className={`${inp} col-span-5`} />
          <input name="value" placeholder="数值" className={`${inp} col-span-1`} />
          <input name="notes" placeholder="备注" className={`${inp} col-span-2`} />
          <button className="col-span-1 text-xs text-neutral-500 hover:underline">+加</button>
        </form>
      </section>

      {/* ---------- 精神力升级 ---------- */}
      <section>
        <h2 className="text-lg font-medium mb-3">精神力升级体系</h2>
        <div className="space-y-2">
          {powers.map((p) => (
            <form key={p.id} action={updatePower} className="grid grid-cols-12 gap-2 items-center">
              <input type="hidden" name="id" value={p.id} />
              <input name="tier" defaultValue={p.tier} className={`${inp} col-span-1`} />
              <input name="name" defaultValue={p.name} className={`${inp} col-span-1`} />
              <input name="abilities" defaultValue={p.abilities} className={`${inp} col-span-6`} />
              <input name="cost" defaultValue={p.cost} className={`${inp} col-span-1`} />
              <input name="prerequisite" defaultValue={p.prerequisite} className={`${inp} col-span-2`} />
              <button className="col-span-1 text-xs text-emerald-600 hover:underline">存</button>
            </form>
          ))}
        </div>
      </section>

      {/* ---------- 三线 ---------- */}
      <section>
        <h2 className="text-lg font-medium mb-3">三线</h2>
        <div className="space-y-2">
          {plotlines.map((l) => (
            <form key={l.id} action={updatePlotline} className="grid grid-cols-12 gap-2 items-center">
              <input type="hidden" name="id" value={l.id} />
              <input name="name" defaultValue={l.name} className={`${inp} col-span-2`} />
              <input name="kind" defaultValue={l.kind} className={`${inp} col-span-2`} />
              <input name="description" defaultValue={l.description} className={`${inp} col-span-7`} />
              <button className="col-span-1 text-xs text-emerald-600 hover:underline">存</button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}

const inp =
  "w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm";
const btn =
  "rounded bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 px-3 py-1.5 text-sm hover:opacity-90";
