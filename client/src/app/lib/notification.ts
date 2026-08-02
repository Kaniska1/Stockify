import api from "./api";

export type NotificationType =
  | "TRADE"
  | "WALLET"
  | "WATCHLIST"
  | "ACCOUNT"
  | "SYSTEM";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const getNotifications = (
  token: string
) =>
  api<NotificationResponse>("/notifications", {
    token,
  });

export const markNotificationRead = (
  token: string,
  notificationId: string
) =>
  api<{ notification: Notification }>(
    `/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      token,
    }
  );

export const markAllNotificationsRead = (
  token: string
) =>
  api<{ message: string }>(
    "/notifications/read-all",
    {
      method: "PATCH",
      token,
    }
  );

export const deleteNotificationRequest = (
  token: string,
  notificationId: string
) =>
  api<{ message: string }>(
    `/notifications/${notificationId}`,
    {
      method: "DELETE",
      token,
    }
  );