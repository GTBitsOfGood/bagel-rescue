import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/server/db/firebase/admin/firebaseAdmin";
import { getUserByEmail } from "@/server/db/actions/User";

export async function POST(req: Request) {
  const { token } = await req.json();

  const decoded = await adminAuth.verifyIdToken(token);

  var role = "volunteer"
  if (decoded.email) {
    const user = await getUserByEmail(decoded.email)
    role = user!.isAdmin ? "admin" : "volunteer";
  }


  cookies().set("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });


  return NextResponse.json({ success: true, isAdmin: role});
}