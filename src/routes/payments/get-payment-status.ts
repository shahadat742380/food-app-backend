import { Hono } from "hono";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { payments } from "@/db/schema/tbl-payments";
import { orders } from "@/db/schema/tbl-orders";

// Define validation schema for path parameters
const paramsSchema = z.object({
  orderId: z.string().uuid(),
});

const getPaymentStatus = new Hono();

getPaymentStatus.get("/", async (c) => {
  try {
    // Get user from context (set by session middleware)
    const user = c.get("user");

    // Get database instance
    const db = c.get("db");

    // Parse and validate path parameter
    const orderId = c.req.param("orderId");
    const { orderId: validatedOrderId } = paramsSchema.parse({ orderId });

    // Check if order exists and belongs to the user
    const order = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, validatedOrderId), eq(orders.userId, user.id)))
      .limit(1);

    if (!order || order.length === 0) {
      return c.json(
        {
          success: false,
          error: "Order not found or doesn't belong to the user",
        },
        404
      );
    }

    // Get payment status for the order
    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, validatedOrderId))
      .limit(1);

    if (!payment || payment.length === 0) {
      return c.json(
        {
          success: false,
          error: "No payment found for this order",
          data: {
            orderId: validatedOrderId,
            orderStatus: order[0].status,
            paymentStatus: "not_initiated",
          },
        },
        404
      );
    }

    return c.json({
      success: true,
      data: {
        payment: payment[0],
        orderDetails: {
          orderNumber: order[0].orderNumber,
          orderStatus: order[0].status,
          total: order[0].total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);

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
        error: "Failed to fetch payment status",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default getPaymentStatus;
