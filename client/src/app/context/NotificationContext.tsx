import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "./AuthContext";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotificationRequest,
  type Notification,
} from "../lib/notification";

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  notificationsLoading: boolean;

  refreshNotifications: () => Promise<void>;

  markAsRead: (
    notificationId: string
  ) => Promise<void>;

  markAllAsRead: () => Promise<void>;

  deleteNotification: (
    notificationId: string
  ) => Promise<void>;
}

const NotificationContext =
  createContext<NotificationContextValue | null>(
    null
  );

export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { token } = useAuth();

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [
    notificationsLoading,
    setNotificationsLoading,
  ] = useState(false);

  const refreshNotifications =
    useCallback(async () => {
      if (!token) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      setNotificationsLoading(true);

      try {
        const response =
          await getNotifications(token);

        setNotifications(
          response.notifications
        );

        setUnreadCount(
          response.unreadCount
        );
      } catch (error) {
        console.error(
          "Unable to load notifications:",
          error
        );
      } finally {
        setNotificationsLoading(false);
      }
    }, [token]);

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    if (!token) return;

    const interval = window.setInterval(() => {
      void refreshNotifications();
    }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [token, refreshNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!token) {
        throw new Error("Not logged in");
      }

      const existing =
        notifications.find(
          item =>
            item._id === notificationId
        );

      if (!existing || existing.read) {
        return;
      }

      await markNotificationRead(
        token,
        notificationId
      );

      setNotifications(previous =>
        previous.map(notification =>
          notification._id === notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );

      setUnreadCount(previous =>
        Math.max(0, previous - 1)
      );
    },
    [token, notifications]
  );

  const markAllAsRead =
    useCallback(async () => {
      if (!token) {
        throw new Error("Not logged in");
      }

      await markAllNotificationsRead(token);

      setNotifications(previous =>
        previous.map(notification => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    }, [token]);

  const deleteNotification =
    useCallback(
      async (
        notificationId: string
      ) => {
        if (!token) {
          throw new Error(
            "Not logged in"
          );
        }

        const existing =
          notifications.find(
            notification =>
              notification._id ===
              notificationId
          );

        await deleteNotificationRequest(
          token,
          notificationId
        );

        setNotifications(previous =>
          previous.filter(
            notification =>
              notification._id !==
              notificationId
          )
        );

        if (existing && !existing.read) {
          setUnreadCount(previous =>
            Math.max(0, previous - 1)
          );
        }
      },
      [token, notifications]
    );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        notificationsLoading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(
    NotificationContext
  );

  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }

  return context;
}