import Redis from "ioredis";
import logger from "./logger.js";

const REDIS_RETRY_MAX = 5;
let retryCount = 0;

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || "Toto4242@#",
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times) => {
    if (times > REDIS_RETRY_MAX) {
      logger.error(`Redis: Maximum de tentatives atteint (${REDIS_RETRY_MAX})`);
      return null;
    }
    const delay = Math.min(times * 100, 3000);
    logger.warn(
      `Redis: Reconnexion dans ${delay}ms (${times}/${REDIS_RETRY_MAX})`
    );
    return delay;
  },
});

redisClient.on("connect", () => {
  retryCount = 0;
  logger.info("Redis: Connecté");
});

redisClient.on("error", (err) => {
  logger.error(`Redis: Erreur - ${err.message}`);
});

redisClient.on("ready", () => {
  logger.info("Redis: Prêt à recevoir des commandes");
});

redisClient.on("reconnecting", () => {
  retryCount++;
  logger.warn(`Redis: Tentative de reconnexion ${retryCount}`);
});

process.on("SIGINT", async () => {
  await redisClient.quit();
  logger.info("Redis: Connexion fermée proprement");
  process.exit(0);
});

export default redisClient;
