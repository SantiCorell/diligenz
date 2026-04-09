"use client";

import ErrorFallbackContent from "@/components/ErrorFallbackContent";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;
  return <ErrorFallbackContent onRetry={reset} showRetry />;
}
