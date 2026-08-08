"use client";

import Link from "next/link";
import { Home, RefreshCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <TriangleAlert className="h-8 w-8 text-destructive" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-primary">
          Something went wrong
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          We couldn&apos;t load this page
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Try again. If the problem keeps happening, Worker may be temporarily
          unavailable — please check back shortly.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={reset}>
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Button>
        </div>
        {error?.digest ? (
          <p className="mt-6 text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
