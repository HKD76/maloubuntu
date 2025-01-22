import Article from "../model/Article.js";
import logger from "../config/logger.js";
import Redis from "ioredis";

const CACHE_DURATION = 3600; // 1 heure en secondes

const redisClient = new Redis({
  host: "127.0.0.1",
  port: 6379,
  password: "Toto4242@#",
});

redisClient.on("connect", () => {
  logger.info("Connexion à Redis établie avec succès");
});

redisClient.on("error", (error) => {
  logger.error(`Erreur de connexion Redis: ${error}`);
});

export const getArticles = async (req, res) => {
  try {
    const cacheKey = "articles";
    let cachedArticles = null;

    try {
      cachedArticles = await redisClient.get(cacheKey);
    } catch (redisError) {
      handleRedisError(redisError);
    }

    if (cachedArticles) {
      logger.info("Articles récupérés depuis le cache Redis");
      return res.status(200).json(JSON.parse(cachedArticles));
    }

    const articles = await Article.find({});

    try {
      await redisClient.setex(
        cacheKey,
        CACHE_DURATION,
        JSON.stringify(articles)
      );
      logger.info("Articles mis en cache Redis");
    } catch (redisError) {
      handleRedisError(redisError);
    }

    return res.status(200).json(articles);
  } catch (error) {
    logger.error(
      `Erreur lors de la récupération des articles: ${error.message}`
    );
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des articles",
      error: error.message,
    });
  }
};

export const createArticle = async (req, res) => {
  try {
    const newArticle = new Article(req.body);
    const savedArticle = await newArticle.save();

    // Invalider le cache après création
    await redisClient.del("articles");
    logger.info("Cache articles invalidé après création");

    return res.status(201).json({
      success: true,
      message: "Article créé avec succès",
      data: savedArticle,
    });
  } catch (error) {
    logger.error(`Erreur lors de la création de l'article: ${error.message}`);
    return res.status(400).json({
      success: false,
      message: "Erreur lors de la création de l'article",
      error: error.message,
    });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedArticle = await Article.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedArticle) {
      logger.warn(`Article non trouvé pour l'ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Article non trouvé",
      });
    }

    // Invalider le cache après mise à jour
    await redisClient.del("articles");
    logger.info("Cache articles invalidé après mise à jour");

    return res.status(200).json({
      success: true,
      message: "Article mis à jour avec succès",
      data: updatedArticle,
    });
  } catch (error) {
    logger.error(
      `Erreur lors de la mise à jour de l'article: ${error.message}`
    );
    return res.status(400).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'article",
      error: error.message,
    });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedArticle = await Article.findByIdAndDelete(id);

    if (!deletedArticle) {
      logger.warn(`Article non trouvé pour l'ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Article non trouvé",
      });
    }

    // Invalider le cache après suppression
    await redisClient.del("articles");
    logger.info("Cache articles invalidé après suppression");

    return res.status(200).json({
      success: true,
      message: "Article supprimé avec succès",
    });
  } catch (error) {
    logger.error(
      `Erreur lors de la suppression de l'article: ${error.message}`
    );
    return res.status(400).json({
      success: false,
      message: "Erreur lors de la suppression de l'article",
      error: error.message,
    });
  }
};
