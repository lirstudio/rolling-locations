"use client";

// MVP_BYPASS: Auth guard disabled for testing — mail service unavailable.
// Re-enable by removing the early return below.

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  return <>{children}</>;
}
