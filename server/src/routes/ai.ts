import express from "express";

import auth from "../middleware/auth.js";
import {
  chatWithAssistant,
} from "../controllers/ai.js";

const router = express.Router();

router.post(
  "/chat",
  auth,
  chatWithAssistant
);

export default router;