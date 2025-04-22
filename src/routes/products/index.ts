import { Hono } from "hono";

// Import routes
import getAllProducts from "./get-all-products";
import getPopularProducts from "./get-popular-products";
import getSingleProduct from "./get-single-product";
import createProduct from "./create-product";

const products_routes = new Hono();

// All products routes
products_routes.route("/", getAllProducts);

// Popular products route
products_routes.route("/popular", getPopularProducts);

// Create product route
products_routes.route("/create", createProduct);

// Single product route
products_routes.route("/:id", getSingleProduct);

export { products_routes };
