import Redis from "ioredis";
import logger from "./logger.js";

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || "Toto4242@#",
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

Redis.on("connect", () => {
  logger.info("Connected to Redis");
});

Redis.on("error", (err) => {
  logger.error("Redis connection error:", err);
});

export default redisClient;
