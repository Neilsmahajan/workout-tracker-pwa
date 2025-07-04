import { type NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session")?.value;

    if (sessionId) {
      await redis.del(sessionId);
    }

    const response = NextResponse.json({ message: "Logged out successfully" });
    response.cookies.delete("session");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
