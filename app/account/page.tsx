"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AccountMenu } from "@/components/account-menu";
import { AuthForm } from "@/components/auth-form";
import { User } from "@/lib/types";
import { FullPageLoading } from "@/components/ui/loading";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  // Show loading screen
  if (status === "loading") {
    return <FullPageLoading />;
  }

  // Show auth form if not logged in
  if (!session?.user) {
    return <AuthForm />;
  }

  // Convert session user to our User type
  const user: User = {
    id: session.user.email || "",
    name: session.user.name || "",
    email: session.user.email || "",
  };

  return (
    <AccountMenu
      user={user}
      onLogout={handleLogout}
      onBack={() => router.push("/workouts")}
    />
  );
}
