import { Hono } from "hono";
import { z } from "zod";
import { desc, eq, count, and, SQL, inArray } from "drizzle-orm";
import { orders } from "@/db/schema/tbl-orders";
import { orderItems } from "@/db/schema/tbl-order-items";

// Define validation schema for query parameters
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.enum(["placed", "confirmed", "completed"]).optional(),
});

const getAllOrders = new Hono();

getAllOrders.get("/", async (c) => {
  try {
    // Get user from context (set by session middleware)
    const user = c.get("user");

    // Get database instance
    const db = c.get("db");

    // Parse and validate query parameters
    const query = Object.fromEntries(new URL(c.req.url).searchParams);
    const { page, limit, status } = querySchema.parse(query);

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Base condition that must always be present
    const userCondition = eq(orders.userId, user.id);

    // Build the where condition
    const whereCondition = status
      ? and(userCondition, eq(orders.status, status))
      : userCondition;

    // Execute query with pagination and sorting
    const userOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        tokenNumber: orders.tokenNumber,
        subtotal: orders.subtotal,
        gst: orders.gst,
        total: orders.total,
        orderDate: orders.orderDate,
        status: orders.status,
      })
      .from(orders)
      .where(whereCondition)
      .orderBy(desc(orders.orderDate))
      .limit(limit)
      .offset(offset);

    // Count total orders for pagination
    const countResult = await db
      .select({ count: count() })
      .from(orders)
      .where(whereCondition);

    const totalItems = Number(countResult[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch order items for all orders in the result
    const orderIds = userOrders.map((order) => order.id);

    // If there are no orders, return empty results
    if (orderIds.length === 0) {
      return c.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total_pages: totalPages,
          total_items: totalItems,
        },
      });
    }

    // Get all order items for the fetched orders
    const allOrderItems = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    // Group order items by order ID
    const orderItemsMap: Record<string, any[]> = {};

    allOrderItems.forEach((item) => {
      if (!orderItemsMap[item.orderId]) {
        orderItemsMap[item.orderId] = [];
      }
      orderItemsMap[item.orderId].push(item);
    });

    // Add order items to each order
    const ordersWithItems = userOrders.map((order) => ({
      ...order,
      items: orderItemsMap[order.id] || [],
    }));

    return c.json({
      success: true,
      data: ordersWithItems,
      pagination: {
        page,
        limit,
        total_pages: totalPages,
        total_items: totalItems,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);

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
        error: "Failed to fetch orders",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default getAllOrders;
