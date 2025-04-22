import { relations } from "drizzle-orm";
import { user } from "./tbl-user";
import { cartItems } from "./tbl-cart-items";
import { favorites } from "./tbl-favorites";
import { orders } from "./tbl-orders";
import { orderItems } from "./tbl-order-items";
import { payments } from "./tbl-payments";
import { products } from "./tbl-products";
import { account } from "./tbl-account";

// User relations
export const userRelations = relations(user, ({ many }) => ({
  cartItems: many(cartItems),
  favorites: many(favorites),
  orders: many(orders),
  accounts: many(account),
}));

// Product relations
export const productsRelations = relations(products, ({ many }) => ({
  cartItems: many(cartItems),
  favorites: many(favorites),
  orderItems: many(orderItems),
}));

// Cart items relations
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(user, {
    fields: [cartItems.userId],
    references: [user.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// Favorites relations
export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(user, {
    fields: [favorites.userId],
    references: [user.id],
  }),
  product: one(products, {
    fields: [favorites.productId],
    references: [products.id],
  }),
}));

// Orders relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  orderItems: many(orderItems),
  payments: many(payments),
}));

// Order items relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// Payments relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));



// Account relations
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
