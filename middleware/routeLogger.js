import logger from "../config/logger.js";

export const setupRouteLogger = (router) => {
  return async (req, res, next) => {
    const startTime = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      logger.info({
        method: req.method,
        url: req.originalUrl || req.url,
        params: req.params,
        query: req.query,
        body: req.method !== "GET" ? req.body : undefined,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get("user-agent"),
        ip: req.ip,
      });
    });

    next();
  };
};
