import fs from "fs";

export const setupRouteLogger = (router, logFileName) => {
  return async (req, res, next) => {
    const startTime = Date.now();

    // Intercepter la méthode res.json pour capturer le code de statut
    const originalJson = res.json;
    res.json = function (data) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      const logDetails = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl || req.url,
        params: req.params,
        query: req.query,
        body: req.method !== "GET" ? req.body : undefined,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get("user-agent"),
        ip: req.ip,
      };

      const logMessage = `${JSON.stringify(logDetails, null, 2)}\n---\n`;

      fs.appendFile(logFileName, logMessage, (err) => {
        if (err) console.error("Erreur de logging:", err);
      });

      originalJson.call(this, data);
    };

    next();
  };
};
