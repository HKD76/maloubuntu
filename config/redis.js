import Redis from "ioredis";
import logger from "./logger.js";

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: "Toto4242@#",
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

// Gestion des événements Redis
redisClient.on("connect", () => {
  logger.info("Redis: Connecté avec succès");
});

redisClient.on("error", (err) => {
  logger.error(`Redis: Erreur de connexion - ${err.message}`);
});

// Connexion initiale
try {
  await redisClient.connect();
} catch (error) {
  logger.error(`Redis: Erreur de connexion initiale - ${error.message}`);
}

export default redisClient;
