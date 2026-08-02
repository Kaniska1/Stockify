import express from "express";

import auth from "../middleware/auth.js";

import {
  register,
  login,
  me,
  updateProfile,
  changePassword,
  depositFunds,
} from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", auth, me);
router.patch("/profile", auth, updateProfile);
router.patch("/password", auth, changePassword);
router.patch('/wallet/deposit', auth, depositFunds);

export default router;