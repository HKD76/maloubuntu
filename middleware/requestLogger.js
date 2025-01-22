import logger from "../config/logger.js";
import nodemailer from "nodemailer";

// Configuration email (à mettre dans .env en production)
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendCriticalErrorEmail = async (error) => {
  try {
    await transporter.sendMail({
      from: '"System Monitor" <hugocadet76750@gmail.com>',
      to: "darkjador76@gmail.com",
      subject: "ERREUR CRITIQUE DÉTECTÉE",
      text: `Une erreur critique est survenue:\n${error.stack}`,
      html: `<p>Une erreur critique est survenue:</p><pre>${error.stack}</pre>`,
    });
  } catch (emailError) {
    logger.error(`Échec d'envoi d'email: ${emailError}`);
  }
};

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 500) {
      logger.error(message);
      if (res.statusCode >= 500) {
        sendCriticalErrorEmail(new Error(message));
      }
    } else if (res.statusCode >= 400) {
      logger.warning(message);
    } else {
      logger.info(message);
    }
  });

  next();
};

export const errorHandler = (err, req, res, next) => {
  const errorMessage = `${err.name}: ${err.message}\nStack: ${err.stack}`;

  if (err.name === "TypeError" || err.name === "ReferenceError") {
    logger.crit(errorMessage);
    sendCriticalErrorEmail(err);
  } else {
    logger.error(errorMessage);
  }

  res.status(500).json({ message: "Une erreur est survenue" });
};
