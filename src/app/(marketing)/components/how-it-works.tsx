"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Search, CalendarCheck, ThumbsUp } from "lucide-react";

const steps = [
  { icon: Search, titleKey: "step1Title", descKey: "step1Desc" },
  { icon: CalendarCheck, titleKey: "step2Title", descKey: "step2Desc" },
  { icon: ThumbsUp, titleKey: "step3Title", descKey: "step3Desc" },
] as const;

export function HowItWorks() {
  const t = useTranslations("marketing.howItWorks");

  return (
    <section id="how-it-works" className="border-b border-border bg-muted/50 py-14 sm:py-20 scroll-mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("title")}
          </Link>
          <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            {t("subtitle")}
          </p>
        </div>
        <div className="mt-12 flex flex-col gap-8 sm:gap-10 lg:flex-row lg:items-stretch lg:gap-6 lg:max-w-4xl lg:mx-auto">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative flex flex-1 flex-col lg:flex-row lg:items-center">
                <div className="relative flex flex-col items-center text-center rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm flex-1">
                  <span className="absolute top-4 start-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {i + 1}
                  </span>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">
                    {t(step.titleKey)}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground flex-1">
                    {t(step.descKey)}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block w-6 shrink-0 self-center h-0 border-t-2 border-dashed border-primary/30" aria-hidden />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
