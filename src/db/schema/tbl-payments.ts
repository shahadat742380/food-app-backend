import {
  pgTable,
  uuid,
  decimal,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { orders } from "./tbl-orders";

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    method: varchar("method", { length: 50 }).notNull().default("UPI"),
    status: varchar("status", { length: 20 }).notNull(),
    paymentDate: timestamp("payment_date").notNull().defaultNow(),
  },
  (table) => ({
    statusCheck: sql`check (${table.status} IN ('pending', 'completed', 'failed'))`,
  })
);
