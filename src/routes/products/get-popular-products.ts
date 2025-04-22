import { Hono } from "hono";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { products } from "@/db/schema/tbl-products";

// Define validation schema for query parameters
const querySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
});

const getPopularProducts = new Hono();

getPopularProducts.get("/", async (c) => {
  try {
    // Parse and validate query parameters
    const query = Object.fromEntries(new URL(c.req.url).searchParams);
    const { limit } = querySchema.parse(query);

    // Get database instance from context
    const db = c.get("db");

    // Query popular products
    const popularProducts = await db
      .select()
      .from(products)
      .where(eq(products.isPopular, true))
      .orderBy(desc(products.createdAt))
      .limit(limit);

    return c.json({
      success: true,
      data: popularProducts,
    });
  } catch (error) {
    console.error("Error fetching popular products:", error);
    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: error.errors,
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        error: "Failed to fetch popular products",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default getPopularProducts;
