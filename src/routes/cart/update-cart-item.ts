import { Hono } from "hono";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { cartItems } from "@/db/schema/tbl-cart-items";

// Define validation schema for request parameters
const paramsSchema = z.object({
  id: z.string().uuid(),
});

// Define validation schema for request body
const bodySchema = z.object({
  quantity: z.number().int().positive(),
});

const updateCartItem = new Hono();

updateCartItem.put("/", async (c) => {
  try {
    // Get user from context (set by session middleware)
    const user = c.get("user");

    // Get database instance
    const db = c.get("db");

    // Parse and validate path parameter
    const id = c.req.param("id");
    const { id: cartItemId } = paramsSchema.parse({ id });

    // Parse and validate request body
    const body = await c.req.json();
    const { quantity } = bodySchema.parse(body);

    // Update cart item
    const result = await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, user.id)))
      .returning();

    // Check if cart item was found and updated
    if (!result || result.length === 0) {
      return c.json(
        {
          success: false,
          error: "Cart item not found or doesn't belong to the user",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: result[0],
      message: "Cart item updated successfully",
    });
  } catch (error) {
    console.error("Error updating cart item:", error);

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
        error: "Failed to update cart item",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default updateCartItem;
