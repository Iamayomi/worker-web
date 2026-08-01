"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

import { useGoogleAuth } from "@/hooks/api/useAuth";
import { AccountType } from "@/types/api/auth";
import { GoogleIcon } from "@/components/icons/google-icon";

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
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setScriptFailed(true);
      return;
    }

    const loadScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setScriptFailed(true);
      document.head.appendChild(script);
    };

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
    } else {
      loadScript();
    }
  }, []);

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
          if (!data.data.profile_complete) {
            const type =
              accountType || data.data.user.accountType || AccountType.TALENT;
            router.push(`/complete-profile?type=${type}`);
          } else {
            router.push("/");
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
