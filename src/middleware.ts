import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "./server/db/actions/User";
import { adminAuth } from "./server/db/firebase/admin/firebaseAdmin";
import { jwtDecode } from "jwt-decode";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const token = await req.cookies.get("authToken")?.value;

  if (
    pathname.startsWith("/Login") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/activate")
  ) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/Login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images/).*)"],
};
