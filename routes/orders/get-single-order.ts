import { Hono } from "hono";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { orders } from "@/db/schema/tbl-orders";
import { orderItems } from "@/db/schema/tbl-order-items";

// Define validation schema for path parameters
const paramsSchema = z.object({
  id: z.string().uuid(),
});

const getSingleOrder = new Hono();

getSingleOrder.get("/", async (c) => {
  try {
    // Get user from context (set by session middleware)
    const user = c.get("user");

    // Get database instance
    const db = c.get("db");

    // Parse and validate path parameter
    const id = c.req.param("id");
    const { id: orderId } = paramsSchema.parse({ id });

    // Query the specific order ensuring it belongs to the user
    const order = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, user.id)))
      .limit(1);

    // Check if order exists
    if (!order || order.length === 0) {
      return c.json(
        {
          success: false,
          error: "Order not found or doesn't belong to the user",
        },
        404
      );
    }

    // Get order items
    const items = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        productName: orderItems.productName,
        price: orderItems.price,
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    // Return order with items
    return c.json({
      success: true,
      data: {
        order: order[0],
        items,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);

    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: "Invalid order ID",
          details: error.errors,
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        error: "Failed to fetch order",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default getSingleOrder;
