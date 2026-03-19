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
    <section id="how-it-works" className="border-b border-border/60 bg-muted/50 py-16 sm:py-24 scroll-mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("title")}
          </Link>
          <h2 className="mt-2.5 text-2xl font-bold text-foreground sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-3.5 text-muted-foreground text-sm sm:text-base leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
        <div className="mt-14 flex flex-col gap-8 sm:gap-10 lg:flex-row lg:items-stretch lg:gap-7 lg:max-w-4xl lg:mx-auto">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative flex flex-1 flex-col lg:flex-row lg:items-center">
                <div className="card-hover relative flex flex-col items-center text-center rounded-2xl border border-border/60 bg-card p-7 sm:p-9 shadow-card flex-1">
                  <span className="absolute top-4 start-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm">
                    {i + 1}
                  </span>
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">
                    {t(step.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground flex-1 leading-relaxed">
                    {t(step.descKey)}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block w-7 shrink-0 self-center h-0 border-t-2 border-dashed border-primary/25" aria-hidden />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
