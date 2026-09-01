import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, setTokens, clearTokens } from "@/lib/api/api-client";
import { useAuthStore } from "@/store/authStore";
import type { IApiResponse } from "@/lib/auth/types";
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
  ForgotPasswordDto,
  ForgotPasswordData,
  ResetPasswordDto,
  VerifyEmailDto,
  VerifyEmailData,
  ResendVerificationDto,
  ResendVerificationData,
  LogoutDto,
  AcceptInviteDto,
  AcceptInviteData,
  AuthTokens,
  User,
} from "@/types/api/auth";

const REMEMBER_FLAG = "worker_remember";

type SuccessEnvelope<T> = IApiResponse<T> & { data: T };

const call = async <T>(request: Promise<IApiResponse<T>>): Promise<SuccessEnvelope<T>> => {
  const res = await request;
  if (!res.success || !res.data) {
    throw new ApiError(res.message, undefined, res.errors);
  }
  return res as SuccessEnvelope<T>;
};

const applyAuthResult = (
  user: User,
  tokens: AuthTokens,
  session: string,
  remember = true
) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(REMEMBER_FLAG, remember ? "true" : "false");
  }
  setTokens(tokens.access_token, tokens.refresh_token, remember);
  useAuthStore.getState().setUser(user);
  useAuthStore.getState().setTokens(tokens);
  useAuthStore.getState().setSession(session);
};

export const useRegisterTalent = () => {
  return useMutation({
    mutationFn: (data: RegisterTalentDto) =>
      call(api.post<RegisterTalentData>("/auth/register/talent", data)),
  });
};

export const useRegisterClient = () => {
  return useMutation({
    mutationFn: (data: RegisterClientDto) =>
      call(api.post<RegisterClientData>("/auth/register/client", data)),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginDto) => {
      const { rememberMe, ...payload } = data;
      return call(api.post<LoginData>("/auth/login", payload));
    },
    onSuccess: (response, variables) => {
      applyAuthResult(
        response.data.user,
        response.data.tokens,
        response.data.session_id,
        variables.rememberMe
      );
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useGoogleAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GoogleAuthDto) =>
      call(api.post<GoogleAuthData>("/auth/google", data)),
    onSuccess: (response) => {
      applyAuthResult(
        response.data.user,
        response.data.tokens,
        response.data.session_id
      );
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useCompleteTalentProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompleteTalentRegistrationDto) =>
      call(
        api.auth.post<CompleteTalentRegistrationData>(
          "/auth/complete/talent-profile",
          data
        )
      ),
    onSuccess: (response) => {
      useAuthStore.getState().setUser(response.data.user);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useCompleteClientProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompleteClientRegistrationDto) =>
      call(
        api.auth.post<CompleteClientRegistrationData>(
          "/auth/complete/client-profile",
          data
        )
      ),
    onSuccess: (response) => {
      useAuthStore.getState().setUser(response.data.user);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyEmailDto) =>
      call(api.post<VerifyEmailData>("/auth/verify-email", data)),
    onSuccess: (response) => {
      applyAuthResult(
        response.data.user,
        response.data.tokens,
        response.data.session_id
      );
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useAcceptInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AcceptInviteDto) =>
      call(api.post<AcceptInviteData>("/auth/accept-invite", data)),
    onSuccess: (response) => {
      applyAuthResult(
        response.data.user,
        response.data.tokens,
        response.data.session_id
      );
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordDto) =>
      call(api.post<ForgotPasswordData>("/auth/forgot-password", data)),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordDto) =>
      call(api.post<null>("/auth/reset-password", data)),
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (data: ResendVerificationDto) =>
      call(
        api.post<ResendVerificationData>("/auth/resend-verification", data)
      ),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: LogoutDto) =>
      call(api.auth.post<null>("/auth/logout", data)),
    onSettled: () => {
      clearTokens();
      useAuthStore.getState().clear();
      queryClient.clear();
    },
  });
};
