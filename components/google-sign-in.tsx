"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

import { useGoogleAuth } from "@/hooks/api/useAuth";
import { worker } from "@/lib/api/worker";
import { AccountType } from "@/types/api/auth";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDashboardRoute } from "@/lib/utils";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          prompt: (listener?: (notification: { isNotDisplayed: () => boolean; getNotDisplayedReason: () => string }) => void) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GOOGLE_PROFILE_KEY = "worker_google_profile";

function decodeJwtPayload(token: string): Record<string, string> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as Record<string, string>;
  } catch {
    return null;
  }
}

export function GoogleSignInButton({
  className = "",
  label = "Continue with Google",
  accountType,
}: {
  className?: string;
  label?: string;
  accountType?: AccountType;
}) {
  const router = useRouter();
  const googleAuth = useGoogleAuth();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(
    () => typeof window !== "undefined" && Boolean(window.google?.accounts?.id)
  );
  const [scriptFailed, setScriptFailed] = useState(!GOOGLE_CLIENT_ID);

  const [passwordStep, setPasswordStep] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [pendingDestination, setPendingDestination] = useState<{
    type: string;
    profileComplete: boolean;
  } | null>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    if (window.google?.accounts?.id) return;

    const loadScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setScriptFailed(true);
      document.head.appendChild(script);
    };

    loadScript();
  }, []);

  const continueAfterPassword = () => {
    if (!pendingDestination) {
      router.push(
        getDashboardRoute({ accountType: AccountType.TALENT, roles: [] })
      );
      return;
    }
    if (!pendingDestination.profileComplete) {
      router.push(`/complete-profile?type=${pendingDestination.type}`);
      return;
    }
    router.push(
      getDashboardRoute({
        accountType: pendingDestination.type as AccountType,
        roles: [],
      })
    );
  };

  const handleSetPassword = async () => {
    setPasswordError("");
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await worker.auth.post("/auth/change-password", {
        new_password: password,
      });
      if (!res.success) {
        setPasswordError(res.message || "Failed to set password");
        setPasswordLoading(false);
        return;
      }
      toast.success("Password set. You can now sign in with email and password.");
      continueAfterPassword();
    } catch {
      setPasswordError("Failed to set password. Please try again.");
      setPasswordLoading(false);
    }
  };

  const handleSkipPassword = () => {
    continueAfterPassword();
  };

  const handleGoogleResponse = (response: { credential: string }) => {
    const payload = decodeJwtPayload(response.credential);
    if (payload) {
      window.localStorage.setItem(
        GOOGLE_PROFILE_KEY,
        JSON.stringify({
          firstName: payload.given_name || "",
          lastName: payload.family_name || "",
          email: payload.email || "",
        })
      );
    }

    googleAuth.mutate(
      {
        id_token: response.credential,
        account_type: accountType,
        terms_accepted: accountType ? true : undefined,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message || "Signed in with Google");
          const type =
            accountType || data.data.user.accountType || AccountType.TALENT;
          if (data.data.is_new_user) {
            setPendingDestination({
              type,
              profileComplete: data.data.profile_complete,
            });
            setPasswordStep(true);
            return;
          }
          if (!data.data.profile_complete) {
            router.push(`/complete-profile?type=${type}`);
          } else {
            router.push(getDashboardRoute(data.data.user));
          }
        },
        onError: (error) => {
          const message =
            error instanceof AxiosError
              ? (error.response?.data?.message as string) ||
                (error.response?.data?.error?.message as string) ||
                "Google sign-in failed"
              : "Google sign-in failed";
          toast.error(message);
        },
      }
    );
  };

  const handleClick = () => {
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });

    window.google.accounts.id.prompt();
  };

  if (passwordStep) {
    return (
      <div
        className={`w-full space-y-3 rounded-md border border-border bg-background p-4 text-left ${className}`}
      >
        <div>
          <p className="text-sm font-semibold">Set a password</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Your Google account was created. Set a password so you can also
            sign in with your email and password.
          </p>
        </div>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 8 characters)"
          minLength={8}
        />
        {passwordError && (
          <p className="text-xs text-destructive">{passwordError}</p>
        )}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleSetPassword}
            disabled={passwordLoading}
            className="flex-1"
          >
            {passwordLoading && (
              <LoaderCircle className="size-4 animate-spin" />
            )}
            {passwordLoading ? "Saving..." : "Set password & continue"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleSkipPassword}
          >
            Skip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      disabled={!scriptLoaded || scriptFailed || googleAuth.isPending}
      className={`inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      {googleAuth.isPending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      {scriptFailed && !GOOGLE_CLIENT_ID ? "Google sign-in unavailable" : label}
    </button>
  );
}
