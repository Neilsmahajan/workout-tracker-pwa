import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id || session.user.email;
    const workoutsData = await redis.get(`workouts:${userId}`);
    const workouts = workoutsData ? JSON.parse(workoutsData as string) : [];

    return NextResponse.json({ workouts });
  } catch (error) {
    console.error("Get workouts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { workouts } = await request.json();
    const userId = session.user.id || session.user.email;

    await redis.set(`workouts:${userId}`, JSON.stringify(workouts));

    return NextResponse.json({ message: "Workouts saved successfully" });
  } catch (error) {
    console.error("Save workouts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
