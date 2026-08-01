"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useResetPassword, useForgotPassword } from "@/hooks/api/useAuth";
import { passwordSchema } from "@/schemas";
import { z } from "zod";

const resetPasswordSchema = z.object({
  otp: z.string().min(6, "Enter the 6-digit code").max(6, "Enter the 6-digit code"),
  newPassword: passwordSchema,
});
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const reference = searchParams.get("reference") || "";
  const [showPassword, setShowPassword] = useState(false);

  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);

  const resetPassword = useResetPassword();
  const forgotPassword = useForgotPassword();

  useEffect(() => {
    if (!canResend && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
    if (timer === 0) setCanResend(true);
  }, [canResend, timer]);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", newPassword: "" },
  });

  const watchedOtp = form.watch("otp");
  const watchedPassword = form.watch("newPassword");

  const handleResend = () => {
    if (!email) {
      toast.error("Missing email address");
      return;
    }
    forgotPassword.mutate(
      { email },
      {
        onSuccess: (response) => {
          toast.success(response.message || "A new code has been sent");
          const ref = response.data.reference;
          if (ref) router.replace(`/reset-password?email=${encodeURIComponent(email)}&reference=${encodeURIComponent(ref)}`);
          setCanResend(false);
          setTimer(59);
        },
        onError: (error) => {
          const message =
            error instanceof AxiosError
              ? (error.response?.data?.message as string) || "Failed to resend code"
              : "Failed to resend code";
          toast.error(message);
        },
      }
    );
  };

  const onSubmit = form.handleSubmit((values) => {
    if (!reference) {
      toast.error("Missing reset reference");
      return;
    }
    resetPassword.mutate(
      {
        reference,
        otp: values.otp,
        email,
        new_password: values.newPassword,
      },
      {
        onSuccess: (response) => {
          toast.success(response.message || "Password reset successfully. Please sign in.");
          router.push("/login");
        },
        onError: (error) => {
          const message =
            error instanceof AxiosError
              ? (error.response?.data?.message as string) || "Failed to reset password"
              : "Failed to reset password";
          toast.error(message);
        },
      }
    );
  });

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the 6-digit code from your email along with a new password.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <Label>Verification code</Label>
          <InputOTP maxLength={6} value={form.watch("otp")} onChange={(value) => form.setValue("otp", value)} className="w-full">
            <InputOTPGroup className="flex w-full">
              <InputOTPSlot index={0} className="flex-1" />
              <InputOTPSlot index={1} className="flex-1" />
              <InputOTPSlot index={2} className="flex-1" />
              <InputOTPSlot index={3} className="flex-1" />
              <InputOTPSlot index={4} className="flex-1" />
              <InputOTPSlot index={5} className="flex-1" />
            </InputOTPGroup>
          </InputOTP>
          {form.formState.errors.otp && (
            <p className="text-sm text-destructive">{form.formState.errors.otp.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className="pl-9 pr-10"
              {...form.register("newPassword")}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {form.formState.errors.newPassword && (
            <p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={!watchedOtp || !watchedPassword || resetPassword.isPending}
          className="w-full"
        >
          {resetPassword.isPending && <LoaderCircle className="size-4 animate-spin" />}
          Reset password
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-1 text-sm">
        <span className="text-muted-foreground">Didn&apos;t receive a code?</span>
        <Button
          type="button"
          variant="ghost"
          disabled={!canResend || forgotPassword.isPending}
          onClick={handleResend}
          className="font-medium text-primary hover:underline"
        >
          {forgotPassword.isPending
            ? "Resending..."
            : canResend
              ? "Resend code"
              : `0:${timer.toString().padStart(2, "0")}s`}
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
