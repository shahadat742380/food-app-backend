import { Hono } from "hono";
import { cors } from "hono/cors";
import { configureAuth, AuthUser, AuthSession } from "./auth";
import { Bindings } from "./types/common";
import { createDb } from "./db";

// Import API routes
import { api_routes } from "./routes";

const app = new Hono<{ Bindings: Bindings }>();

app.use(async (c, next) => {
  const allowedOrigins = c.env.ALLOWED_ORIGINS
    ? c.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
    : [];

  const corsMiddleware = cors({
    origin: allowedOrigins,
    maxAge: 600,
    credentials: true,
  });

  return corsMiddleware(c, next);
});

app.use("*", async (c, next) => {
  const db = createDb(c.env); // Pass the whole environment object
  c.set("db", db);
  await next();
});

// Fix: Use app.route for all auth endpoints as required by Better Auth
app.on(["POST", "GET", "OPTIONS"], "/api/auth/*", async (c) => {
  console.log("auth", c.env);
  const auth = configureAuth(c.env);
  return auth.handler(c.req.raw);
});

// Apply API routes
app.route("/api", api_routes);

app.get("/", (c) => c.text("Hello Hono + Better Auth!"));

export default app;
