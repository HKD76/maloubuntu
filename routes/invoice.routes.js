import { Router } from "express";
import { generateInvoice } from "../controllers/invoice.controller.js";

const router = Router();

router.post("/generateInvoice", generateInvoice);

export default router;
