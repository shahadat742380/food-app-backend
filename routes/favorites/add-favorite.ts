import { Hono } from "hono";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { favorites } from "@/db/schema/tbl-favorites";
import { products } from "@/db/schema/tbl-products";

// Define validation schema for adding favorite
const favoriteSchema = z.object({
  productId: z.string().uuid(),
});

const addFavorite = new Hono();

addFavorite.post("/", async (c) => {
  try {
    // Get user from context (set by session middleware)
    const user = c.get("user");

    // Get database instance
    const db = c.get("db");

    // Parse and validate request body
    const body = await c.req.json();
    const { productId } = favoriteSchema.parse(body);

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

    // Check if product is already in favorites
    const existingFavorite = await db
      .select()
      .from(favorites)
      .where(
        and(eq(favorites.userId, user.id), eq(favorites.productId, productId))
      )
      .limit(1);

    if (existingFavorite && existingFavorite.length > 0) {
      return c.json(
        {
          success: false,
          error: "Product is already in favorites",
        },
        409
      ); // Conflict
    }

    // Add product to favorites
    const result = await db
      .insert(favorites)
      .values({
        userId: user.id,
        productId,
        isFavorite: true,
      })
      .returning();

    return c.json(
      {
        success: true,
        data: result[0],
        message: "Product added to favorites",
      },
      201
    );
  } catch (error) {
    console.error("Error adding to favorites:", error);

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
        error: "Failed to add to favorites",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default addFavorite;
