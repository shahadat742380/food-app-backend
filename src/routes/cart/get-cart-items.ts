import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { cartItems } from "@/db/schema/tbl-cart-items";
import { products } from "@/db/schema/tbl-products";

const getCartItems = new Hono();

getCartItems.get("/", async (c) => {
  try {
    // Get user from context (set by session middleware)
    const user = c.get("user");

    // Get database instance
    const db = c.get("db");

    // Query cart items with product details
    const items = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        addedAt: cartItems.addedAt,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          imageUrl: products.imageUrl,
        },
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, user.id))
      .orderBy(cartItems.addedAt);

    // Calculate cart subtotal
    const subtotal = items.reduce((total, item) => {
      const itemPrice = parseFloat(item.product.price.toString());
      return total + itemPrice * item.quantity;
    }, 0);

    // Calculate tax and fees (5% of subtotal)
    const taxAndFees = Math.round(subtotal * 0.05);

    // Calculate total amount
    const total = subtotal + taxAndFees;

    return c.json({
      success: true,
      data: {
        items,
        subtotal,
        taxAndFees,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);

    return c.json(
      {
        success: false,
        error: "Failed to fetch cart items",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default getCartItems;
