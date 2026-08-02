import mongoose from "mongoose";

import Notification, {
  type NotificationType,
} from "../models/Notification.js";

interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  metadata?: Record<string, unknown>;
  session?: mongoose.ClientSession;
}

export async function createNotification({
  userId,
  title,
  message,
  type = "SYSTEM",
  link = "",
  metadata = {},
  session,
}: CreateNotificationInput) {
  const [notification] = await Notification.create(
    [
      {
        user: userId,
        title,
        message,
        type,
        link,
        metadata,
      },
    ],
    session ? { session } : undefined
  );

  return notification;
}