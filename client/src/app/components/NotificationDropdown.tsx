import {
  useRef,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import {
  Bell,
  Bookmark,
  CheckCheck,
  Info,
  Shield,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

import { useNavigate } from "react-router";
import { toast } from "sonner";

import {
  useNotifications,
} from "../context/NotificationContext";

import type {
  Notification,
  NotificationType,
} from "../lib/notification";

interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
}

function formatTime(
  dateString: string
): string {
  const date = new Date(dateString);
  const difference =
    Date.now() - date.getTime();

  const minutes = Math.floor(
    difference / 60_000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
}

function getNotificationIcon(
  type: NotificationType
) {
  switch (type) {
    case "TRADE":
      return <TrendingUp size={15} />;

    case "WALLET":
      return <Wallet size={15} />;

    case "WATCHLIST":
      return <Bookmark size={15} />;

    case "ACCOUNT":
      return <Shield size={15} />;

    default:
      return <Info size={15} />;
  }
}

function getNotificationTone(
  type: NotificationType
): string {
  switch (type) {
    case "TRADE":
      return "trade";

    case "WALLET":
      return "wallet";

    case "WATCHLIST":
      return "watchlist";

    case "ACCOUNT":
      return "account";

    default:
      return "info";
  }
}

export default function NotificationDropdown({
  open,
  onClose,
}: NotificationDropdownProps) {
  const navigate = useNavigate();

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  if (!open) {
    return null;
  }

  const handleNotificationOpen = async (
    notification: Notification
  ) => {
    try {
      if (!notification.read) {
        await markAsRead(
          notification._id
        );
      }

      onClose();

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to open notification"
      );
    }
  };

  const handleKeyboardOpen = (
    event: KeyboardEvent<HTMLDivElement>,
    notification: Notification
  ) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      void handleNotificationOpen(
        notification
      );
    }
  };

  const handleDelete = async (
    event: MouseEvent<HTMLButtonElement>,
    notificationId: string
  ) => {
    event.stopPropagation();

    try {
      await deleteNotification(
        notificationId
      );

      toast.success(
        "Notification removed"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete notification"
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();

      toast.success(
        "All notifications marked as read"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update notifications"
      );
    }
  };

  const visibleNotifications =
    notifications.slice(0, 12);

  return (
    <>
      <button
        type="button"
        className="notification-backdrop"
        aria-label="Close notifications"
        onClick={onClose}
      />

      <div
        ref={dropdownRef}
        className="notification-dropdown"
        role="dialog"
        aria-label="Notifications"
      >
        <header className="notification-header">
          <div className="notification-heading">
            <span className="notification-heading-icon">
              <Bell size={16} />
            </span>

            <div>
              <span>
                ACTIVITY CENTER
              </span>

              <h2>Notifications</h2>

              <p>
                {unreadCount === 0
                  ? "You are all caught up"
                  : `${unreadCount} unread ${
                      unreadCount === 1
                        ? "notification"
                        : "notifications"
                    }`}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="notification-close"
            onClick={onClose}
            aria-label="Close notifications"
          >
            <X size={16} />
          </button>
        </header>

        {unreadCount > 0 && (
          <div className="notification-toolbar">
            <span>
              Recent account activity
            </span>

            <button
              type="button"
              onClick={() =>
                void handleMarkAllRead()
              }
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          </div>
        )}

        <div className="notification-list">
          {notificationsLoading &&
          notifications.length === 0 ? (
            <div className="notification-loading">
              <span />
              <p>
                Loading notifications
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <span>
                <Bell size={21} />
              </span>

              <h3>
                No notifications yet
              </h3>

              <p>
                Trading, wallet, watchlist and
                account activity will appear
                here.
              </p>
            </div>
          ) : (
            visibleNotifications.map(
              (notification) => {
                const tone =
                  getNotificationTone(
                    notification.type
                  );

                return (
                  <div
                    key={notification._id}
                    className={`notification-item ${
                      notification.read
                        ? "notification-item-read"
                        : "notification-item-unread"
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      void handleNotificationOpen(
                        notification
                      )
                    }
                    onKeyDown={(event) =>
                      handleKeyboardOpen(
                        event,
                        notification
                      )
                    }
                  >
                    <span
                      className={`notification-type-icon notification-type-${tone}`}
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </span>

                    <div className="notification-content">
                      <div className="notification-title-row">
                        {!notification.read && (
                          <i />
                        )}

                        <strong>
                          {notification.title}
                        </strong>
                      </div>

                      <p>
                        {notification.message}
                      </p>

                      <small>
                        {formatTime(
                          notification.createdAt
                        )}
                      </small>
                    </div>

                    <button
                      type="button"
                      className="notification-delete"
                      onClick={(event) =>
                        void handleDelete(
                          event,
                          notification._id
                        )
                      }
                      aria-label={`Delete ${notification.title}`}
                      title="Delete notification"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              }
            )
          )}
        </div>

        {notifications.length > 12 && (
          <footer className="notification-footer">
            Showing the 12 most recent
            notifications
          </footer>
        )}
      </div>
    </>
  );
}