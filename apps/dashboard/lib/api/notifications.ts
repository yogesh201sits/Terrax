export type NotificationDelivery = {
  id: string;
  notificationId: string;
  channel: string;
  status: string;
  deliveredAt: string | null;
  readAt: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  projectId: string | null;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  deliveries: NotificationDelivery[];
};

type NotificationsResponse = {
  notifications: Notification[];
};

type UnreadCountResponse = {
  count: number;
};

const API_URL = process.env.NEXT_PUBLIC_TERRAX_API_URL;

export async function getNotifications(
  token: string,
): Promise<Notification[]> {
  const response = await fetch(
    `${API_URL}/v1/notifications`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  const data =
    (await response.json()) as NotificationsResponse;

  return data.notifications;
}

export async function getUnreadNotificationCount(
  token: string,
): Promise<number> {
  const response = await fetch(
    `${API_URL}/v1/notifications/unread-count`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.text();

    console.error(
      "Unread notification count failed:",
      response.status,
      error,
    );

    throw new Error(
      "Failed to fetch unread notification count",
    );
  }

  const data =
    (await response.json()) as UnreadCountResponse;

  return data.count;
}

export async function markNotificationAsRead(
  token: string,
  notificationId: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/v1/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to mark notification as read",
    );
  }
}

export async function markAllNotificationsAsRead(
  token: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/v1/notifications/read-all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to mark all notifications as read",
    );
  }
}
