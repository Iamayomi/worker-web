"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useVerifyEmail, useResendVerification } from "@/hooks/api/useAuth";

interface OtpVerificationProps {
  email: string;
  reference: string;
  onDone?: () => void;
}

export function OtpVerification({
  email,
  reference: initialReference,
  onDone,
}: OtpVerificationProps) {
  const router = useRouter();
  const [reference, setReference] = useState(initialReference);
  const [otp, setOtp] = useState("");

  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();

  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!canResend && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
    if (timer === 0) setCanResend(true);
  }, [canResend, timer]);

  const handleResend = () => {
    resendVerification.mutate(
      { email },
      {
        onSuccess: (response) => {
          toast.success(response.message || "Verification code resent");
          const ref = response.data.reference;
          if (ref) setReference(ref);
          setCanResend(false);
          setTimer(59);
        },
        onError: (error) => {
          const message =
            error instanceof AxiosError
              ? (error.response?.data?.message as string) ||
                "Failed to resend code"
              : "Failed to resend code";
          toast.error(message);
        },
      }
    );
  };

  const handleVerify = () => {
    if (!reference) {
      toast.error("Missing verification reference");
      return;
    }
    verifyEmail.mutate(
      { reference, otp, email },
      {
        onSuccess: (response) => {
          toast.success(response.message || "Email verified");
          onDone?.();
          router.push("/");
        },
        onError: (error) => {
          const message =
            error instanceof AxiosError
              ? (error.response?.data?.message as string) ||
                "Verification failed"
              : "Verification failed";
          toast.error(message);
        },
      }
    );
  };

  const maskedEmail = () => {
    const [name, domain] = email.split("@");
    if (!domain) return email || "your email";
    return (
      name.slice(0, 2) +
      "*".repeat(Math.max(0, name.length - 2)) +
      "@" +
      domain
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A 6-digit code has been sent to{" "}
          <span className="font-medium text-foreground">{maskedEmail()}</span>.
        </p>
      </div>

      <InputOTP maxLength={6} value={otp} onChange={setOtp} className="w-full">
        <InputOTPGroup className="flex w-full">
          <InputOTPSlot index={0} className="flex-1" />
          <InputOTPSlot index={1} className="flex-1" />
          <InputOTPSlot index={2} className="flex-1" />
          <InputOTPSlot index={3} className="flex-1" />
          <InputOTPSlot index={4} className="flex-1" />
          <InputOTPSlot index={5} className="flex-1" />
        </InputOTPGroup>
      </InputOTP>

      <Button
        type="button"
        size="lg"
        disabled={otp.length !== 6 || verifyEmail.isPending}
        className="w-full"
        onClick={handleVerify}
      >
        {verifyEmail.isPending && (
          <LoaderCircle className="size-4 animate-spin" />
        )}
        Verify email
      </Button>

      <div className="flex items-center justify-center gap-1 text-sm">
        <span className="text-muted-foreground">Didn&apos;t receive a code?</span>
        <Button
          type="button"
          variant="ghost"
          disabled={!canResend || resendVerification.isPending}
          onClick={handleResend}
          className="font-medium text-primary hover:underline"
        >
          {resendVerification.isPending
            ? "Resending..."
            : canResend
              ? "Resend code"
              : `0:${timer.toString().padStart(2, "0")}s`}
        </Button>
      </div>
    </div>
  );
}
