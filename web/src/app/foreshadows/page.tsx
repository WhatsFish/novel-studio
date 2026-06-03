import { query } from "@/lib/db";
import type { Foreshadow } from "@/lib/types";
import { createForeshadow, updateForeshadow, deleteForeshadow } from "../actions";

export const dynamic = "force-dynamic";

export default async function ForeshadowsPage() {
  const rows = await query<Foreshadow>("SELECT * FROM foreshadows ORDER BY ord, id");
  const open = rows.filter((r) => r.status !== "paid").length;

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">伏笔回收表</h1>
        <span className="text-sm text-neutral-500">
          {open} 未回收 / {rows.length} 共
        </span>
      </header>

      <p className="text-sm text-neutral-500">
        铁律：每埋一个钩子，就登记它何处回收。这是 100 万字不翻车的关键。
      </p>

      <div className="space-y-2">
        {rows.map((f) => (
          <form
            key={f.id}
            action={updateForeshadow}
            className={`grid grid-cols-12 gap-2 items-center rounded border px-2 py-2 ${
              f.status === "paid"
                ? "border-emerald-300/50 dark:border-emerald-800/50"
                : "border-neutral-200 dark:border-neutral-800"
            }`}
          >
            <input type="hidden" name="id" value={f.id} />
            <input name="code" defaultValue={f.code} className={`${inp} col-span-1 font-mono`} />
            <input name="description" defaultValue={f.description} className={`${inp} col-span-4`} />
            <input
              name="planted_where"
              defaultValue={f.planted_where}
              placeholder="埋"
              className={`${inp} col-span-2`}
            />
            <input
              name="payoff_where"
              defaultValue={f.payoff_where}
              placeholder="收"
              className={`${inp} col-span-2`}
            />
            <select name="status" defaultValue={f.status} className={`${sel} col-span-1`}>
              <option value="planted">未收</option>
              <option value="paid">已收</option>
            </select>
            <input name="purpose" defaultValue={f.purpose} placeholder="作用" className={`${inp} col-span-1`} />
            <button className="col-span-1 text-xs text-emerald-600 hover:underline">存</button>
          </form>
        ))}
      </div>

      <div className="flex gap-4">
        {rows.map((f) => (
          <form key={`d${f.id}`} action={deleteForeshadow} className="hidden">
            <input type="hidden" name="id" value={f.id} />
          </form>
        ))}
      </div>

      <section className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-4">
        <h2 className="text-sm font-medium mb-3">新增伏笔</h2>
        <form action={createForeshadow} className="grid grid-cols-12 gap-2 items-end">
          <input name="code" placeholder="F10" className={`${inp} col-span-1 font-mono`} required />
          <input name="description" placeholder="描述" className={`${inp} col-span-4`} required />
          <input name="planted_where" placeholder="埋于" className={`${inp} col-span-2`} />
          <input name="payoff_where" placeholder="收于" className={`${inp} col-span-2`} />
          <input name="purpose" placeholder="作用" className={`${inp} col-span-2`} />
          <button className="col-span-1 rounded bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900 px-2 py-1.5 text-sm">
            添加
          </button>
        </form>
      </section>
    </div>
  );
}

const inp =
  "w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm";
const sel =
  "w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-2 py-1 text-sm";
