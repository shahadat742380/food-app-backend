import { Hono } from "hono";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { payments } from "@/db/schema/tbl-payments";
import { orders } from "@/db/schema/tbl-orders";

// Define validation schema for payment creation
const paymentSchema = z.object({
  orderId: z.string().uuid(),
  method: z
    .enum(["UPI", "CREDIT_CARD", "DEBIT_CARD", "NET_BANKING", "WALLET"])
    .default("UPI"),
  // In a real application, you would include credit card details or payment tokens
  // but for this example, we're keeping it simple
});

const createPayment = new Hono();

createPayment.post("/", async (c) => {
  try {
    // Get user from context (set by session middleware)
    const user = c.get("user");

    // Get database instance
    const db = c.get("db");

    // Parse and validate request body
    const body = await c.req.json();
    const { orderId, method } = paymentSchema.parse(body);

    // Check if order exists and belongs to the user
    const order = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, user.id)))
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

    // Check if payment already exists for this order
    const existingPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    if (existingPayment && existingPayment.length > 0) {
      return c.json(
        {
          success: false,
          error: "Payment already exists for this order",
          data: existingPayment[0],
        },
        409
      ); // Conflict
    }

    // Create a new payment record with completed status
    const payment = await db
      .insert(payments)
      .values({
        orderId,
        amount: order[0].total,
        method,
        status: "completed",
      })
      .returning();

    // Update order status to confirmed
    await db
      .update(orders)
      .set({ status: "confirmed" })
      .where(eq(orders.id, orderId));

    return c.json(
      {
        success: true,
        data: payment[0],
        message: "Payment completed successfully",
      },
      200
    );
  } catch (error) {
    console.error("Error processing payment:", error);

    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: "Invalid payment data",
          details: error.errors,
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        error: "Failed to process payment",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default createPayment;
