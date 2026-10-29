import { NextResponse, type NextRequest } from "next/server";
import { VISITOR_COOKIE, VISITOR_COOKIE_MAX_AGE } from "@/server/visitor";

// Gives every new visitor an anonymous id. It's set on the request as well as
// the response, so the page or route handling this first request can read it
export function proxy(request: NextRequest) {
  if (request.cookies.has(VISITOR_COOKIE)) return NextResponse.next();

  const visitorId = crypto.randomUUID();
  request.cookies.set(VISITOR_COOKIE, visitorId);

  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: VISITOR_COOKIE_MAX_AGE,
  });
  return response;
}

export const config = {
  // Everything except build files and the icon
  matcher: ["/((?!_next/static|_next/image|icon.svg|favicon.ico).*)"],
};
