"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FAQ_KEYS = [
  { q: "q1", a: "a1" },
  { q: "q2", a: "a2" },
  { q: "q3", a: "a3" },
  { q: "q4", a: "a4" },
] as const;

const accordionItemClassName = cn(
  "!border-b-0 overflow-hidden rounded-xl border border-border-subtle bg-card",
  "transition-colors hover:bg-surface-hover",
  /* Open = same neutral gray as hover (no muted gradient — muted can read pink on white) */
  "data-[state=open]:bg-surface-hover"
);

const accordionTriggerClassName = cn(
  "px-6 py-5 text-start text-base font-medium hover:no-underline hover:bg-transparent focus-visible:bg-transparent",
  /* Override accordion.tsx: default focus uses --ring (brand red) */
  "focus-visible:!border-border focus-visible:!ring-foreground/15 focus-visible:ring-offset-0",
  "text-foreground/70 data-[state=open]:font-semibold data-[state=open]:text-foreground",
  "[&[data-state=open]>svg]:text-muted-foreground"
);

const accordionContentClassName = "px-6 pb-5 pt-0 text-sm leading-relaxed text-muted-foreground";

export type MarketingFaqSectionProps = {
  id?: string;
  heading: "h1" | "h2";
  className?: string;
};

export function MarketingFaqSection({ id, heading, className }: MarketingFaqSectionProps) {
  const t = useTranslations("marketing.faq");

  return (
    <section
      id={id}
      className={cn(
        "border-b border-border/40 bg-gradient-to-b from-transparent via-surface-hover/35 to-transparent py-16 sm:py-24",
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center sm:mb-12">
            {heading === "h1" ? (
              <h1 className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
                {t("title")}
              </h1>
            ) : (
              <h2 className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
                {t("title")}
              </h2>
            )}
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">{t("subtitle")}</p>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {FAQ_KEYS.map(({ q, a }) => (
              <AccordionItem key={q} value={q} className={accordionItemClassName}>
                <AccordionTrigger className={accordionTriggerClassName}>{t(q)}</AccordionTrigger>
                <AccordionContent className={accordionContentClassName}>{t(a)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-10 flex justify-center sm:mt-12">
            <Button asChild>
              <Link href="/locations">{t("cta")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
