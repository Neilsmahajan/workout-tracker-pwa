// This is a simple test script to check Redis connectivity and data persistence
// Load environment variables manually
require("fs")
  .readFileSync(".env.local", "utf8")
  .split("\n")
  .forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key] = value.replace(/"/g, "");
    }
  });

const { Redis } = require("@upstash/redis");

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

async function testRedis() {
  try {
    // Test basic connectivity
    console.log("Testing Redis connectivity...");

    // Set a test value
    await redis.set("test:connection", "working");

    // Get the test value
    const result = await redis.get("test:connection");
    console.log("Test result:", result);

    // List all workout keys
    const keys = await redis.keys("workouts:*");
    console.log("Found workout keys:", keys);

    // Get each workout data
    for (const key of keys) {
      const data = await redis.get(key);
      console.log(`Raw data for ${key}:`, data);
      try {
        if (typeof data === "string") {
          const parsed = JSON.parse(data);
          console.log(
            `Parsed data for ${key}:`,
            Array.isArray(parsed) ? parsed.length : "not an array",
            "workouts",
          );
        } else {
          console.log(`Data for ${key} is not a string:`, typeof data);
        }
      } catch (e) {
        console.log(`Failed to parse data for ${key}:`, e.message);
      }
    }

    // Clean up test key
    await redis.del("test:connection");

    console.log("Redis test completed successfully!");
  } catch (error) {
    console.error("Redis test failed:", error);
  }
}

testRedis();
