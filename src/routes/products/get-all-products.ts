import { Hono } from "hono";
import { z } from "zod";
import { desc, eq, ilike, asc, count, and } from "drizzle-orm";
import { products } from "@/db/schema/tbl-products";

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

    // Execute query with filters, sorting and pagination
    let data;

    // Define base select query
    const selectQuery = db.select().from(products);

    // Apply filters
    if (search) {
      // Apply search filter
      data = await selectQuery
        .where(ilike(products.name, `%${search}%`))
        .orderBy(
          sort === "name"
            ? order === "asc"
              ? asc(products.name)
              : desc(products.name)
            : sort === "price"
              ? order === "asc"
                ? asc(products.price)
                : desc(products.price)
              : order === "asc"
                ? asc(products.createdAt)
                : desc(products.createdAt)
        )
        .limit(limit)
        .offset(offset);
    } else {
      // No filters
      data = await selectQuery
        .orderBy(
          sort === "name"
            ? order === "asc"
              ? asc(products.name)
              : desc(products.name)
            : sort === "price"
              ? order === "asc"
                ? asc(products.price)
                : desc(products.price)
              : order === "asc"
                ? asc(products.createdAt)
                : desc(products.createdAt)
        )
        .limit(limit)
        .offset(offset);
    }

    // Count total items for pagination
    let totalItems;
    const countQuery = db.select({ count: count() }).from(products);

    if (search) {
      const countResult = await countQuery.where(
        ilike(products.name, `%${search}%`)
      );
      totalItems = Number(countResult[0].count);
    } else {
      const countResult = await countQuery;
      totalItems = Number(countResult[0].count);
    }

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
