import apiClient from "@/lib/api-client";
import type {
  RegisterTalentDto,
  RegisterTalentData,
  RegisterClientDto,
  RegisterClientData,
  LoginDto,
  LoginData,
  GoogleAuthDto,
  GoogleAuthData,
  CompleteTalentRegistrationDto,
  CompleteTalentRegistrationData,
  CompleteClientRegistrationDto,
  CompleteClientRegistrationData,
  RefreshTokenDto,
  RefreshTokenData,
  LogoutDto,
  ForgotPasswordDto,
  ForgotPasswordData,
  ResetPasswordDto,
  VerifyEmailDto,
  VerifyEmailData,
  ResendVerificationDto,
  ResendVerificationData,
  InviteUserDto,
  AcceptInviteDto,
  AcceptInviteData,
} from "@/types/api/auth";
import type { BaseResponse } from "@/types/api/common";

export const authService = {
  registerTalent: async (
    data: RegisterTalentDto
  ): Promise<BaseResponse<RegisterTalentData>> => {
    const response = await apiClient.post<BaseResponse<RegisterTalentData>>(
      "/api/v1/auth/register/talent",
      data
    );
    return response.data;
  },

  registerClient: async (
    data: RegisterClientDto
  ): Promise<BaseResponse<RegisterClientData>> => {
    const response = await apiClient.post<BaseResponse<RegisterClientData>>(
      "/api/v1/auth/register/client",
      data
    );
    return response.data;
  },

  login: async (data: LoginDto): Promise<BaseResponse<LoginData>> => {
    const response = await apiClient.post<BaseResponse<LoginData>>(
      "/api/v1/auth/login",
      data
    );
    return response.data;
  },

  googleAuth: async (
    data: GoogleAuthDto
  ): Promise<BaseResponse<GoogleAuthData>> => {
    const response = await apiClient.post<BaseResponse<GoogleAuthData>>(
      "/api/v1/auth/google",
      data
    );
    return response.data;
  },

  completeTalentProfile: async (
    data: CompleteTalentRegistrationDto
  ): Promise<BaseResponse<CompleteTalentRegistrationData>> => {
    const response = await apiClient.post<
      BaseResponse<CompleteTalentRegistrationData>
    >("/api/v1/auth/complete/talent-profile", data);
    return response.data;
  },

  completeClientProfile: async (
    data: CompleteClientRegistrationDto
  ): Promise<BaseResponse<CompleteClientRegistrationData>> => {
    const response = await apiClient.post<
      BaseResponse<CompleteClientRegistrationData>
    >("/api/v1/auth/complete/client-profile", data);
    return response.data;
  },

  refreshToken: async (
    data: RefreshTokenDto
  ): Promise<BaseResponse<RefreshTokenData>> => {
    const response = await apiClient.post<BaseResponse<RefreshTokenData>>(
      "/api/v1/auth/refresh",
      data
    );
    return response.data;
  },

  logout: async (data?: LogoutDto): Promise<BaseResponse<null>> => {
    const response = await apiClient.post<BaseResponse<null>>(
      "/api/v1/auth/logout",
      data || {}
    );
    return response.data;
  },

  forgotPassword: async (
    data: ForgotPasswordDto
  ): Promise<BaseResponse<ForgotPasswordData>> => {
    const response = await apiClient.post<BaseResponse<ForgotPasswordData>>(
      "/api/v1/auth/forgot-password",
      data
    );
    return response.data;
  },

  resetPassword: async (
    data: ResetPasswordDto
  ): Promise<BaseResponse<null>> => {
    const response = await apiClient.post<BaseResponse<null>>(
      "/api/v1/auth/reset-password",
      data
    );
    return response.data;
  },

  verifyEmail: async (
    data: VerifyEmailDto
  ): Promise<BaseResponse<VerifyEmailData>> => {
    const response = await apiClient.post<BaseResponse<VerifyEmailData>>(
      "/api/v1/auth/verify-email",
      data
    );
    return response.data;
  },

  resendVerification: async (
    data: ResendVerificationDto
  ): Promise<BaseResponse<ResendVerificationData>> => {
    const response = await apiClient.post<BaseResponse<ResendVerificationData>>(
      "/api/v1/auth/resend-verification",
      data
    );
    return response.data;
  },

  acceptInvite: async (
    data: AcceptInviteDto
  ): Promise<BaseResponse<AcceptInviteData>> => {
    const response = await apiClient.post<BaseResponse<AcceptInviteData>>(
      "/api/v1/auth/accept-invite",
      data
    );
    return response.data;
  },

  inviteUser: async (
    data: InviteUserDto
  ): Promise<BaseResponse<RegisterTalentData>> => {
    const response = await apiClient.post<BaseResponse<RegisterTalentData>>(
      "/api/v1/auth/invite",
      data
    );
    return response.data;
  },
};

