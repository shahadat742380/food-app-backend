import { pgTable, uuid, varchar, decimal, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { products } from "./tbl-products";
import { orders } from "./tbl-orders";

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    productName: varchar("product_name", { length: 255 }).notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => ({
    quantityCheck: sql`check (${table.quantity} > 0)`,
  })
);
