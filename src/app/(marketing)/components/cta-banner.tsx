"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function CTABanner() {
  const t = useTranslations("marketing.ctaBanner");

  return (
    <section id="cta-banner" className="py-16 sm:py-20 scroll-mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto w-[90%] max-w-6xl rounded-3xl bg-primary overflow-hidden text-primary-foreground">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,0,0,0.12)_0%,_transparent_60%)]" />
          <div className="relative z-10 px-8 sm:px-12 lg:px-16 py-20 sm:py-24 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">{t("title")}</h2>
            <p className="mt-5 text-primary-foreground/90 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">{t("subtitle")}</p>
            <Button size="lg" className="mt-10 px-10 text-base rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg" asChild>
              <Link href="/auth/sign-up">{t("cta")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
