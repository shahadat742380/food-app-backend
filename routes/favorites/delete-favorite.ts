import { Hono } from "hono";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { favorites } from "@/db/schema/tbl-favorites";

// Define validation schema for productId parameter
const paramsSchema = z.object({
  productId: z.string()
});

const deleteFavorite = new Hono();

deleteFavorite.delete("/", async (c) => {
  try {
    // Get user from context (set by session middleware)
    const user = c.get("user");

    // Get database instance
    const db = c.get("db");

    // Parse and validate path parameter
    const productId = c.req.param("productId");
    const { productId: validatedProductId } = paramsSchema.parse({ productId });

    // Delete the favorite item, ensuring it belongs to the current user
    const result = await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.productId, validatedProductId),
          eq(favorites.userId, user.id)
        )
      )
      .returning();

    // Check if favorite was found and deleted
    if (!result || result.length === 0) {
      return c.json(
        {
          success: false,
          error: "Product not found in favorites or doesn't belong to the user",
        },
        404
      );
    }

    return c.json({
      success: true,
      message: "Product removed from favorites",
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);

    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: "Invalid product ID",
          details: error.errors,
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        error: "Failed to remove from favorites",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default deleteFavorite;
