import { pgTable, uuid, integer, timestamp, text } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { products } from "./tbl-products";
import { user } from "./tbl-user";

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    addedAt: timestamp("added_at").notNull().defaultNow(),
  },
  (table) => ({
    quantityCheck: sql`check (${table.quantity} > 0)`,
  })
);
