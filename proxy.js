import { NextResponse } from "next/server";

// Pure JS decoding of JWT payload (safe for Edge runtime)
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    // Decode base64 to string using atob
    const raw = atob(base64);
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  
  // Exclude API routes, public assets, and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get("bureau_token");
  const token = tokenCookie ? tokenCookie.value : null;
  const user = token ? parseJwt(token) : null;
  const isAuthenticated = user && user.exp * 1000 > Date.now();

  // 1. Unauthenticated users trying to access protected routes
  if (!isAuthenticated) {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 2. Authenticated Admin routing rules
  if (user.role === "admin") {
    if (pathname.startsWith("/dashboard") || pathname === "/login" || pathname === "/signup") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 3. Authenticated Citizen routing rules
  if (user.role !== "admin") {
    if (pathname.startsWith("/admin") || pathname === "/login" || pathname === "/signup") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/signup"
  ],
};
