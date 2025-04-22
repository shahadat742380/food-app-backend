import { pgTable, uuid, boolean, unique, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { products } from "./tbl-products";
import { user } from "./tbl-user";

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    isFavorite: boolean("is_favorite").notNull().default(true),
  },
  (table) => {
    return {
      userProductUnique: unique("user_product_unique").on(
        table.userId,
        table.productId
      ),
    };
  }
);
