"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { activateUserAccount } from "@/server/db/actions/Login";

function ActivationContent() {
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
      try {
        await activateUserAccount(token);
        router.push("/Login");
      } catch (err) {
        setError("Activation failed. Please try again.");
      }
    };

    activateAccount();
  }, [searchParams, router]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return <div>Activating your account...</div>;
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActivationContent />
    </Suspense>
  );
}