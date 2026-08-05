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
