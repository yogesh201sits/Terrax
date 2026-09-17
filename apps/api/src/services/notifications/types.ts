export const NotificationType = {
  PROJECT_CREATED: "project.created",

  API_KEY_CREATED: "api_key.created",
  API_KEY_REVOKED: "api_key.revoked",

  INGESTION_ERROR: "ingestion.error",

  SYSTEM_ERROR: "system.error",
  PROJECT_UPDATED: "project.updated",
  PROJECT_DELETED: "project.deleted",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationChannel = {
  IN_APP: "in_app",
  EMAIL: "email",
} as const;



export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationDeliveryStatus = {
  PENDING: "pending",
  DELIVERED: "delivered",
  FAILED: "failed",
} as const;

export type NotificationDeliveryStatus =
  (typeof NotificationDeliveryStatus)[keyof typeof NotificationDeliveryStatus];

export type CreateNotificationInput = {
  userId: string;
  projectId?: string;

  type: NotificationType;
  title: string;
  message: string;

  metadata?: Record<string, unknown>;

  channels?: NotificationChannel[];
};