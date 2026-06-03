export type ChapterStatus = "outline" | "draft" | "review" | "final";

export const STATUS_LABEL: Record<ChapterStatus, string> = {
  outline: "细纲",
  draft: "初稿",
  review: "待审",
  final: "定稿",
};

export const STATUS_COLOR: Record<ChapterStatus, string> = {
  outline: "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200",
  draft: "bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100",
  review: "bg-sky-200 text-sky-900 dark:bg-sky-800 dark:text-sky-100",
  final: "bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100",
};

export interface Volume {
  id: number;
  ord: number;
  title: string;
  theme: string;
  scope: string;
  summary: string;
}

export interface Arc {
  id: number;
  volume_id: number | null;
  ord: number;
  title: string;
  function: string;
  chapter_range: string;
}

export interface Chapter {
  id: number;
  number: number;
  title: string;
  volume_id: number | null;
  arc_id: number | null;
  status: ChapterStatus;
  pov: string;
  outline: string;
  content: string;
  word_count: number;
}

export interface Foreshadow {
  id: number;
  code: string;
  description: string;
  planted_where: string;
  payoff_where: string;
  status: string;
  purpose: string;
  ord: number;
}

export interface Character {
  id: number;
  name: string;
  aliases: string;
  faction: string;
  status: string;
  bio: string;
  secret: string;
  arc: string;
  first_appearance: number | null;
}

export interface Relationship {
  id: number;
  from_id: number;
  to_id: number;
  from_name: string;
  to_name: string;
  kind: string;
  description: string;
}

export interface Setting {
  id: number;
  category: string;
  title: string;
  body: string;
  ord: number;
}

export interface Economy {
  id: number;
  name: string;
  category: string;
  rule: string;
  value: string;
  notes: string;
  ord: number;
}

export interface PowerLevel {
  id: number;
  tier: string;
  name: string;
  abilities: string;
  cost: string;
  prerequisite: string;
  ord: number;
}

export interface Plotline {
  id: number;
  name: string;
  kind: string;
  description: string;
  ord: number;
}

export const FACTION_COLOR: Record<string, string> = {
  新难民: "bg-sky-200 text-sky-900 dark:bg-sky-800 dark:text-sky-100",
  旧族: "bg-rose-200 text-rose-900 dark:bg-rose-800 dark:text-rose-100",
  守界者: "bg-violet-200 text-violet-900 dark:bg-violet-800 dark:text-violet-100",
  人类: "bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100",
};
export function factionColor(f: string): string {
  for (const k of Object.keys(FACTION_COLOR)) if (f.includes(k)) return FACTION_COLOR[k];
  return "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200";
}
