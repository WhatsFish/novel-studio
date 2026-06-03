"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { query, one } from "@/lib/db";

function s(fd: FormData, k: string): string {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
}
function nOrNull(fd: FormData, k: string): number | null {
  const v = s(fd, k);
  return v === "" ? null : parseInt(v, 10);
}

// ---------- Volumes ----------

export async function createVolume(fd: FormData) {
  const title = s(fd, "title");
  if (!title) return;
  const ord = await one<{ m: number }>("SELECT COALESCE(MAX(ord),0)+1 AS m FROM volumes");
  await query("INSERT INTO volumes (ord, title, theme, scope, summary) VALUES ($1,$2,$3,$4,$5)", [
    ord?.m ?? 1,
    title,
    s(fd, "theme"),
    s(fd, "scope"),
    s(fd, "summary"),
  ]);
  revalidatePath("/volumes");
}

export async function createArc(fd: FormData) {
  const title = s(fd, "title");
  const volume_id = nOrNull(fd, "volume_id");
  if (!title || !volume_id) return;
  const ord = await one<{ m: number }>(
    "SELECT COALESCE(MAX(ord),0)+1 AS m FROM arcs WHERE volume_id=$1",
    [volume_id],
  );
  await query(
    "INSERT INTO arcs (volume_id, ord, title, function, chapter_range) VALUES ($1,$2,$3,$4,$5)",
    [volume_id, ord?.m ?? 1, title, s(fd, "function"), s(fd, "chapter_range")],
  );
  revalidatePath("/volumes");
}

// ---------- Chapters ----------

export async function createChapter(fd: FormData) {
  const number = nOrNull(fd, "number");
  if (number === null) return;
  const row = await one<{ id: number }>(
    `INSERT INTO chapters (number, title, volume_id, arc_id, status)
     VALUES ($1,$2,$3,$4,'outline') RETURNING id`,
    [number, s(fd, "title"), nOrNull(fd, "volume_id"), nOrNull(fd, "arc_id")],
  );
  revalidatePath("/volumes");
  if (row) redirect(`/chapters/${row.id}`);
}

export async function updateChapter(fd: FormData) {
  const id = nOrNull(fd, "id");
  if (id === null) return;
  await query(
    `UPDATE chapters SET
       number=$2, title=$3, status=$4, pov=$5, volume_id=$6, arc_id=$7,
       outline=$8, content=$9
     WHERE id=$1`,
    [
      id,
      nOrNull(fd, "number"),
      s(fd, "title"),
      s(fd, "status") || "outline",
      s(fd, "pov"),
      nOrNull(fd, "volume_id"),
      nOrNull(fd, "arc_id"),
      s(fd, "outline"),
      s(fd, "content"),
    ],
  );
  revalidatePath(`/chapters/${id}`);
  revalidatePath("/volumes");
  revalidatePath("/");
}

export async function deleteChapter(fd: FormData) {
  const id = nOrNull(fd, "id");
  if (id === null) return;
  await query("DELETE FROM chapters WHERE id=$1", [id]);
  revalidatePath("/volumes");
  redirect("/volumes");
}

// ---------- Foreshadows ----------

export async function createForeshadow(fd: FormData) {
  const code = s(fd, "code");
  const description = s(fd, "description");
  if (!code || !description) return;
  const ord = await one<{ m: number }>("SELECT COALESCE(MAX(ord),0)+1 AS m FROM foreshadows");
  await query(
    `INSERT INTO foreshadows (code, description, planted_where, payoff_where, status, purpose, ord)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      code,
      description,
      s(fd, "planted_where"),
      s(fd, "payoff_where"),
      s(fd, "status") || "planted",
      s(fd, "purpose"),
      ord?.m ?? 1,
    ],
  );
  revalidatePath("/foreshadows");
}

export async function updateForeshadow(fd: FormData) {
  const id = nOrNull(fd, "id");
  if (id === null) return;
  await query(
    `UPDATE foreshadows SET code=$2, description=$3, planted_where=$4,
       payoff_where=$5, status=$6, purpose=$7 WHERE id=$1`,
    [
      id,
      s(fd, "code"),
      s(fd, "description"),
      s(fd, "planted_where"),
      s(fd, "payoff_where"),
      s(fd, "status"),
      s(fd, "purpose"),
    ],
  );
  revalidatePath("/foreshadows");
}

export async function deleteForeshadow(fd: FormData) {
  const id = nOrNull(fd, "id");
  if (id === null) return;
  await query("DELETE FROM foreshadows WHERE id=$1", [id]);
  revalidatePath("/foreshadows");
}

// ---------- Characters ----------

export async function createCharacter(fd: FormData) {
  const name = s(fd, "name");
  if (!name) return;
  await query(
    `INSERT INTO characters (name, aliases, faction, status, bio, secret, arc, first_appearance)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [name, s(fd, "aliases"), s(fd, "faction"), s(fd, "status"), s(fd, "bio"), s(fd, "secret"), s(fd, "arc"), nOrNull(fd, "first_appearance")],
  );
  revalidatePath("/characters");
  revalidatePath("/");
}

