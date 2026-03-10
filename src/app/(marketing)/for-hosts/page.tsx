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
  ArrowLeft,
  Building2,
  Warehouse,
  Home,
  Landmark,
  Factory,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SIGN_UP_URL = "/auth/sign-up";

export default function ForHostsPage() {
  const t = useTranslations("marketing.forHostsPage");

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

  const stats = [
    { valueKey: "locationsValue" as const, labelKey: "locations" as const },
    { valueKey: "hostsValue" as const, labelKey: "hosts" as const },
    { valueKey: "bookingsValue" as const, labelKey: "bookings" as const },
    { valueKey: "satisfactionValue" as const, labelKey: "satisfaction" as const },
  ];

  const spaceTypes = [
    { icon: Building2, labelKey: "typeStudio" as const },
    { icon: Warehouse, labelKey: "typeOffice" as const },
    { icon: Home, labelKey: "typeApartment" as const },
    { icon: Landmark, labelKey: "typeRooftop" as const },
    { icon: Factory, labelKey: "typeIndustrial" as const },
  ];

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/85">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,0,0,0.15)_0%,_transparent_60%)]" />

        <div className="relative z-10 container px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium tracking-wide text-white/90 backdrop-blur-sm border border-white/10">
              {t("hero.badge")}
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("hero.title")}
            </h1>

            <p className="mt-5 text-lg text-white/85 sm:text-xl leading-relaxed max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>

            <Button
              size="lg"
              className="mt-10 px-10 text-base bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/10"
              asChild
            >
              <Link href={SIGN_UP_URL}>
                {t("hero.cta")}
                <ArrowLeft className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="relative z-20 border-b border-border bg-card">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x rtl:lg:divide-x-reverse divide-border">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center py-8 sm:py-10">
                <span className="text-3xl font-bold text-primary sm:text-4xl">
                  {t(`stats.${stat.valueKey}`)}
                </span>
                <span className="mt-1.5 text-sm text-muted-foreground font-medium">
                  {t(`stats.${stat.labelKey}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="bg-background py-16 sm:py-24">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
              {t("benefits.title")}
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="group relative rounded-xl border border-border bg-card p-7 sm:p-8 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {t(`benefits.${b.titleKey}`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`benefits.${b.descKey}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process / How it works ── */}
      <section className="bg-muted/50 py-16 sm:py-24 border-y border-border">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
              {t("process.title")}
            </h2>
          </div>

          <div className="mx-auto mt-14 max-w-3xl">
            <div className="relative">
              {/* Vertical connector line */}
              <div className="absolute start-6 top-0 bottom-0 w-px bg-border sm:start-7" aria-hidden />

              <ul className="relative space-y-10">
                {processSteps.map((step, i) => (
                  <li key={i} className="relative flex gap-5 sm:gap-6">
                    {/* Step number circle */}
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card text-primary font-bold text-sm shadow-sm sm:h-14 sm:w-14 sm:text-base">
                      {i + 1}
                    </div>

                    <div className="pt-2 sm:pt-3">
                      <div className="flex items-center gap-3">
                        <step.icon className="h-5 w-5 text-primary shrink-0" />
                        <h3 className="text-base font-semibold text-foreground sm:text-lg">
                          {t(`process.${step.titleKey}`)}
                        </h3>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {t(`process.${step.descKey}`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── What to prepare ── */}
      <section className="bg-background py-16 sm:py-24">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
              {t("whatToPrepare.title")}
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prepareItems.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/20"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground pt-2">
                  {t(`whatToPrepare.${item.key}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who is it for ── */}
      <section className="bg-muted/50 py-16 sm:py-24 border-y border-border">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
              {t("whoIsItFor.title")}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("whoIsItFor.body")}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {spaceTypes.map((type, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm"
                >
                  <type.icon className="h-4 w-4 text-primary" />
                  {t(`whoIsItFor.${type.labelKey}`)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Eligibility + links ── */}
      <section className="bg-background py-12 sm:py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-muted-foreground">{t("eligibility")}</p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/faq">{t("faqLink")}</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/contact">{t("contactLink")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA banner ── */}
      <section className="bg-primary py-16 sm:py-20 text-primary-foreground">
        <div className="container px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
            {t("ctaBottom")}
          </h2>
          <p className="mt-4 text-primary-foreground/85 max-w-xl mx-auto text-base sm:text-lg">
            {t("hero.subtitle")}
          </p>
          <Button
            size="lg"
            className="mt-8 px-10 text-base bg-white text-primary hover:bg-white/90 shadow-lg"
            asChild
          >
            <Link href={SIGN_UP_URL}>
              {t("hero.cta")}
              <ArrowLeft className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
