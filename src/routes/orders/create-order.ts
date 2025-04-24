import { Hono } from "hono";
import { eq, and, or } from "drizzle-orm";
import { orders } from "@/db/schema/tbl-orders";
import { orderItems } from "@/db/schema/tbl-order-items";
import { cartItems } from "@/db/schema/tbl-cart-items";
import { products } from "@/db/schema/tbl-products";

const createOrder = new Hono();

createOrder.post("/", async (c) => {
  try {
    // Get user from context (set by session middleware)
    const user = c.get("user");

    // Get database instance
    const db = c.get("db");

    // 1. Get user's cart items with product details
    const userCartItems = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
        },
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, user.id));

    // 2. Check if cart is empty
    if (!userCartItems || userCartItems.length === 0) {
      return c.json(
        {
          success: false,
          error: "Cart is empty",
        },
        400
      );
    }

    // 3. Calculate order totals
    const subtotal = userCartItems.reduce((total, item) => {
      const itemPrice = parseFloat(item.product.price.toString());
      return total + itemPrice * item.quantity;
    }, 0);

    // Calculate tax (GST) - 5% of subtotal
    const gstRate = 0.05;
    const gst = parseFloat((subtotal * gstRate).toFixed(2));
    const total = parseFloat((subtotal + gst).toFixed(2));

    // 4. Generate order number and token number
    let isUnique = false;
    let orderNumber: string = "";
    let tokenNumber: string = "";

    // Keep trying until we get unique values
    while (!isUnique) {
      // Generate MFP + 2 random digits for order number
      orderNumber = `MFP${Math.floor(10 + Math.random() * 90)}`;

      // Generate # + 3 random digits for token number
      tokenNumber = `#${Math.floor(100 + Math.random() * 900)}`;

      // Check if the order number and token number are unique
      const existingOrder = await db
        .select({ id: orders.id })
        .from(orders)
        .where(
          or(
            eq(orders.orderNumber, orderNumber),
            eq(orders.tokenNumber, tokenNumber)
          )
        )
        .limit(1);

      isUnique = existingOrder.length === 0;
    }

    // 5. Create the order (without transaction)
    // Create order
    const orderResult = await db
      .insert(orders)
      .values({
        userId: user.id,
        orderNumber,
        tokenNumber,
        subtotal: subtotal.toString(),
        gst: gst.toString(),
        total: total.toString(),
        status: "completed",
      })
      .returning();

    const newOrder = orderResult[0];

    // Create order items
    const orderItemsValues = userCartItems.map((item) => ({
      orderId: newOrder.id,
      productId: item.productId,
      productName: item.product.name,
      price: item.product.price.toString(),
      quantity: item.quantity,
    }));

    const orderItemsResult = await db
      .insert(orderItems)
      .values(orderItemsValues)
      .returning();

    // Clear cart after successful order creation
    await db.delete(cartItems).where(eq(cartItems.userId, user.id));

    // 6. Return the created order with items
    return c.json(
      {
        success: true,
        data: {
          order: newOrder,
          items: orderItemsResult,
        },
        message: "Order placed successfully",
      },
      201
    );
  } catch (error) {
    console.error("Error creating order:", error);

    return c.json(
      {
        success: false,
        error: "Failed to create order",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

export default createOrder;