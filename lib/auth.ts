import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@/db";

const baseURL = process.env.BETTER_AUTH_URL?.trim();
const googleRedirectURI =
  process.env.GOOGLE_REDIRECT_URI?.trim() ??
  (baseURL ? `${baseURL}/api/auth/callback/google` : undefined);

// Session lifetime — kept in one place so it's easy to tune.
//
//   expiresIn  → hard cap on a session's age. Beyond this, the cookie is
//                rejected and the user is bounced back to the login form.
//   updateAge  → "rolling refresh" window. If the user is active within this
//                window, the expiry timestamp is pushed forward. With
//                expiresIn=3d / updateAge=1d, an active user stays signed
//                in indefinitely, but an inactive user is forced to
//                re-authenticate after 3 days.
//
// The previous (default) config kept sessions alive for 7 days with no
// effective ceiling — so visiting `/login` after weeks away would silently
// redirect straight to `/dashboard` instead of presenting a sign-in form.
const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 3; // 3 days
const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24; // 1 day

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
  session: {
    expiresIn: SESSION_EXPIRES_IN_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
    // Short in-memory cache so a single request that calls `getSession`
    // multiple times (server components + route handlers in one render)
    // only hits the DB once.
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
});
