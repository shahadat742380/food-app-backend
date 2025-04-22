import {
  pgTable,
  uuid,
  varchar,
  decimal,
  timestamp,
  text,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./tbl-user";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
    tokenNumber: varchar("token_number", { length: 50 }).notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    gst: decimal("gst", { precision: 10, scale: 2 }).notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    orderDate: timestamp("order_date").notNull().defaultNow(),
    status: varchar("status", { length: 20 }).notNull(),
  },
  (table) => ({
    statusCheck: sql`check (${table.status} IN ('placed', 'confirmed', 'completed'))`,
  })
);
