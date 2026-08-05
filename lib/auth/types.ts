export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  device_info?: string;
}

export interface AuthTokensData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface LoginData {
  user: UserData;
  tokens: AuthTokensData;
  session_id: string;
  temp_password?: boolean;
}

export interface UserData {
  id: string;
  email: string;
  accountType: string;
  roles: string[];
  emailVerified: boolean;
  phoneVerified: boolean;
  status: string;
  hasPassword: boolean;
  tempPassword: boolean;
  termsAccepted: boolean;
  invitedBy?: string;
  invitedAt?: string;
  lastLoginAt?: string;
  totalInvited: number;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterTalentData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthState {
  user: UserData | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface IApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

