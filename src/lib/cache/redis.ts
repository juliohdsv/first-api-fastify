import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL ?? "redis://localhost:6379",

  socket: {
    reconnectStrategy: false,
  },
});

redis.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

try {
  await redis.connect();
} catch (error) {
  console.error("Could not connect to Redis:", error);
}

export { redis };
