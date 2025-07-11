"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthForm } from "@/components/auth-form";
import { FullPageLoading } from "@/components/ui/loading";
import { Session } from "next-auth";

interface HomeClientProps {
  initialSession?: Session | null;
}

export default function HomeClient({ initialSession }: HomeClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Use the session from useSession hook as it's more reliable for client-side
  const currentSession = session || initialSession;

  useEffect(() => {
    if (status !== "loading" && currentSession?.user) {
      router.replace("/workouts");
    }
  }, [currentSession, status, router]);

  // Show loading screen
  if (status === "loading") {
    return <FullPageLoading text="Loading..." />;
  }

  // Show auth form if not logged in
  if (!currentSession?.user) {
    return <AuthForm />;
  }

  // This should not render since we redirect above, but just in case
  return <FullPageLoading text="Redirecting..." />;
}
