import { type NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 },
      );
    }

    // Get user
    const userData = await redis.get(`user:${email}`);
    if (!userData) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const user = JSON.parse(userData as string);

    // Check password (in production, compare hashed passwords)
    if (user.password !== password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Create session
    const sessionId = `session:${Date.now()}`;
    await redis.setex(
      sessionId,
      86400 * 7,
      JSON.stringify({ userId: user.id, email }),
    ); // 7 days

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      message: "Login successful",
    });

    response.cookies.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
