import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Always use email as the consistent user identifier
    const userId = session.user.email;
    console.log(`Loading workouts for user: ${userId}`);

    const workoutsData = await redis.get(`workouts:${userId}`);
    let workouts = [];

    if (workoutsData) {
      // Handle both string and object data
      if (typeof workoutsData === "string") {
        workouts = JSON.parse(workoutsData);
      } else if (Array.isArray(workoutsData)) {
        workouts = workoutsData;
      } else {
        console.log("Unexpected data type:", typeof workoutsData);
        workouts = [];
      }
    }

    console.log(`Found ${workouts.length} workouts for user: ${userId}`);
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
    // Always use email as the consistent user identifier
    const userId = session.user.email;

    console.log(`Saving ${workouts.length} workouts for user: ${userId}`);

    // Store as JSON string to ensure consistency
    await redis.set(`workouts:${userId}`, JSON.stringify(workouts));

    console.log(`Successfully saved workouts for user: ${userId}`);
    return NextResponse.json({ message: "Workouts saved successfully" });
  } catch (error) {
    console.error("Save workouts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
