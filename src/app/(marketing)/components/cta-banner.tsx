"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function CTABanner() {
  const t = useTranslations("marketing.ctaBanner");

  return (
    <section id="cta-banner" className="border-b border-border bg-primary py-16 sm:py-20 text-primary-foreground scroll-mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-primary-foreground/90 max-w-xl mx-auto text-base sm:text-lg">{t("subtitle")}</p>
        <Button size="lg" className="mt-8 px-8 text-base bg-primary-foreground text-primary hover:bg-primary-foreground/90" asChild>
          <Link href="/auth/sign-up">{t("cta")}</Link>
        </Button>
      </div>
    </section>
  );
}
