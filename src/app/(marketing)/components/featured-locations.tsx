"use client";

import { useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationCard } from "@/components/marketing/location-card";
import { MOCK_LOCATIONS } from "@/data/mock-locations";

const FEATURED_COUNT = 4;
const CARD_WIDTH = 300;
const GAP = 20;

export function FeaturedLocations() {
  const t = useTranslations("marketing.featuredLocations");
  const tCommon = useTranslations("common");
  const featured = MOCK_LOCATIONS.slice(0, FEATURED_COUNT);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = CARD_WIDTH + GAP;
    const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";
    const delta = direction === "next" ? (isRtl ? -step : step) : (isRtl ? step : -step);
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="bg-muted/40 py-14 sm:py-20">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("title")}
          </h2>

          <div className="flex items-center gap-3">
            <Button
              asChild
              className="rounded-full gap-1.5 px-5"
            >
              <Link href="/locations">
                {t("viewAll")}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="mt-10 flex gap-5 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 snap-x"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {featured.map((loc) => (
            <div
              key={loc.id}
              className="shrink-0 snap-start w-[min(260px,80vw)] sm:w-[280px] lg:w-[calc(25%-15px)]"
              style={{ scrollSnapAlign: "start" }}
            >
              <LocationCard location={loc} />
            </div>
          ))}
        </div>

        {/* Bottom row: arrows + subtitle */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full shrink-0 h-10 w-10 border-foreground/20"
              onClick={() => scroll("prev")}
              aria-label={tCommon("previous")}
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full shrink-0 h-10 w-10 border-foreground/20"
              onClick={() => scroll("next")}
              aria-label={tCommon("next")}
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground max-w-md text-start sm:text-end leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </div>
    </section>
  );
}
