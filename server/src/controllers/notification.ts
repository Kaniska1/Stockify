import type { Response } from "express";

import Notification from "../models/Notification.js";
import type { AuthRequest } from "../middleware/auth.js";

export const getNotifications = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount =
      await Notification.countDocuments({
        user: req.userId,
        read: false,
      });

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      message: "Unable to retrieve notifications",
    });
  }
};

export const markNotificationRead = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const notificationId = req.params["id"];

    if (!notificationId) {
      return res.status(400).json({
        message: "Notification ID is required",
      });
    }

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          user: req.userId,
        },
        {
          $set: {
            read: true,
          },
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification read error:",
      error
    );

    return res.status(500).json({
      message: "Unable to update notification",
    });
  }
};

export const markAllNotificationsRead = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    await Notification.updateMany(
      {
        user: req.userId,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    return res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications read error:",
      error
    );

    return res.status(500).json({
      message: "Unable to update notifications",
    });
  }
};

export const deleteNotification = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const notificationId = req.params["id"];

    if (!notificationId) {
      return res.status(400).json({
        message: "Notification ID is required",
      });
    }

    const notification =
      await Notification.findOneAndDelete({
        _id: notificationId,
        user: req.userId,
      });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification deleted",
    });
  } catch (error) {
    console.error(
      "Delete notification error:",
      error
    );

    return res.status(500).json({
      message: "Unable to delete notification",
    });
  }
};