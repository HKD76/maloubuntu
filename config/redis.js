import Redis from "ioredis";
import logger from "./logger.js";

const redisClient = new Redis({
  host: "127.0.0.1",
  port: 6379,
  password: "Toto4242@#",
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on("connect", () => {
  logger.info("Connexion à Redis établie avec succès");
});

redisClient.on("error", (error) => {
  logger.error(`Erreur de connexion Redis: ${error}`);
});

export const handleRedisError = (error) => {
  logger.error(`Erreur Redis: ${error}`);
};

export default redisClient;
