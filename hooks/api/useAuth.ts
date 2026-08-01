import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { setTokens, clearTokens } from "@/lib/api/worker";
import type {
  RegisterTalentDto,
  RegisterClientDto,
  LoginDto,
  GoogleAuthDto,
  CompleteTalentRegistrationDto,
  CompleteClientRegistrationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
  LogoutDto,
  AcceptInviteDto,
  AuthTokens,
  User,
} from "@/types/api/auth";

const REMEMBER_FLAG = "worker_remember";

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
    mutationFn: (data: RegisterTalentDto) => authService.registerTalent(data),
  });
};

export const useRegisterClient = () => {
  return useMutation({
    mutationFn: (data: RegisterClientDto) => authService.registerClient(data),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
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
    mutationFn: (data: GoogleAuthDto) => authService.googleAuth(data),
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
      authService.completeTalentProfile(data),
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
      authService.completeClientProfile(data),
    onSuccess: (response) => {
      useAuthStore.getState().setUser(response.data.user);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyEmailDto) => authService.verifyEmail(data),
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
    mutationFn: (data: AcceptInviteDto) => authService.acceptInvite(data),
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
    mutationFn: (data: ForgotPasswordDto) => authService.forgotPassword(data),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordDto) => authService.resetPassword(data),
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (data: ResendVerificationDto) =>
      authService.resendVerification(data),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: LogoutDto) => authService.logout(data),
    onSettled: () => {
      clearTokens();
      useAuthStore.getState().clear();
      queryClient.clear();
    },
  });
};

