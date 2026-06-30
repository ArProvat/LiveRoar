export const config = {
  matcher: ["/user/:path*", "/admin/:path*"],
};

export default function middleware(req) {
  const token = req.cookies.get("access_token");
  const url = req.nextUrl;

  if (url.pathname.startsWith("/user") && !token) {
    const loginUrl = new URL("/user/login", url);
    return Response.redirect(loginUrl);
  }

  return NextResponse.next();
}
