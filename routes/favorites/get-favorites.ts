import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { favorites } from "@/db/schema/tbl-favorites";
import { products } from "@/db/schema/tbl-products";

const getFavorites = new Hono();

getFavorites.get("/", async (c) => {
  try {
    // Get user from context (set by session middleware)
    const user = c.get("user");

    // Get database instance
    const db = c.get("db");

    // Query user's favorite products with product details
    const userFavorites = await db
      .select({
        id: favorites.id,
        productId: favorites.productId,
        isFavorite: favorites.isFavorite,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          imageUrl: products.imageUrl,
          description: products.description,
        },
      })
      .from(favorites)
      .innerJoin(products, eq(favorites.productId, products.id))
      .where(eq(favorites.userId, user.id))
      .orderBy(products.name);

    return c.json({
      success: true,
      data: userFavorites,
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);

    return c.json(
      {
        success: false,
        error: "Failed to fetch favorites",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default getFavorites;
