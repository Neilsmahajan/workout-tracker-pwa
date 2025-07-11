import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AccountClient from "@/components/account-client";

export default async function AccountPage() {
  const session = await auth();

  // Server-side redirect for unauthenticated users
  if (!session?.user) {
    redirect("/");
  }

  // Pass session to client component
  return <AccountClient initialSession={session} />;
}
