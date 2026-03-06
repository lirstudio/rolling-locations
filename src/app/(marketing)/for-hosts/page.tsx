"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  UserPlus,
  MapPin,
  CalendarClock,
  Send,
  Inbox,
  Eye,
  LayoutList,
  Sliders,
  BadgeCheck,
  Camera,
  FileText,
  Banknote,
  ClipboardList,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SIGN_UP_URL = "/auth/sign-up";

export default function ForHostsPage() {
  const t = useTranslations("marketing.forHostsPage");
  const tTestimonials = useTranslations("marketing.testimonials");

  const benefits = [
    { icon: Eye, titleKey: "visibility" as const, descKey: "visibilityDesc" as const },
    { icon: LayoutList, titleKey: "inbox" as const, descKey: "inboxDesc" as const },
    { icon: Sliders, titleKey: "control" as const, descKey: "controlDesc" as const },
    { icon: BadgeCheck, titleKey: "noFee" as const, descKey: "noFeeDesc" as const },
  ];

  const processSteps = [
    { icon: UserPlus, titleKey: "step1Title" as const, descKey: "step1Desc" as const },
    { icon: MapPin, titleKey: "step2Title" as const, descKey: "step2Desc" as const },
    { icon: CalendarClock, titleKey: "step3Title" as const, descKey: "step3Desc" as const },
    { icon: Send, titleKey: "step4Title" as const, descKey: "step4Desc" as const },
    { icon: Inbox, titleKey: "step5Title" as const, descKey: "step5Desc" as const },
  ];

  const prepareItems = [
    { icon: Camera, key: "photos" as const },
    { icon: FileText, key: "description" as const },
    { icon: Banknote, key: "pricing" as const },
    { icon: ClipboardList, key: "rules" as const },
    { icon: Calendar, key: "availability" as const },
  ];

  return (
    <div className="container px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{t("hero.title")}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("hero.subtitle")}</p>
          <Button size="lg" className="mt-8" asChild>
            <Link href={SIGN_UP_URL}>{t("hero.cta")}</Link>
          </Button>
        </section>

        {/* Benefits */}
        <section className="mt-12 sm:mt-16">
          <h2 className="text-xl font-semibold text-foreground">{t("benefits.title")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-muted/30 p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold text-foreground">{t(`benefits.${b.titleKey}`)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(`benefits.${b.descKey}`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="mt-12 sm:mt-16">
          <h2 className="text-xl font-semibold text-foreground">{t("process.title")}</h2>
          <ul className="mt-6 space-y-6">
            {processSteps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t(`process.${step.titleKey}`)}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{t(`process.${step.descKey}`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* What to prepare */}
        <section className="mt-12 sm:mt-16">
          <h2 className="text-xl font-semibold text-foreground">{t("whatToPrepare.title")}</h2>
          <ul className="mt-6 space-y-4">
            {prepareItems.map((item, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-muted-foreground">{t(`whatToPrepare.${item.key}`)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Who is it for */}
        <section className="mt-12 sm:mt-16 rounded-xl border border-border bg-muted/30 p-6">
          <h2 className="text-lg font-semibold text-foreground">{t("whoIsItFor.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("whoIsItFor.body")}</p>
        </section>

        {/* Eligibility */}
        <p className="mt-6 text-sm text-muted-foreground">{t("eligibility")}</p>

        {/* FAQ & Contact */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/faq">{t("faqLink")}</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/contact">{t("contactLink")}</Link>
          </Button>
        </div>

        {/* Testimonial */}
        <Card className="mt-12 border border-border bg-card">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">&ldquo;{tTestimonials("quote2")}&rdquo;</p>
            <p className="mt-3 text-sm font-medium text-foreground">{tTestimonials("author2")}</p>
            <p className="text-xs text-muted-foreground">{tTestimonials("role2")}</p>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href={SIGN_UP_URL}>{t("ctaBottom")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
