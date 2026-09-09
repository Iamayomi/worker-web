"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { useGoogleAuth } from "@/hooks/api/useAuth";
import { errorMessage } from "@/lib/api/api-client";
import { AccountType } from "@/types/api/auth";
import { GoogleIcon } from "@/components/icons/google-icon";
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

export function GoogleSignInButton({
  className = "",
  label = "Continue with Google",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const googleAuth = useGoogleAuth();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(
    () => typeof window !== "undefined" && Boolean(window.google?.accounts?.id)
  );
  const [scriptFailed, setScriptFailed] = useState(!GOOGLE_CLIENT_ID);

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

  const handleGoogleResponse = (response: { credential: string }) => {
    googleAuth.mutate(
      { id_token: response.credential },
      {
        onSuccess: (data) => {
          toast.success(data.message || "Signed in with Google");
          const type =
            data.data.user.accountType || AccountType.TALENT;
          if (!data.data.profile_complete) {
            router.push(`/complete-profile?type=${type}`);
          } else {
            router.push(getDashboardRoute(data.data.user));
          }
        },
        onError: (error) => {
          toast.error(errorMessage(error, "Google sign-in failed"));
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
      className={`inline-flex h-9 w-full items-center justify-center gap-2 border border-border bg-background px-4 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 ${className}`}
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