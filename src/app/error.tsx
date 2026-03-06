"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const tCommon = useTranslations("common");
  const tNotFound = useTranslations("marketing.notFound");

  useEffect(() => {
    // Log to console in dev; optional reporting in prod
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-16 text-center max-w-md mx-auto">
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-destructive/10 text-destructive mb-6"
        aria-hidden
      >
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{tCommon("error")}</h1>
      <p className="mt-3 text-muted-foreground text-sm">
        {error.message || tCommon("error")}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row flex-wrap justify-center gap-4">
        <Button onClick={reset}>{tCommon("retry")}</Button>
        <Button variant="outline" asChild>
          <Link href="/">{tNotFound("backHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
