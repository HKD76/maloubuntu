import Language from "../model/Language.js";
import redis from "../config/redis.js";
import logger from "../config/logger.js";

const CACHE_DURATION = 3600; // 1 heure

export const getLanguages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const cacheKey = `languages:page${page}:limit${limit}`;
    let cachedData = await redis.client.get(cacheKey);

    if (cachedData) {
      logger.info("Langages récupérés depuis le cache Redis");
      return res.status(200).json(JSON.parse(cachedData));
    }

    const totalItems = await Language.countDocuments();
    const languages = await Language.find()
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const result = {
      languages,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    };

    await redis.client.setex(cacheKey, CACHE_DURATION, JSON.stringify(result));
    logger.info("Langages mis en cache Redis");

    res.status(200).json(result);
  } catch (error) {
    logger.error(
      `Erreur lors de la récupération des langages: ${error.message}`
    );
    res.status(500).json({ message: error.message });
  }
};

export const getLanguageById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `language:${id}`;

    let cachedLanguage = await redis.client.get(cacheKey);
    if (cachedLanguage) {
      return res.status(200).json(JSON.parse(cachedLanguage));
    }

    const language = await Language.findById(id);
    if (!language) {
      return res.status(404).json({ message: "Langage non trouvé" });
    }

    await redis.client.setex(
      cacheKey,
      CACHE_DURATION,
      JSON.stringify(language)
    );
    res.status(200).json(language);
  } catch (error) {
    logger.error(`Erreur lors de la récupération du langage: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

export const createLanguage = async (req, res) => {
  try {
    const language = new Language(req.body);
    const savedLanguage = await language.save();
    await invalidateLanguageCache();
    res.status(201).json(savedLanguage);
  } catch (error) {
    logger.error(`Erreur lors de la création du langage: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

export const updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const language = await Language.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!language) {
      return res.status(404).json({ message: "Langage non trouvé" });
    }

    await invalidateLanguageCache(id);
    res.status(200).json(language);
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour du langage: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

export const deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const language = await Language.findByIdAndDelete(id);

    if (!language) {
      return res.status(404).json({ message: "Langage non trouvé" });
    }

    await invalidateLanguageCache(id);
    res.status(200).json({ message: "Langage supprimé avec succès" });
  } catch (error) {
    logger.error(`Erreur lors de la suppression du langage: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

export const createMultipleLanguages = async (req, res) => {
  try {
    const languages = req.body;
    const savedLanguages = await Language.insertMany(languages);
    res.status(201).json({
      success: true,
      message: "Langages créés avec succès",
      data: savedLanguages,
    });
  } catch (error) {
    logger.error(`Erreur lors de la création des langages: ${error.message}`);
    res.status(400).json({
      success: false,
      message: "Erreur lors de la création des langages",
      error: error.message,
    });
  }
};

async function invalidateLanguageCache(id = null) {
  const keys = await redis.client.keys("languages:page*");
  if (keys.length > 0) {
    await redis.client.del(keys);
  }
  if (id) {
    await redis.client.del(`language:${id}`);
  }
}
