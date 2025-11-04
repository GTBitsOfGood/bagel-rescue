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
  const cookieStore = cookies()
  const token = cookieStore.get("authToken")?.value;
  if (!token) throw new Error("Unauthorized");

  console.log("Authorized??");

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const user = await getUserByEmail(decodedToken.email || "");
    console.log("user: ", user);
    if (!user || !user.isAdmin) {
      throw new Error("Unauthorized");
    }
    
    return decodedToken;
  } catch (error) {
    cookieStore.delete("authToken");

    if (error instanceof Error && error.message.includes("Admin access required")) {
      throw error;
    }
    console.log("Error: ", error);
    throw new Error("Forbidden");
  }
}
