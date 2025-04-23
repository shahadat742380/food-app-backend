import { Hono } from "hono";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { cartItems } from "@/db/schema/tbl-cart-items";

// Define validation schema for request parameters
const paramsSchema = z.object({
  id: z.string().uuid(),
});

const deleteCartItem = new Hono();

deleteCartItem.delete("/", async (c) => {
  try {
    // Get user from context (set by session middleware)
    const user = c.get("user");

    // Get database instance
    const db = c.get("db");

    // Parse and validate path parameter
    const id = c.req.param("id");
    const { id: cartItemId } = paramsSchema.parse({ id });

    // Delete cart item, ensuring it belongs to the current user
    const result = await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, user.id)))
      .returning();

    // Check if cart item was found and deleted
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
      message: "Cart item removed successfully",
    });
  } catch (error) {
    console.error("Error removing cart item:", error);

    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: "Invalid cart item ID",
          details: error.errors,
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        error: "Failed to remove cart item",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default deleteCartItem;
