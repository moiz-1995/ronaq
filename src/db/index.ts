import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Local dev: a SQLite file. Production: Turso (libSQL) free tier.
// Accepts our own names or the ones the Vercel ↔ Turso integration injects.
const url = process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL ?? "file:./data/ronaq.db";
const authToken = process.env.DATABASE_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;

const globalForDb = globalThis as unknown as { _ronaqClient?: ReturnType<typeof createClient> };
const client = globalForDb._ronaqClient ?? createClient({ url, authToken });
if (process.env.NODE_ENV !== "production") globalForDb._ronaqClient = client;

export const db = drizzle(client, { schema });
export { schema };
