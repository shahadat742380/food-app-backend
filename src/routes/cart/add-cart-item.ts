import { Hono } from "hono";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { cartItems } from "@/db/schema/tbl-cart-items";
import { products } from "@/db/schema/tbl-products";

// Define validation schema for adding cart item
const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const addCartItem = new Hono();

addCartItem.post("/", async (c) => {
  try {
    // Get user from context (set by session middleware)
    const user = c.get("user");

    // Get database instance
    const db = c.get("db");

    // Parse and validate request body
    const body = await c.req.json();
    const { productId, quantity } = cartItemSchema.parse(body);

    // Check if product exists
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product || product.length === 0) {
      return c.json(
        {
          success: false,
          error: "Product not found",
        },
        404
      );
    }

    // Check if item already exists in cart
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(
        and(eq(cartItems.userId, user.id), eq(cartItems.productId, productId))
      )
      .limit(1);

    let result;

    if (existingItem && existingItem.length > 0) {
      // Update existing item quantity
      const newQuantity = existingItem[0].quantity + quantity;

      result = await db
        .update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existingItem[0].id))
        .returning();

      return c.json(
        {
          success: true,
          data: result[0],
          message: "Cart item quantity updated",
        },
        200
      );
    } else {
      // Insert new cart item
      result = await db
        .insert(cartItems)
        .values({
          userId: user.id,
          productId,
          quantity,
        })
        .returning();

      return c.json(
        {
          success: true,
          data: result[0],
          message: "Item added to cart",
        },
        201
      );
    }
  } catch (error) {
    console.error("Error adding item to cart:", error);

    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: "Invalid input data",
          details: error.errors,
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        error: "Failed to add item to cart",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default addCartItem;
