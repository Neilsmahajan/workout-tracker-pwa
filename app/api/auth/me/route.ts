import { type NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const sessionData = await redis.get(sessionId);
    if (!sessionData) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const session = JSON.parse(sessionData as string);
    const userData = await redis.get(`user:${session.email}`);

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = JSON.parse(userData as string);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
