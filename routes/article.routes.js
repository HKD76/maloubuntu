import { Router } from "express";
import {
  getArticles,
  createArticle,
} from "../controllers/article.controller.js";

const router = Router();

router.get("/", getArticles);
router.post("/", createArticle);

export default router;
