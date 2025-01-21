import express from "express";
import {
  getPresentations,
  createPresentation,
  updatePresentation,
} from "../controllers/presentation.controller.js";

const router = express.Router();

router.get("/", getPresentations);
router.post("/", createPresentation);
router.put("/:id", updatePresentation);

export default router;
