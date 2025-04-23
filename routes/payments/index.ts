import { Hono } from "hono";

// Import routes
import createPayment from "./create-payment";
import getPaymentStatus from "./get-payment-status";

// Import middleware
import { sessionMiddleware } from "@/middleware/user-auth";

const payments_routes = new Hono();

// Apply auth middleware to all payments routes
payments_routes.use("*", sessionMiddleware);

// Create payment route
payments_routes.route("/", createPayment);

// Get payment status route
payments_routes.route("/:orderId/status", getPaymentStatus);

export { payments_routes };
