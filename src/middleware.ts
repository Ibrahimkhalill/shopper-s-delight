import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth?: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl;

  // ── Admin protection ──────────────────────────────────────────────────────
  // Every /admin/* route (except login) requires an authenticated ADMIN session
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = req.auth;
    if (!session || session.user?.role !== "ADMIN") {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  // Run middleware on admin routes and API routes (skip static files)
  matcher: ["/admin/:path*", "/api/:path*"],
};
