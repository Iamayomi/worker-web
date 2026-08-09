"use client";

import { ErrorPage } from "@/components/shared/error-page";

export default function ErrorPageRoot({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      variant="page"
      onRetry={reset}
      showHome
      errorId={error?.digest}
    />
  );
}
