import { Hono } from "hono";

import { clerkAuthMiddleware } from "../middleware/clerk-auth";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  getUnreadNotificationCount
} from "../services/notifications/notification-service";
import type { AppVariables } from "../types";

const notifications = new Hono<{
  Variables: AppVariables;
}>();

/**
 * Get current user's notifications
 */
notifications.get(
  "/notifications",
  clerkAuthMiddleware,
  async (c) => {
    const userId = c.get("userId");

    const data = await getNotifications(userId);

    return c.json({
      notifications: data,
    });
  },
);

/**
 * Mark a notification as read
 */
notifications.patch(
  "/notifications/:notificationId/read",
  clerkAuthMiddleware,
  async (c) => {
    const userId = c.get("userId");
    const notificationId = c.req.param("notificationId");

    await markNotificationAsRead(
      userId,
      notificationId,
    );

    return c.body(null, 204);
  },
);

/**
 * Mark all notifications as read
 */
notifications.patch(
  "/notifications/read-all",
  clerkAuthMiddleware,
  async (c) => {
    const userId = c.get("userId");

    await markAllNotificationsAsRead(userId);

    return c.body(null, 204);
  },
);

notifications.get(
  "/notifications/unread-count",
  clerkAuthMiddleware,
  async (c) => {
    const userId = c.get("userId");

    const count =
      await getUnreadNotificationCount(userId);

    return c.json({
      count,
    });
  },
);

export default notifications;