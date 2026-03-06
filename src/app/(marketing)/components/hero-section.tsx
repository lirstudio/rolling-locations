"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=80";

export function HeroSection() {
  const t = useTranslations("marketing.hero");

  return (
    <section className="relative">
      {/* Full-width hero image background */}
      <div className="relative min-h-[420px] sm:min-h-[500px] lg:min-h-[560px]">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Centered text content */}
        <div className="relative z-10 flex h-full min-h-[420px] sm:min-h-[500px] lg:min-h-[560px] flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center pb-16">
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl drop-shadow-md">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg drop-shadow-sm">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Search bar — overlapping the hero bottom edge */}
      <div className="relative z-20 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-14">
        <div className="rounded-xl border border-border bg-card p-4 shadow-lg sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            {/* Location field */}
            <div className="flex-1 min-w-0">
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                {t("searchCity")}
              </label>
              <div className="relative">
                <MapPin className="absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("searchCity")}
                  className="bg-background ps-10 pe-4"
                  readOnly
                  aria-label={t("searchCity")}
                />
              </div>
            </div>
            {/* Category field */}
            <div className="flex-1 min-w-0">
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                {t("searchCategory")}
              </label>
              <div className="relative">
                <Tag className="absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("searchCategory")}
                  className="bg-background ps-10 pe-4"
                  readOnly
                  aria-label={t("searchCategory")}
                />
              </div>
            </div>
            {/* CTA */}
            <Button size="lg" asChild className="shrink-0 w-full sm:w-auto">
              <Link href="/locations">
                {t("cta")}
                <ArrowLeft className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      {/* Spacer so next section doesn't overlap */}
      <div className="h-8 sm:h-10" />
    </section>
  );
}
