import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";
import { Env } from "@/types/common";

export function createDb(env: Env) {
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql, {
    schema,
  });
  return db;
}

export type DbInstance = ReturnType<typeof createDb>;