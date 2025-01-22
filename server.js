import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import articleRoutes from "./routes/article.routes.js";
import presentationRoutes from "./routes/presentation.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import log from "./middleware/logFunction.js";
import { setupRouteLogger } from "./middleware/routeLogger.js";
import messageEmitter from "./event.js";
import compression from "compression";
import { requestLogger, errorHandler } from "./middleware/requestLogger.js";
import logger from "./config/logger.js";
import helmet from "helmet";
import redis from "./config/redis.js";

redis();

const app = express();
dotenv.config();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(
  compression({
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return !req.path.match(/\.(jpg|jpeg|png|gif|svg|pdf|mp4)$/i);
    },
  })
);

// Configuration des logs
const ROUTES_LOG_FILE = "logs/routes.log";

// Middleware pour la rotation des logs
app.use((req, res, next) => {
  log.rotateLog(ROUTES_LOG_FILE);
  logger.info(`Requete ${req.method} - IP: ${req.ip} - URL: ${req.url}`);
  messageEmitter.emit("message", req.url);
  next();
});

Redis.on("connect", (err) => {
  logger.info("Connected to Redis");
});
Redis.on("error", (err) => {
  logger.error("Error connecting to Redis", err);
});

// Configuration du logger pour toutes les routes
app.use(setupRouteLogger(express.Router(), ROUTES_LOG_FILE));

// Ajout du middleware de logging
app.use(requestLogger);

// Routes de l'application
app.use("/api/articles", articleRoutes);
app.use("/api/presentations", presentationRoutes);
app.use("/api/invoices", invoiceRoutes);

// Gestion des erreurs
app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("Connected to MongoDB");
    messageEmitter.emit("message", "Connected to MongoDB");
  })
  .catch((err) => {
    logger.crit("MongoDB connection error", err);
    messageEmitter.emit("message", "MongoDB connection error");
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  log.writeLog("logs/server2.log", "Server is running");
  messageEmitter.emit("message", `Server is running on port ${PORT}`);
  logger.info(`Server running on port ${PORT}`);
});
