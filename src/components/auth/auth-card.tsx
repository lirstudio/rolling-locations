"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  const t = useTranslations("common");

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          {t("appName")}
        </Link>
        {children}
      </div>
    </div>
  );
}
