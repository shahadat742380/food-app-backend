import { Hono } from "hono";

// Import routes
import getCartItems from "./get-cart-items";
import addCartItem from "./add-cart-item";
import updateCartItem from "./update-cart-item";
import deleteCartItem from "./delete-cart-item";

// Import middleware
import { sessionMiddleware } from "@/middleware/user-auth";

const cart_routes = new Hono();

// Apply auth middleware to all cart routes
cart_routes.use("*", sessionMiddleware);

// Get cart items route
cart_routes.route("/", getCartItems);

// Add cart item route
cart_routes.route("/add", addCartItem);

// Update cart item route
cart_routes.route("/:id", updateCartItem);

// Delete cart item route
cart_routes.route("/:id", deleteCartItem);

export { cart_routes };
