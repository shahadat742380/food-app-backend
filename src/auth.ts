// ** Import third party library
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin,  phoneNumber } from "better-auth/plugins";

// ** Import database schema
import * as schema from "@/db/schema"; // Your database schema

// ** Import types
import { Env } from "@/types/common";

// ** Import send email function

// ** Import check user role function

// ** Import config
import { createDb } from "./db";

export function configureAuth(env: Env) {
  const providers = ["google"];
  const db = createDb(env);

  const configuredProviders = providers.reduce<
    Record<string, { clientId: string; clientSecret: string }>
  >((acc, provider) => {
    const id = env[`${provider.toUpperCase()}_CLIENT_ID`];
    const secret = env[`${provider.toUpperCase()}_CLIENT_SECRET`];

    if (id && secret) {
      acc[provider] = { clientId: id, clientSecret: secret };
    }
    return acc;
  }, {});

  const isProduction = env.NODE_ENV === "production";
  const baseURL = env.BETTER_AUTH_URL;

  const trustedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
    : [];

  return betterAuth({
    baseURL,
    secret: env.BETTER_AUTH_SECRET,
    socialProviders: configuredProviders,
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      minPasswordLength: 8,
    },
    user: {
      deleteUser: {
        enabled: true,
      },
      additionalFields: {
        bio: {
          type: "string",
          required: false,
        },
        email_notification: {
          type: "boolean",
          required: false,
        },
        two_factor: {
          type: "boolean",
          required: false,
        },
      },
    },
    trustedOrigins,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: schema,
    }),
    plugins: [
      admin(),
      phoneNumber({
        sendOTP: ({ phoneNumber, code }, request) => {
          // Implement sending OTP code via SMS
        },
      }),
    ],
    advanced: {
      cookiePrefix: "food-app",
      cookies: isProduction
        ? {
            session_token: {
              name: "session_token",
              attributes: {
                sameSite: "none",
                secure: isProduction,
                httpOnly: true,
                path: "/",
              },
            },
          }
        : undefined,
      crossSubDomainCookies: isProduction
        ? {
            enabled: isProduction,
            domain: ".peacockindia.in",
          }
        : undefined,
      useSecureCookies: isProduction,
    },
  });
}

// Explicitly export user and session types for use in other files
export type { User as AuthUser, Session as AuthSession } from "better-auth";

