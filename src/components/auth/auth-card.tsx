"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  const t = useTranslations("common");

  return (
    <div className="relative bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_oklch(0.44_0.22_27_/_4%)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_oklch(0.44_0.22_27_/_3%)_0%,_transparent_50%)]" />
      <div className="absolute top-4 end-4 z-20">
        <ThemeToggle />
      </div>
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 self-center text-lg font-semibold tracking-tight"
        >
          {t("appName")}
        </Link>
        {children}
      </div>
    </div>
  );
}
