import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/server/db/firebase/admin/firebaseAdmin";
import { getUserByEmail, createUser } from "@/server/db/actions/User";
import { IUser } from "@/server/db/models/User";

export async function POST(req: Request) {
  try {
    const { token, email } = await req.json();

    if (!token || !email) {
      return NextResponse.json(
        { error: "Token and email are required" },
        { status: 400 }
      );
    }

    // Verify the Firebase token
    const decoded = await adminAuth.verifyIdToken(token);
    
    if (decoded.email !== email) {
      return NextResponse.json(
        { error: "Email mismatch" },
        { status: 400 }
      );
    }

    // Check if user exists in database (whitelisted)
    let user;
    try {
      user = await getUserByEmail(email);
    } catch (error) {
      if (error instanceof Error && error.message.includes("User with that email")) {
        return NextResponse.json(
          { 
            success: false,
            error: "Email not whitelisted. Please contact an admin to add your email." 
          },
          { status: 403 }
        );
      } else {
        console.error("Error getting user by email:", error);
        return NextResponse.json(
          { error: "Error getting user by email" },
          { status: 500 }
        );
      }
    }

    if (!user?.isAdmin && user?.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: "Account not activated. Please check your email for activation link.",
        },
        { status: 403 }
      );
    }

    cookies().set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    const role = user.isAdmin;

    return NextResponse.json({ 
      success: true, 
      isAdmin: role,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error("Google login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}