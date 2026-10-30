import { NextResponse, type NextRequest } from "next/server";
import { VISITOR_COOKIE, VISITOR_COOKIE_MAX_AGE } from "@/server/visitor";

// Every page is marked no-store, so a browser never keeps one to show again
// on Back: after the quick exit, Back mustn't bring back what someone typed
// about being hurt (code review finding 1)
const NO_STORE = "private, no-store, max-age=0";

// Gives every new visitor an anonymous id. It's set on the request as well as
// the response, so the page or route handling this first request can read it
export function proxy(request: NextRequest) {
  if (request.cookies.has(VISITOR_COOKIE)) return noStore(NextResponse.next());

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
  return noStore(response);
}

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", NO_STORE);
  return response;
}

export const config = {
  // Everything except build files and the icon
  matcher: ["/((?!_next/static|_next/image|icon.svg|favicon.ico).*)"],
};
