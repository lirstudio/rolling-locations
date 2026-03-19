"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { APP_VERSION } from "@/generated/version";

export function SiteFooter() {
  const t = useTranslations("marketing.footer");

  return (
    <footer className="border-t border-border/40 bg-muted/20 px-4 py-4">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 text-center sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">
            {t("terms")}
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            {t("privacy")}
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("version")} {APP_VERSION}
        </p>
      </div>
    </footer>
  );
}
