import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/restaurant",
  "/settings",
  "/qr-codes",
  "/qr-code",
  "/categories",
  "/qr-kit",
  "/coupons",
  "/analytics",
  "/subscription",
];

// Routes that authenticated users should be redirected away from
const authRoutes = ["/sign-in", "/sign-up", "/login", "/register", "/forgot-password", "/reset-password"];

// Better Auth session cookie name (default)
const SESSION_COOKIE = "better-auth.session_token";
const ADMIN_COOKIE = "admin_session_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routing logic
  if (pathname.startsWith("/admin")) {
    const adminCookie = request.cookies.get(ADMIN_COOKIE);
    const isAdminLoggedIn = !!adminCookie?.value;

    if (pathname === "/admin/login") {
      if (isAdminLoggedIn) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    if (!isAdminLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  // The dashboard menu editor is at /menu (exact), but public customer menus are at /menu/[slug]
  // So we protect /menu exactly, but leave /menu/anything accessible publicly
  const isDashboardMenu = pathname === "/menu";

  const isProtectedRoute =
    isDashboardMenu ||
    protectedRoutes.some((route) => pathname.startsWith(route));

  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check for session cookie — lightweight, no Node.js crypto needed
  const sessionCookie =
    request.cookies.get(SESSION_COOKIE) ||
    request.cookies.get("__Secure-better-auth.session_token");

  const isLoggedIn = !!sessionCookie?.value;

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - api routes (handled server-side, can use Node.js)
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico and static assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
