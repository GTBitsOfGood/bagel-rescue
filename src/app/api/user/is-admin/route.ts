import { NextResponse } from "next/server";
import { requireUser } from "@/server/db/auth/auth";
import { getUserByEmail } from "@/server/db/actions/User";

/**
 * Safe endpoint to check if the current authenticated user is an admin.
 * This endpoint requires authentication but only returns the admin status,
 * not sensitive user data.
 */
export async function GET() {
  try {
    const decodedToken = await requireUser();
    
    if (!decodedToken.email) {
      return NextResponse.json(
        { isAdmin: false, error: "No email in token" },
        { status: 401 }
      );
    }

    const user = await getUserByEmail(decodedToken.email);
    
    return NextResponse.json({ 
      isAdmin: user?.isAdmin || false,
      success: true 
    });
  } catch (error) {
    // If requireUser throws, user is not authenticated
    return NextResponse.json(
      { isAdmin: false, success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}

