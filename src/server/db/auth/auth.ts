import { cookies } from "next/headers";
import { adminAuth } from "../firebase/admin/firebaseAdmin";
import { getUserByEmail } from "../actions/User";

export async function requireUser() {
  const token = cookies().get("authToken")?.value;
  if (!token) throw new Error("Unauthorized");

  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    throw new Error("Forbidden");
  }
}

export async function requireAdmin() {
  const cookieStore = cookies()
  const token = cookieStore.get("authToken")?.value;
  if (!token) throw new Error("Unauthorized");

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const user = await getUserByEmail(decodedToken.email || "");
    if (!user || !user.isAdmin) {
      throw new Error("Unauthorized");
    }
    
    return decodedToken;
  } catch (error) {
    cookieStore.delete("authToken");

    if (error instanceof Error && error.message.includes("Admin access required")) {
      throw error;
    }
    throw new Error("Forbidden");
  }
}
