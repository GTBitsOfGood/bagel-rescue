"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { activationLogin } from "@/server/db/actions/Login";

export default function ActivatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Invalid activation link");
      return;
    }

    const activateAccount = async () => {
      const res = await activationLogin(token);
      if (res.success) {
        router.push("/VolunteerNavView/Homepage");
      } else {
        setError("Failed to activate account/login");
      }
    };

    activateAccount();
  }, [searchParams, router]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return <div>Activating your account...</div>;
}
