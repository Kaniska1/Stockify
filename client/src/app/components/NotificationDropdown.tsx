import { useRef } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  CheckCheck,
  Trash2,
  TrendingUp,
  Wallet,
  Bookmark,
  Shield,
  Info,
} from "lucide-react";
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

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const difference =
    Date.now() - date.getTime();

  const minutes = Math.floor(
    difference / 60_000
  );

  if (minutes < 1) return "Just now";
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

function notificationIcon(
  type: NotificationType
) {
  switch (type) {
    case "TRADE":
      return (
        <TrendingUp size={15} />
      );

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

function notificationStyle(
  type: NotificationType
) {
  switch (type) {
    case "TRADE":
      return {
        color: "#10b981",
        background:
          "rgba(16,185,129,0.1)",
      };

    case "WALLET":
      return {
        color: "#f59e0b",
        background:
          "rgba(245,158,11,0.1)",
      };

    case "WATCHLIST":
      return {
        color: "#f6f609",
        background:
          "rgba(246,246,9,0.1)",
      };

    case "ACCOUNT":
      return {
        color: "#06b6d4",
        background:
          "rgba(6,182,212,0.1)",
      };

    default:
      return {
        color: "#999999",
        background:
          "rgba(153,153,153,0.1)",
      };
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

  if (!open) return null;

  const handleNotificationClick =
    async (
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

  const handleDelete = async (
    event: React.MouseEvent,
    notificationId: string
  ) => {
    event.stopPropagation();

    try {
      await deleteNotification(
        notificationId
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete notification"
      );
    }
  };

  const handleMarkAllRead =
    async () => {
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

  return (
    <>
      <button
        type="button"
        aria-label="Close notifications"
        className="fixed inset-0 z-40 cursor-default"
        style={{
          background: "transparent",
        }}
        onClick={onClose}
      />

      <div
        ref={dropdownRef}
        className="absolute right-0 top-11 z-50 w-[380px] max-w-[calc(100vw-24px)] rounded-xl overflow-hidden shadow-2xl"
        style={{
          background: "#171717",
          border: "1px solid #333333",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3.5"
          style={{
            borderBottom:
              "1px solid #333333",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 650,
                color: "#e7fef6",
              }}
            >
              Notifications
            </div>

            <div
              style={{
                marginTop: "1px",
                fontSize: "11px",
                color: "#808080",
              }}
            >
              {unreadCount === 0
                ? "You're all caught up"
                : `${unreadCount} unread`}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={
                handleMarkAllRead
              }
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{
                background:
                  "rgba(246,246,9,0.08)",
                color: "#f6f609",
                fontSize: "11px",
                border:
                  "1px solid rgba(246,246,9,0.15)",
              }}
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[430px] overflow-y-auto">
          {notificationsLoading &&
          notifications.length === 0 ? (
            <div className="py-14 flex justify-center">
              <div
                className="w-6 h-6 rounded-full border-2 animate-spin"
                style={{
                  borderColor:
                    "rgba(246,246,9,0.15)",
                  borderTopColor:
                    "#f6f609",
                }}
              />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-14 px-5 flex flex-col items-center text-center">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{
                  background: "#222222",
                  border:
                    "1px solid #333333",
                }}
              >
                <Bell
                  size={19}
                  style={{
                    color: "#4d4d4d",
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#b3b3b3",
                }}
              >
                No notifications yet
              </div>

              <div
                style={{
                  marginTop: "4px",
                  fontSize: "11px",
                  color: "#5f5f5f",
                }}
              >
                Trading and account activity
                will appear here.
              </div>
            </div>
          ) : (
            notifications
              .slice(0, 12)
              .map(notification => {
                const style =
                  notificationStyle(
                    notification.type
                  );

                return (
                  <button
                    type="button"
                    key={notification._id}
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                    style={{
                      background:
                        notification.read
                          ? "transparent"
                          : "rgba(246,246,9,0.025)",

                      borderBottom:
                        "1px solid #252525",
                    }}
                    onMouseEnter={event => {
                      event.currentTarget.style.background =
                        "rgba(255,255,255,0.035)";
                    }}
                    onMouseLeave={event => {
                      event.currentTarget.style.background =
                        notification.read
                          ? "transparent"
                          : "rgba(246,246,9,0.025)";
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background:
                          style.background,
                        color: style.color,
                      }}
                    >
                      {notificationIcon(
                        notification.type
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{
                              background:
                                "#f6f609",
                            }}
                          />
                        )}

                        <div
                          className="truncate"
                          style={{
                            fontSize: "12px",
                            fontWeight:
                              notification.read
                                ? 500
                                : 650,

                            color:
                              "#e7fef6",
                          }}
                        >
                          {
                            notification.title
                          }
                        </div>
                      </div>

                      <div
                        className="mt-1 line-clamp-2"
                        style={{
                          fontSize: "11px",
                          lineHeight: 1.5,
                          color: "#808080",
                        }}
                      >
                        {
                          notification.message
                        }
                      </div>

                      <div
                        style={{
                          marginTop: "5px",
                          fontSize: "10px",
                          color: "#4d4d4d",
                        }}
                      >
                        {formatTime(
                          notification.createdAt
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={event =>
                        handleDelete(
                          event,
                          notification._id
                        )
                      }
                      className="p-1.5 rounded-md flex-shrink-0"
                      style={{
                        color: "#4d4d4d",
                      }}
                      title="Delete notification"
                      onMouseEnter={event => {
                        event.currentTarget.style.color =
                          "#f43f5e";
                      }}
                      onMouseLeave={event => {
                        event.currentTarget.style.color =
                          "#4d4d4d";
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </button>
                );
              })
          )}
        </div>
      </div>
    </>
  );
}
