"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Info,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from "@/lib/api/notifications";

function getNotificationIcon(type: string) {
  switch (type) {
    case "api_key.created":
    case "api_key.revoked":
      return KeyRound;

    case "ingestion.error":
    case "system.error":
      return AlertCircle;

    default:
      return Info;
  }
}

function formatNotificationTime(date: string) {
  const diff = Date.now() - new Date(date).getTime();

  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(date).toLocaleDateString();
}

function isNotificationRead(notification: Notification) {
  return Boolean(notification.deliveries[0]?.readAt);
}

function getNotificationHref(notification: Notification) {
  if (!notification.projectId) {
    return null;
  }

  switch (notification.type) {
    case "api_key.created":
    case "api_key.revoked":
      return "/api-keys";

    case "project.created":
      return "/projects";

    default:
      return null;
  }
}

export function Notifications() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      try {
        const token = await getToken();

        if (!token || cancelled) {
          return;
        }

        const [items, count] = await Promise.all([
          getNotifications(token),
          getUnreadNotificationCount(token),
        ]);

        if (cancelled) {
          return;
        }

        setNotifications(items);
        setUnreadCount(count);
      } catch (error) {
        console.error(
          "Failed to load notifications:",
          error,
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [getToken]);

  async function handleNotificationClick(
    notification: Notification,
  ) {
    try {
      if (!isNotificationRead(notification)) {
        const token = await getToken();

        if (!token) {
          return;
        }

        await markNotificationAsRead(
          token,
          notification.id,
        );

        const now = new Date().toISOString();

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  deliveries: item.deliveries.map(
                    (delivery) =>
                      delivery.channel === "in_app"
                        ? {
                            ...delivery,
                            readAt: now,
                          }
                        : delivery,
                  ),
                }
              : item,
          ),
        );

        setUnreadCount((count) =>
          Math.max(0, count - 1),
        );
      }

      const href = getNotificationHref(notification);

      if (href) {
        router.push(href);
      }
    } catch (error) {
      console.error(
        "Failed to handle notification:",
        error,
      );
    }
  }

  async function handleMarkAllAsRead() {
    if (unreadCount === 0) {
      return;
    }

    try {
      const token = await getToken();

      if (!token) {
        return;
      }

      await markAllNotificationsAsRead(token);

      const now = new Date().toISOString();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          deliveries: notification.deliveries.map(
            (delivery) =>
              delivery.channel === "in_app"
                ? {
                    ...delivery,
                    readAt: delivery.readAt ?? now,
                  }
                : delivery,
          ),
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error,
      );
    }
  }

  return (
    <Popover>
      <PopoverTrigger
        className="
          relative
          flex
          size-8
          items-center
          justify-center
          rounded-lg
          text-[#666666]
          hover:bg-[#dedede]
          hover:text-[#222222]
        "
      >
        <Bell className="size-4" />

        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 size-1.5 rounded-full bg-[#222222]" />
        )}

        <span className="sr-only">
          Notifications
        </span>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="
          w-80
          rounded-xl
          border-[#d5d5d5]
          bg-[#e8e8e8]
          p-0
          shadow-[8px_8px_16px_#c7c7c7,-8px_-8px_16px_#ffffff]
        "
      >
        <div className="flex items-center justify-between border-b border-[#d5d5d5] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[#222222]">
              Notifications
            </p>

            <p className="mt-0.5 text-xs text-[#777777]">
              Recent updates and activity
            </p>
          </div>

          {unreadCount > 0 && (
            <span className="rounded-full bg-[#dedede] px-2 py-1 text-[10px] font-medium text-[#666666]">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {loading ? (
            <div className="px-3 py-8 text-center text-xs text-[#888888]">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <CheckCircle2 className="mx-auto size-5 text-[#888888]" />

              <p className="mt-2 text-xs font-medium text-[#555555]">
                No notifications
              </p>

              <p className="mt-1 text-[11px] text-[#999999]">
                You're all caught up.
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(
                notification.type,
              );

              const read =
                isNotificationRead(notification);

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() =>
                    handleNotificationClick(notification)
                  }
                  className={`
                    flex
                    w-full
                    gap-3
                    rounded-lg
                    px-3
                    py-3
                    text-left
                    transition-colors
                    hover:bg-[#dedede]
                    ${!read ? "bg-[#dedede]/60" : ""}
                  `}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#e8e8e8] shadow-[inset_2px_2px_4px_#c9c9c9,inset_-2px_-2px_4px_#ffffff]">
                    <Icon className="size-4 text-[#555555]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className="text-xs font-medium text-[#333333]">
                        {notification.title}
                      </p>

                      {!read && (
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#222222]" />
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-[#777777]">
                      {notification.message}
                    </p>

                    <p className="mt-1 text-[10px] text-[#999999]">
                      {formatNotificationTime(
                        notification.createdAt,
                      )}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t border-[#d5d5d5] px-4 py-2.5">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="
                text-xs
                font-medium
                text-[#666666]
                hover:text-[#222222]
                disabled:cursor-default
                disabled:text-[#999999]
              "
            >
              Mark all as read
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
