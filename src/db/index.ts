import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";
import { Env } from "@/types/common";

export function createDb(env: Env) {
  const client = postgres(env.DATABASE_URL);
  const db = drizzle(client, {
    schema,
  });
  return db;
}

export type DbInstance = ReturnType<typeof createDb>;