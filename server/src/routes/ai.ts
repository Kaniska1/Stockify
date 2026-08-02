import express from "express";

import auth from "../middleware/auth.js";

import {
  chatWithAssistant,
  analyzePortfolio,
} from "../controllers/ai.js";

const router = express.Router();

router.post("/chat", auth, chatWithAssistant);

router.post(
  "/portfolio-analysis",
  auth,
  analyzePortfolio
);

export default router;