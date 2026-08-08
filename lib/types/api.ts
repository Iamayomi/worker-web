export interface IApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
}

export interface NotificationData {
  id: string;
  userId: string;
  type: string;
  category: string;
  title: string;
  message: string;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminNotificationItem extends NotificationData {
  recipientEmail?: string;
  recipientAccountType?: string;
}

export interface AdminNotificationStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
  read: number;
  unread: number;
}

export interface AdminSendNotificationInput {
  category: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
  userIds?: string[];
  accountType?: string;
  all?: boolean;
}

export interface ChannelPreferences {
  inApp: boolean;
  email: boolean;
  push: boolean;
}

export type NotificationPreferenceCategory =
  | "applications"
  | "offers"
  | "jobs"
  | "system"
  | "auth";

export type NotificationPreferences = Record<
  NotificationPreferenceCategory,
  ChannelPreferences
>;

export interface SessionData {
  session_id: string;
  user_id: string;
  device_info: string;
  ip_address: string;
  created_at: string;
  last_accessed_at: string;
  expires_at: string;
  is_active: boolean;
  is_current: boolean;
}
