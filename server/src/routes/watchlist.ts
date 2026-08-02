import express from "express";

import auth from "../middleware/auth.js";

import {
  getWatchlist,
  addStock,
  removeStock,
} from "../controllers/watchlist.js";

const router = express.Router();

router.get("/", auth, getWatchlist);

router.post("/", auth, addStock);

router.delete("/:symbol", auth, removeStock);

export default router;