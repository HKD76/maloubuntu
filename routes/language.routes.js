import { Router } from "express";
import {
  getLanguages,
  getLanguageById,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  createMultipleLanguages,
} from "../controllers/language.controller.js";

const router = Router();

router.get("/", getLanguages);
router.get("/:id", getLanguageById);
router.post("/", createLanguage);
router.post("/bulk", createMultipleLanguages);
router.put("/:id", updateLanguage);
router.delete("/:id", deleteLanguage);

export default router;
