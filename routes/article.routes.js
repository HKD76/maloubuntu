import { Router } from "express";
import {
  getArticles,
  createArticle,
} from "../controllers/article.controller.js";

const router = Router();

router.get("/getArticle", getArticles);
router.post("/createArticle", createArticle);

export default router;
