import { type NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

function isProtectedRoute(req: NextRequest) {
  switch (req.nextUrl.pathname) {
    case "/":
    case "/favorites":
    case "/auth/callback":
      return true;
  }

  return false;
}

const getPathName = (req: NextRequest) => req.nextUrl.pathname;

export async function middleware(req: NextRequest) {
  return await auth0.middleware(req);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
