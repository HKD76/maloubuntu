import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import articleRoutes from "./routes/article.routes.js";
import presentationRoutes from "./routes/presentation.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import log from "./middleware/logFunction.js";
import { setupRouteLogger } from "./middleware/routeLogger.js";
import messageEmitter from "./event.js";

const app = express();
dotenv.config();

app.use(bodyParser.json());

// Configuration des logs
const ROUTES_LOG_FILE = "routes.log";

// Middleware pour la rotation des logs
app.use((req, res, next) => {
  log.rotateLog(ROUTES_LOG_FILE);
  messageEmitter.emit("message", req.url);
  next();
});

// Configuration du logger pour toutes les routes
app.use(setupRouteLogger(express.Router(), ROUTES_LOG_FILE));

// Routes de l'application
app.use("/api/article", articleRoutes);
app.use("/api/presentation", presentationRoutes);
app.use("/api/invoice", invoiceRoutes);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3001, () => {
  log.writeLog("server2.log", "Server is running");
  messageEmitter.emit("message", "Server is running");
  console.log("Running on port 3000");
});
