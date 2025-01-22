import winston from "winston";
import "winston-daily-rotate-file";

const customFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  format: customFormat,
  transports: [
    // Logs HTTP
    new winston.transports.DailyRotateFile({
      filename: "logs/http/access-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "info",
      maxSize: "20m",
      maxFiles: "14d",
    }),
    // Logs d'application
    new winston.transports.DailyRotateFile({
      filename: "logs/app/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "info",
      maxSize: "20m",
      maxFiles: "14d",
    }),
    // Logs d'erreurs
    new winston.transports.DailyRotateFile({
      filename: "logs/errors/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
      maxFiles: "30d",
    }),
    // Logs de sécurité
    new winston.transports.DailyRotateFile({
      filename: "logs/security/security-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "warn",
      maxSize: "20m",
      maxFiles: "30d",
    }),
    // Logs système
    new winston.transports.DailyRotateFile({
      filename: "logs/system/system-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "info",
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: "logs/crashes/crash-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
});

// Ajout du transport console en développement
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), customFormat),
    })
  );
}

export default logger;
