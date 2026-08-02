import express from "express";
import auth from "../middleware/auth.js";
import {
  getTransactions,
  addTransaction,
} from "../controllers/transaction.js";

const router = express.Router();

router.get("/", auth, getTransactions);
router.post("/", auth, addTransaction);

export default router;