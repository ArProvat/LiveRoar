import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const url = req.nextUrl;

  // Allow unauthenticated access to login and register
  if (url.pathname === "/user/login" || url.pathname === "/user/register") {
    return NextResponse.next();
  }

  // Protect user routes
  if (url.pathname.startsWith("/user") && !token) {
    const loginUrl = new URL("/user/login", url.origin);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*"],
};
