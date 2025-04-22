import { Hono } from "hono";
import { z } from "zod";
import { desc, eq, ilike, asc, count } from "drizzle-orm";
import { products } from "@/db/schema/tbl-products";
import { SQL } from "drizzle-orm";

// Define validation schema for query parameters
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.enum(["name", "price", "createdAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});

const getAllProducts = new Hono();

getAllProducts.get("/", async (c) => {
  try {
    // Parse and validate query parameters
    const query = Object.fromEntries(new URL(c.req.url).searchParams);
    const { page, limit, sort, order, search } = querySchema.parse(query);

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get database instance from context
    const db = c.get("db");

    // Build base query - fix the type issue by using a simpler approach
    const conditions: SQL[] = [];

    // Add search filter if provided
    if (search) {
      conditions.push(ilike(products.name, `%${search}%`));
    }

    // Execute query with pagination and sorting
    let data;
    if (sort === "name") {
      data = await db
        .select()
        .from(products)
        .where(conditions.length ? conditions[0] : undefined)
        .orderBy(order === "asc" ? asc(products.name) : desc(products.name))
        .limit(limit)
        .offset(offset);
    } else if (sort === "price") {
      data = await db
        .select()
        .from(products)
        .where(conditions.length ? conditions[0] : undefined)
        .orderBy(order === "asc" ? asc(products.price) : desc(products.price))
        .limit(limit)
        .offset(offset);
    } else {
      data = await db
        .select()
        .from(products)
        .where(conditions.length ? conditions[0] : undefined)
        .orderBy(
          order === "asc" ? asc(products.createdAt) : desc(products.createdAt)
        )
        .limit(limit)
        .offset(offset);
    }

    // Count total items for pagination
    const countResult = await db
      .select({ count: count() })
      .from(products)
      .where(conditions.length ? conditions[0] : undefined);

    const totalItems = Number(countResult[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    return c.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total_pages: totalPages,
        total_items: totalItems,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
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
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default getAllProducts;
