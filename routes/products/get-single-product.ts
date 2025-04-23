import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { products } from "@/db/schema/tbl-products";

// Define validation schema for params
const paramsSchema = z.object({
  id: z.string().uuid(),
});

const getSingleProduct = new Hono();

getSingleProduct.get("/", async (c) => {
  try {
    // Parse and validate path parameter
    const id = c.req.param("id");
    const { id: validatedId } = paramsSchema.parse({ id });

    // Get database instance from context
    const db = c.get("db");

    // Query the specific product
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, validatedId))
      .limit(1);

    // Check if product exists
    if (!product || product.length === 0) {
      return c.json(
        {
          success: false,
          error: "Product not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: product[0],
    });
  } catch (error) {
    console.error("Error fetching product:", error);
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
        error: "Failed to fetch product",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default getSingleProduct;
