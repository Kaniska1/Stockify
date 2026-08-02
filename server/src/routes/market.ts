import express from "express";

import auth from "../middleware/auth.js";

import {
  getQuote,
  getQuotes,
} from "../controllers/market.js";

const router = express.Router();

router.get(
  "/quotes",
  auth,
  getQuotes
);

router.get(
  "/quote/:symbol",
  auth,
  getQuote
);

export default router;