import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Supported locales
const locales = ["fr", "en", "es", "pt", "ar", "zh", "dyu", "bci", "adj", "bet", "ati", "yac", "gou", "ak", "ald", "sef", "kxb"];
const defaultLocale = "fr";

function withSecurityHeaders(response: NextResponse, request: NextRequest) {
  // Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), xr-spatial-tracking=()");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-Download-Options", "noopen");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("X-XSS-Protection", "0"); // Enable XSS filtering (0 = disable in modern browsers, but kept for legacy)

  // HSTS in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // Enhanced Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://js.stripe.com/v3/",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.openai.com https://*.resend.com https://*.etherscan.io https://*.polygonscan.com https://api.stripe.com wss:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  // Additional security headers for API responses
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
  }

  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if the pathname has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If there's no locale and it's not a next.js asset or api route, redirect to default locale
  if (
    !pathnameHasLocale &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/static") &&
    !pathname.startsWith("/favicon.ico") &&
    !pathname.startsWith("/robots.txt") &&
    !pathname.startsWith("/sitemap.xml")
  ) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname === "/" ? "" : pathname}`, req.url)
    );
  }

  // Extract locale from pathname if present
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  const locale = pathnameIsMissingLocale ? defaultLocale : pathname.split("/")[1];

  // Set the locale in headers for downstream use
  const res = NextResponse.next();
  res.headers.set("x-locale", locale);

  const isProtected = [
    "/dashboard",
    "/api/products",
    "/api/orders",
    "/api/wallet",
    "/api/logistics/events",
    "/api/uploads",
    "/api/ai",
    "/api/admin",
    "/api/blockchain",
    "/api/courses",
    "/api/checkout",
    "/api/requests",
    "/api/trace"
  ].some(
    (prefix) =>
      pathname.startsWith(`/${locale}${prefix}`) ||
      pathname === `/${locale}${prefix}` ||
      pathname.startsWith(`${prefix}/`) ||
      pathname === prefix
  );

  if (isProtected) {
    // Securely verify the session using the JWT secret
    const session = await getToken({ req });

    if (!session) {
      if (pathname.startsWith(`/api/`)) {
        return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), req);
      }
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return withSecurityHeaders(NextResponse.redirect(loginUrl), req);
    }

    // Add user info to request headers for API routes (optional)
    if (pathname.startsWith(`/api/`) && session) {
      res.headers.set("X-User-ID", session.sub || "");
      res.headers.set("X-User-Role", (session as any).role || "");
      return withSecurityHeaders(res, req);
    }
  }

  return withSecurityHeaders(res, req);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
