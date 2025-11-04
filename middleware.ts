import { NextResponse, type NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";
import { redirect } from "next/dist/server/api-utils";

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
  // console.log("is protected", isProtectedRoute(request));

  const session = await auth0.getSession(req);
  if (getPathName(req) === "/auth/callback") {
    console.log("ON CALLBACK");
    console.log("SESSION IS", session);

  }

  if (isProtectedRoute(req) && !session) {
    // return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  const res = await auth0.middleware(req);
  // console.log("RES IS", res); 
  return res;
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
