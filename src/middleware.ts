import { NextRequest, NextResponse } from "next/server";
export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const token = await req.cookies.get("authToken")?.value;

  if (
    pathname.startsWith("/Login") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/activate") ||
    pathname.startsWith("/icon.png")
  ) {
    return NextResponse.next();
  }

  if (!token) return NextResponse.redirect(new URL("/Login", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images/).*)"],
};
