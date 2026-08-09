"use client";

import Link from "next/link";
import { Home, RefreshCcw, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  onRetry?: () => void;
  retryLabel?: string;
  showHome?: boolean;
  errorId?: string;
  className?: string;
  variant?: "page" | "card";
}

/**
 * Shared, styled error state. Used by the root error boundary (variant="page")
 * and by pages whose primary data failed to load (variant="card").
 */
export function ErrorPage({
  title = "Something went wrong",
  description = "We couldn't load this. Try again — if the problem keeps happening, please check back shortly.",
  icon: Icon = TriangleAlert,
  onRetry,
  retryLabel = "Try again",
  showHome = false,
  errorId,
  className,
  variant = "page",
}: ErrorPageProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variant === "page"
          ? "min-h-dvh px-6 py-16"
          : "rounded-lg border border-destructive/20 bg-destructive/5 px-6 py-12",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-destructive/10",
          variant === "page" ? "h-16 w-16" : "h-12 w-12",
        )}
      >
        <Icon
          className={cn(
            "text-destructive",
            variant === "page" ? "h-8 w-8" : "h-6 w-6",
          )}
        />
      </div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-primary">
        {variant === "page" ? "Something went wrong" : "Failed to load"}
      </p>
      <h1
        className={cn(
          "font-bold tracking-tight",
          variant === "page"
            ? "mt-2 text-3xl"
            : "mt-2 text-lg",
        )}
      >
        {title}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {(onRetry || showHome) && (
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {onRetry && (
            <Button type="button" onClick={onRetry}>
              <RefreshCcw className="h-4 w-4" />
              {retryLabel}
            </Button>
          )}
          {showHome && (
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="h-4 w-4" />
                Go home
              </Link>
            </Button>
          )}
        </div>
      )}
      {errorId && (
        <p className="mt-6 text-xs text-muted-foreground">
          Error ID: {errorId}
        </p>
      )}
    </div>
  );
}