export async function updateCharacter(fd: FormData) {
  const id = nOrNull(fd, "id");
  if (id === null) return;
  await query(
    `UPDATE characters SET name=$2, aliases=$3, faction=$4, status=$5, bio=$6, secret=$7, arc=$8, first_appearance=$9 WHERE id=$1`,
    [id, s(fd, "name"), s(fd, "aliases"), s(fd, "faction"), s(fd, "status"), s(fd, "bio"), s(fd, "secret"), s(fd, "arc"), nOrNull(fd, "first_appearance")],
  );
  revalidatePath("/characters");
}

export async function deleteCharacter(fd: FormData) {
  const id = nOrNull(fd, "id");
  if (id === null) return;
  await query("DELETE FROM characters WHERE id=$1", [id]);
  revalidatePath("/characters");
}

export async function createRelationship(fd: FormData) {
  const from_id = nOrNull(fd, "from_id");
  const to_id = nOrNull(fd, "to_id");
  if (from_id === null || to_id === null) return;
  await query("INSERT INTO relationships (from_id, to_id, kind, description) VALUES ($1,$2,$3,$4)", [
    from_id,
    to_id,
    s(fd, "kind"),
    s(fd, "description"),
  ]);
  revalidatePath("/characters");
}

export async function deleteRelationship(fd: FormData) {
  const id = nOrNull(fd, "id");
  if (id === null) return;
  await query("DELETE FROM relationships WHERE id=$1", [id]);
  revalidatePath("/characters");
}

// ---------- Settings (wiki) ----------

export async function createSetting(fd: FormData) {
  const title = s(fd, "title");
  if (!title) return;
  const ord = await one<{ m: number }>("SELECT COALESCE(MAX(ord),0)+1 AS m FROM settings");
  await query("INSERT INTO settings (category, title, body, ord) VALUES ($1,$2,$3,$4)", [
    s(fd, "category") || "世界观",
    title,
    s(fd, "body"),
    ord?.m ?? 1,
  ]);
  revalidatePath("/settings");
}

export async function updateSetting(fd: FormData) {
  const id = nOrNull(fd, "id");
  if (id === null) return;
  await query("UPDATE settings SET category=$2, title=$3, body=$4 WHERE id=$1", [
    id,
    s(fd, "category"),
    s(fd, "title"),
    s(fd, "body"),
  ]);
  revalidatePath("/settings");
}

export async function deleteSetting(fd: FormData) {
  const id = nOrNull(fd, "id");
  if (id === null) return;
  await query("DELETE FROM settings WHERE id=$1", [id]);
  revalidatePath("/settings");
}

// ---------- Economy / Power / Plotlines ----------

export async function updateEconomy(fd: FormData) {
  const id = nOrNull(fd, "id");
  if (id === null) return;
  await query("UPDATE economy SET name=$2, category=$3, rule=$4, value=$5, notes=$6 WHERE id=$1", [
    id, s(fd, "name"), s(fd, "category"), s(fd, "rule"), s(fd, "value"), s(fd, "notes"),
  ]);
  revalidatePath("/settings");
}

export async function createEconomy(fd: FormData) {
  const name = s(fd, "name");
  if (!name) return;
  const ord = await one<{ m: number }>("SELECT COALESCE(MAX(ord),0)+1 AS m FROM economy");
  await query("INSERT INTO economy (name, category, rule, value, notes, ord) VALUES ($1,$2,$3,$4,$5,$6)", [
    name, s(fd, "category"), s(fd, "rule"), s(fd, "value"), s(fd, "notes"), ord?.m ?? 1,
  ]);
  revalidatePath("/settings");
}

export async function updatePower(fd: FormData) {
  const id = nOrNull(fd, "id");
  if (id === null) return;
  await query("UPDATE power_levels SET tier=$2, name=$3, abilities=$4, cost=$5, prerequisite=$6 WHERE id=$1", [
    id, s(fd, "tier"), s(fd, "name"), s(fd, "abilities"), s(fd, "cost"), s(fd, "prerequisite"),
  ]);
  revalidatePath("/settings");
}

export async function updatePlotline(fd: FormData) {
  const id = nOrNull(fd, "id");
  if (id === null) return;
  await query("UPDATE plotlines SET name=$2, kind=$3, description=$4 WHERE id=$1", [
    id, s(fd, "name"), s(fd, "kind"), s(fd, "description"),
  ]);
  revalidatePath("/settings");
}
