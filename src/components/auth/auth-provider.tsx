"use client";

import { useEffect } from "react";
import { subscribeAuth } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    subscribeAuth();
  }, []);
  return <>{children}</>;
}
