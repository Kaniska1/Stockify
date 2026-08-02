import express from "express";

import auth from "../middleware/auth.js";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../controllers/notification.js";

const router = express.Router();

router.get("/", auth, getNotifications);

router.patch(
  "/read-all",
  auth,
  markAllNotificationsRead
);

router.patch(
  "/:id/read",
  auth,
  markNotificationRead
);

router.delete(
  "/:id",
  auth,
  deleteNotification
);

export default router;