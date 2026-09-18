import { prisma } from "@terrax/database";
import { Prisma } from "@terrax/database";

import {
  NotificationChannel,
  NotificationDeliveryStatus,
  type CreateNotificationInput,
} from "./types";

const DEFAULT_CHANNELS = [
  NotificationChannel.IN_APP,
];

export async function createNotification(
  input: CreateNotificationInput,
) {
  const channels = input.channels ?? DEFAULT_CHANNELS;

  return prisma.notification.create({
    data: {
      userId: input.userId,
      projectId: input.projectId,

      type: input.type,
      title: input.title,
      message: input.message,

      metadata: input.metadata as Prisma.InputJsonValue | undefined,
      deliveries: {
        create: channels.map((channel) => ({
          channel,
          status:
            channel === NotificationChannel.IN_APP
              ? NotificationDeliveryStatus.DELIVERED
              : NotificationDeliveryStatus.PENDING,

          deliveredAt:
            channel === NotificationChannel.IN_APP
              ? new Date()
              : undefined,
        })),
      },
    },

    include: {
      deliveries: true,
    },
  });
}

export async function getUnreadNotificationCount(
  userId: string,
) {
  return prisma.notificationDelivery.count({
    where: {
      channel: NotificationChannel.IN_APP,
      readAt: null,
      notification: {
        userId,
      },
    },
  });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
    },

    include: {
      deliveries: {
        where: {
          channel: NotificationChannel.IN_APP,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 50,
  });
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string,
) {
  return prisma.notificationDelivery.updateMany({
    where: {
      notificationId,
      channel: NotificationChannel.IN_APP,
      notification: {
        userId,
      },
      readAt: null,
    },

    data: {
      readAt: new Date(),
    },
  });
}

export async function markAllNotificationsAsRead(
  userId: string,
) {
  return prisma.notificationDelivery.updateMany({
    where: {
      channel: NotificationChannel.IN_APP,
      notification: {
        userId,
      },
      readAt: null,
    },

    data: {
      readAt: new Date(),
    },
  });
}