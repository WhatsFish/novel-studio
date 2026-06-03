import { Client, type QueryResultRow } from "pg";

function config() {
  return {
    host: process.env.PG_HOST ?? "db",
    port: parseInt(process.env.PG_PORT ?? "5432", 10),
    user: process.env.PG_USER ?? "novel_studio",
    password: process.env.PG_PASSWORD ?? "",
    database: process.env.PG_DB ?? "novel_studio",
  };
}

/**
 * Ad-hoc query helper. Opens a connection per request — fine at the volume
 * this tool generates. Mirrors stock-analyst / status / cost-tracker.
 */
export async function query<T extends QueryResultRow = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const c = new Client(config());
  await c.connect();
  try {
    const r = await c.query<T>(sql, params);
    return r.rows;
  } finally {
    await c.end();
  }
}

export async function one<T extends QueryResultRow = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
