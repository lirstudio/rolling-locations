"use client";

import { useRef, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublishedLocations } from "@/hooks/use-published-locations";
import { mockCategories } from "@/mocks/categories";
import { LocationCard } from "@/components/locations/location-card";

const CARD_WIDTH = 300;
const GAP = 20;

export function FeaturedLocations() {
  const t = useTranslations("marketing.featuredLocations");
  const tCat = useTranslations("marketing.categories");
  const tLoc = useTranslations("locations");
  const tCommon = useTranslations("common");

  const [activeCategory, setActiveCategoryRaw] = useState<string | null>(null);
  const { locations, loading } = usePublishedLocations();
  const scrollRef = useRef<HTMLDivElement>(null);

  const setActiveCategory = (id: string | null) => {
    setActiveCategoryRaw(id);
    scrollRef.current?.scrollTo({ left: 0, behavior: "instant" });
  };

  const topCategories = useMemo(
    () => mockCategories.filter((c) => !c.parentId && c.visible),
    []
  );

  const filtered = useMemo(() => {
    if (!activeCategory) return locations;
    return locations.filter((loc) => loc.categoryIds.includes(activeCategory));
  }, [locations, activeCategory]);

  const scroll = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = CARD_WIDTH + GAP;
    const isRtl =
      typeof document !== "undefined" && document.documentElement.dir === "rtl";
    const delta =
      direction === "next" ? (isRtl ? -step : step) : isRtl ? step : -step;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  if (!loading && locations.length === 0) return null;

  return (
    <section className="bg-muted/40 py-14 sm:py-20">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("title")}
          </h2>
          <Button asChild className="rounded-full gap-1.5 px-5 w-fit">
            <Link href="/locations">
              {t("viewAll")}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Category filter chips */}
        <div className="mt-6 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
          <div className="flex gap-2 min-w-0 pb-2 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 snap-start rounded-full border px-5 py-2.5 font-medium text-sm transition-colors ${
                activeCategory === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              {tCat("allCategories")}
            </button>
            {topCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setActiveCategory(activeCategory === cat.id ? null : cat.id)
                }
                className={`shrink-0 snap-start rounded-full border px-5 py-2.5 font-medium text-sm transition-colors ${
                  activeCategory === cat.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                {tLoc(`categories.${cat.slug}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Location cards */}
        {loading ? (
          <div className="mt-10 flex gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[min(260px,80vw)] sm:w-[280px] lg:w-[calc(25%-15px)] aspect-[3/4] rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-muted-foreground text-sm">
              {tLoc("emptyCategory")}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveCategory(null)}
            >
              {tCat("allCategories")}
            </Button>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="mt-10 flex gap-5 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 snap-x"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {filtered.map((loc) => (
              <div
                key={loc.id}
                className="shrink-0 snap-start w-[min(260px,80vw)] sm:w-[280px] lg:w-[calc(25%-15px)]"
                style={{ scrollSnapAlign: "start" }}
              >
                <LocationCard location={loc} variant="compact" />
              </div>
            ))}
          </div>
        )}

        {/* Navigation + subtitle */}
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
