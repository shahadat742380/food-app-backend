import { Hono } from "hono";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { favorites } from "@/db/schema/tbl-favorites";
import { products } from "@/db/schema/tbl-products";

// Define validation schema for params
const paramsSchema = z.object({
  productId: z.string().uuid(),
});

const getSingleFavorite = new Hono();

getSingleFavorite.get("/:productId", async (c) => {
  try {
    // Get user from context (set by session middleware)
    const user = c.get("user");

    // Get database instance
    const db = c.get("db");

    // Parse and validate path parameter
    const productId = c.req.param("productId");
    const { productId: validatedProductId } = paramsSchema.parse({ productId });

    // Check if product exists
    const product = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, validatedProductId))
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

    // Check if the product is in favorites
    const favoriteExists = await db
      .select({ id: favorites.id })
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, user.id),
          eq(favorites.productId, validatedProductId)
        )
      )
      .limit(1);

    // Return simple response with favorite status
    return c.json({
      success: true,
      data: {
        productId: validatedProductId,
        isFavorite: favoriteExists && favoriteExists.length > 0,
      },
    });
  } catch (error) {
    console.error("Error checking favorite status:", error);

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
        error: "Failed to check favorite status",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default getSingleFavorite;
