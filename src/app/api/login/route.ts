import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/server/db/firebase/admin/firebaseAdmin";
import { getUserByEmail, updateUser } from "@/server/db/actions/User";

export async function POST(req: Request) {
  const { token } = await req.json();

  const decoded = await adminAuth.verifyIdToken(token);

  var role = "volunteer";
  if (decoded.email) {
    const user = await getUserByEmail(decoded.email);

    if (!user?.isAdmin && user?.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Account not activated. Please check your email for activation link.",
        },
        { status: 403 }
      );
    }
    role = user!.isAdmin ? "admin" : "volunteer";
  }

  cookies().set("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ success: true, isAdmin: role });
}
