import { Hono } from "hono";
import { sessionMiddleware } from "@/middleware/user-auth";

// Import route modules
import { products_routes } from "./products";
import { cart_routes } from "./cart";
import { favorites_routes } from "./favorites";
import { orders_routes } from "./orders";
import { payments_routes } from "./payments";

// Create main API router
const api_routes = new Hono();

// Apply routes
api_routes.route("/products", products_routes); // Public routes, no auth required
api_routes.route("/cart", cart_routes); // Protected routes with auth
api_routes.route("/favorites", favorites_routes); // Protected routes with auth
api_routes.route("/orders", orders_routes); // Protected routes with auth
api_routes.route("/payments", payments_routes); // Protected routes with auth

// Export API routes
export { api_routes };
