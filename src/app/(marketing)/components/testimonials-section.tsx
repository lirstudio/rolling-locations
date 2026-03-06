"use client";

import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TESTIMONIALS = [
  { quoteKey: "quote1", authorKey: "author1", roleKey: "role1" },
  { quoteKey: "quote2", authorKey: "author2", roleKey: "role2" },
  { quoteKey: "quote3", authorKey: "author3", roleKey: "role3" },
] as const;

const STATS = [
  { value: "120+", labelKey: "hosts" as const },
  { value: "3.5k+", labelKey: "bookings" as const },
  { value: "15", labelKey: "cities" as const },
];

export function TestimonialsSection() {
  const t = useTranslations("marketing.testimonials");
  const tStats = useTranslations("marketing.stats");

  return (
    <section className="border-b border-border bg-background py-12 sm:py-16">
      <div className="container px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{t("title")}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map(({ quoteKey, authorKey, roleKey }) => (
            <Card
              key={quoteKey}
              className="border border-border bg-card rounded-xl shadow-sm"
            >
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Quote className="h-6 w-6" />
                </div>
                <p className="mt-4 text-muted-foreground leading-relaxed">{t(quoteKey)}</p>
                <p className="mt-4 font-medium text-foreground">{t(authorKey)}</p>
                <p className="text-sm text-muted-foreground">{t(roleKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Stats trust bar */}
        <div className="mt-12 rounded-xl border border-border bg-muted/50 px-6 py-6 sm:px-8">
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8 sm:justify-center">
            {STATS.map(({ value, labelKey }) => (
              <div key={labelKey} className="text-center sm:min-w-[120px]">
                <p className="text-2xl font-bold text-primary sm:text-3xl">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tStats(labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
