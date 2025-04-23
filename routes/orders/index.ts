import { Hono } from "hono";

// Import routes
import getAllOrders from "./get-all-orders";
import getSingleOrder from "./get-single-order";
import createOrder from "./create-order";

// Import middleware
import { sessionMiddleware } from "@/middleware/user-auth";

const orders_routes = new Hono();

// Apply auth middleware to all orders routes
orders_routes.use("*", sessionMiddleware);

// Get all orders route
orders_routes.route("/", getAllOrders);

// Get single order route
orders_routes.route("/:id", getSingleOrder);

// Create order route
orders_routes.route("/create", createOrder);

export { orders_routes };
