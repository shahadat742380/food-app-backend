import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { products } from "@/db/schema/tbl-products";

// Define validation schema for product creation
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  imageUrl: z.string().url("Invalid image URL").optional(),
  isPopular: z.boolean().optional().default(false),
});

const createProduct = new Hono();

// Apply authentication middleware

// Create product endpoint
createProduct.post("/", zValidator("json", productSchema), async (c) => {
  try {
    const body = await c.req.valid("json");

    // Get database instance from context
    const db = c.get("db");

    // Insert new product
    const [newProduct] = await db
      .insert(products)
      .values({
        name: body.name,
        description: body.description,
        price: body.price.toString(), // Convert number to string for decimal type
        imageUrl: body.imageUrl,
        isPopular: body.isPopular,
      })
      .returning();

    return c.json(
      {
        success: true,
        message: "Product created successfully",
        data: newProduct,
      },
      201
    );
  } catch (error) {
    console.error("Error creating product:", error);

    return c.json(
      {
        success: false,
        message: "Failed to create product",
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default createProduct;
