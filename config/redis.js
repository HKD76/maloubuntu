import Redis from "ioredis";
import logger from "./logger.js";

const REDIS_RETRY_MAX = 5;
let retryCount = 0;

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: "Toto4242@#",
  retryStrategy: (times) => {
    if (times > REDIS_RETRY_MAX) {
      logger.error(
        `Redis: Nombre maximum de tentatives (${REDIS_RETRY_MAX}) atteint`
      );
      return null; // Arrête les tentatives
    }
    const delay = Math.min(times * 100, 3000);
    logger.warn(
      `Redis: Tentative de reconnexion dans ${delay}ms (${times}/${REDIS_RETRY_MAX})`
    );
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  showFriendlyErrorStack: process.env.NODE_ENV !== "production",
});

redisClient.on("connect", () => {
  retryCount = 0;
  logger.info("Redis: Connecté avec succès");
});

redisClient.on("error", (err) => {
  logger.error(`Redis: Erreur de connexion - ${err.message}`);
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
