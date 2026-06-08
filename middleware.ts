import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Route guard.
 *
 * Two rules:
 *  1. No session → the dashboard (and any /dashboard/* route) bounces to /login.
 *  2. Has session → the user is confined to the app. Any route outside the
 *     allowed prefixes below redirects back to /dashboard. The only way "out"
 *     is to log out, which clears the session cookie and lifts the lock.
 *
 * This is an optimistic cookie-presence check for fast edge redirects; the
 * dashboard layout still calls `auth.api.getSession` as the authoritative
 * check (handles expired/invalid sessions), so this never weakens security.
 */

// Prefixes an authenticated user is allowed to stay on.
const AUTHED_ALLOWED_PREFIXES = ["/dashboard", "/onboarding"];

// Auth pages always pass through. A session COOKIE can be present but invalid
// (expired, or the account was just deleted) - `getSessionCookie` only checks
// presence. If we bounced these to /dashboard, the dashboard's authoritative
// `getSession` would bounce back to /login, looping forever. Letting them
// through lets the page's real session check clear the mismatch. A genuinely
// valid session is still redirected to /dashboard by the page itself.
const AUTH_PAGES = ["/login", "/signup", "/register"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(getSessionCookie(request));

  if (hasSession) {
    // Locked into the app: stay on allowed app routes, let auth pages resolve
    // themselves, and redirect everything else (marketing) to /dashboard.
    if (
      matchesPrefix(pathname, AUTHED_ALLOWED_PREFIXES) ||
      matchesPrefix(pathname, AUTH_PAGES)
    ) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // No session: protect the dashboard.
  if (matchesPrefix(pathname, ["/dashboard"])) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except API routes, Next internals, and static files
  // (any path containing a dot, e.g. .svg/.png/.css).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
