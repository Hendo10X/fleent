import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@/db";

const baseURL = process.env.BETTER_AUTH_URL?.trim();
const googleRedirectURI =
  process.env.GOOGLE_REDIRECT_URI?.trim() ??
  (baseURL ? `${baseURL}/api/auth/callback/google` : undefined);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID?.trim() ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "",
      redirectURI: googleRedirectURI,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
});
