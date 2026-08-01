export interface IApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
}

export interface NotificationData {
  id: string;
  title: string;
  body?: string;
  is_read: boolean;
  type: string;
  entity_type?: string;
  entity_id?: string;
  created_at: string;
  read_at?: string;
}

export interface SessionData {
  id: string;
  ip_address: string;
  device_info: string;
  is_current: boolean;
  created_at: string;
  last_seen_at: string;
  expires_at?: string;
}
