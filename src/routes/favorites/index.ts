import { Hono } from "hono";

// Import routes
import getFavorites from "./get-favorites";
import addFavorite from "./add-favorite";
import deleteFavorite from "./delete-favorite";

// Import middleware
import { sessionMiddleware } from "@/middleware/user-auth";

const favorites_routes = new Hono();

// Apply auth middleware to all favorites routes
favorites_routes.use("*", sessionMiddleware);

// Get favorites route
favorites_routes.route("/", getFavorites);

// Add favorite route
favorites_routes.route("/add", addFavorite);

// Delete favorite route
favorites_routes.route("/:productId", deleteFavorite);

export { favorites_routes };
