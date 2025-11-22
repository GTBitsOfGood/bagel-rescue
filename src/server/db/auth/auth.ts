import { cookies } from "next/headers";
import { adminAuth } from "../firebase/admin/firebaseAdmin";
import { getUserByEmail } from "../actions/User";

export async function requireUser() {
  const cookieStore = cookies()

  const token = cookieStore.get("authToken")?.value;
  if (!token) throw new Error("Unauthorized");

  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    cookieStore.delete("authToken");
    throw new Error("Forbidden");
  }
}

export async function requireAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value;
  
  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const user = await getUserByEmail(decodedToken.email || "");
    
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    if (!user.isAdmin) {
      throw new Error("Admin access required");
    }
    
    return decodedToken;
  } catch (error) {
    if (error instanceof Error && 
        !error.message.includes("Admin access required")) {
      cookieStore.delete("authToken");
    }
    throw error;
  }
}