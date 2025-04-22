// **Import core packages
import { createMiddleware } from "hono/factory";

// ** Import auth configuration
import { configureAuth } from "@/auth";

/**
 * Middleware to check and validate user session.
 *
 * This middleware verifies if a session is available for the incoming request.
 * If a valid session is found, it attaches the user and session details to the request context (`c`).
 * Otherwise, it returns a 401 Unauthorized response.
 *
 * @param {import("hono").Context} c - The context object representing the request and response.
 * @param {Function} next - The function to call the next middleware in the chain.
 * @returns {Promise<void>} Resolves when the middleware completes execution.
 */



export const sessionMiddleware = createMiddleware(async (c, next) => {
  try {
    const auth = configureAuth(c.env);

    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json(
        {
          success: false,
          message: "Unauthorized: Session not available",
        },
        401,
      );
    }

    // Ensure that image is always a string
    const user = session.user;
    const safeUser = {
      ...user,
      image: user.image ?? "",
    };

    //@ts-ignore
    c.set("user", safeUser);
    c.set("session", session.session);
    await next();
  } catch (error) {
    console.error("Error fetching session:", error);
    return c.json(
      { message: "An error occurred while processing the session." },
      500,
    );
  }
});
