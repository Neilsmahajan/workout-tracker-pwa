"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthForm } from "@/components/auth-form";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && session?.user) {
      router.replace("/workouts");
    }
  }, [session, status, router]);

  // Show loading screen
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!session?.user) {
    return <AuthForm />;
  }

  // This should not render since we redirect above, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">Redirecting...</div>
    </div>
  );
}
