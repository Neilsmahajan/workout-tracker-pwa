"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthForm } from "@/components/auth-form";
import { FullPageLoading } from "@/components/ui/loading";

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
    return <FullPageLoading text="Loading..." />;
  }

  // Show auth form if not logged in
  if (!session?.user) {
    return <AuthForm />;
  }

  // This should not render since we redirect above, but just in case
  return <FullPageLoading text="Redirecting..." />;
}
