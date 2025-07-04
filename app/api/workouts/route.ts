import { type NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

async function getUser(request: NextRequest) {
  const sessionId = request.cookies.get("session")?.value;
  if (!sessionId) return null;

  const sessionData = await redis.get(sessionId);
  if (!sessionData) return null;

  return JSON.parse(sessionData as string);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const workoutsData = await redis.get(`workouts:${user.userId}`);
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
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { workouts } = await request.json();

    await redis.set(`workouts:${user.userId}`, JSON.stringify(workouts));

    return NextResponse.json({ message: "Workouts saved successfully" });
  } catch (error) {
    console.error("Save workouts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
