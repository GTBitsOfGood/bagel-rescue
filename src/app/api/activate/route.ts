import { NextResponse } from "next/server";
import { adminAuth } from "@/server/db/firebase/admin/firebaseAdmin";
import { getUserByActivationToken, updateUser } from "@/server/db/actions/User";

export async function POST(req: Request) {
  try {
    const { authToken } = await req.json();
    if (!authToken)
      return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const user = await getUserByActivationToken(authToken);
    if (!user)
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });

    const firebaseUid = user.firebaseUid;
    if (!firebaseUid)
      return NextResponse.json(
        { error: "User missing firebaseUid" },
        { status: 500 }
      );

    const uid = user._id!.toString();
    await updateUser(uid, {
      status: "ACTIVE",
      $unset: { activationToken: 1 },
    });

    const firebaseToken = await adminAuth.createCustomToken(firebaseUid);

    return NextResponse.json({ firebaseToken });
  } catch (err) {
    console.error("Activation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
