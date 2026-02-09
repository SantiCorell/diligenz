"use client";

import ErrorFallbackContent from "@/components/ErrorFallbackContent";

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallbackContent onRetry={reset} showRetry />;
}
