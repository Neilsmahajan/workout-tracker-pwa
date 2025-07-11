"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AccountMenu } from "@/components/account-menu";
import { AuthForm } from "@/components/auth-form";
import { FullPageLoading } from "@/components/ui/loading";
import { User } from "@/lib/types";
import { Session } from "next-auth";

interface AccountClientProps {
  initialSession?: Session | null;
}

export default function AccountClient({ initialSession }: AccountClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Use the session from useSession hook, fallback to initial session
  const currentSession = session || initialSession;

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  // Show loading screen only if we don't have initial session and still loading
  if (status === "loading" && !initialSession) {
    return <FullPageLoading text="Loading account..." />;
  }

  // Show auth form if not logged in
  if (!currentSession?.user) {
    return <AuthForm />;
  }

  // Convert session user to our User type
  const user: User = {
    id: currentSession.user.email || "",
    name: currentSession.user.name || "",
    email: currentSession.user.email || "",
  };

  return (
    <AccountMenu
      user={user}
      onLogout={handleLogout}
      onBack={() => router.push("/workouts")}
    />
  );
}
