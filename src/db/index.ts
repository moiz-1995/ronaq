import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Local dev: a SQLite file. Production: Turso (libSQL) free tier via DATABASE_URL + DATABASE_AUTH_TOKEN.
const url = process.env.DATABASE_URL ?? "file:./data/ronaq.db";

const globalForDb = globalThis as unknown as { _ronaqClient?: ReturnType<typeof createClient> };
const client =
  globalForDb._ronaqClient ?? createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
if (process.env.NODE_ENV !== "production") globalForDb._ronaqClient = client;

export const db = drizzle(client, { schema });
export { schema };
