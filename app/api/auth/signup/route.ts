import { type NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await redis.get(`user:${email}`);
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // Create user (in a real app, you'd hash the password)
    const user = {
      id: Date.now().toString(),
      email,
      name,
      password, // In production, hash this!
      createdAt: new Date().toISOString(),
    };

    await redis.set(`user:${email}`, JSON.stringify(user));
    await redis.set(`user_id:${user.id}`, email);

    // Create session
    const sessionId = `session:${Date.now()}`;
    await redis.setex(
      sessionId,
      86400 * 7,
      JSON.stringify({ userId: user.id, email }),
    ); // 7 days

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      message: "User created successfully",
    });

    response.cookies.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
