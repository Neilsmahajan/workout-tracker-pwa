import { auth } from "@/auth";
import { redirect } from "next/navigation";
import HomeClient from "@/components/home-client";

export default async function HomePage() {
  const session = await auth();

  // Server-side redirect for authenticated users
  if (session?.user) {
    redirect("/workouts");
  }

  // Pass session to client component for faster initial render
  return <HomeClient initialSession={session} />;
}
