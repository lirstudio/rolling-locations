"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublishedLocations } from "@/hooks/use-published-locations";
import { mockCategories } from "@/mocks/categories";
import { LocationCard } from "@/components/locations/location-card";
import { fetchLocationPopularityStats } from "@/app/actions/locations";
import { calculateLocationPopularity } from "@/lib/location-utils";
import type { Location } from "@/types";

interface FeaturedLocationsProps {
  initialData?: Location[];
}

interface LocationSectionProps {
  title: string;
  locations: Location[];
}

function LocationSection({ title, locations }: LocationSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const locale = useLocale();
  const isRTL = locale === "he";

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollability);
    window.addEventListener("resize", checkScrollability);

    return () => {
      container.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [locations]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 400;
    // In RTL: left button scrolls towards start (right side, negative), right button scrolls towards end (left side, positive)
    // In LTR: left button scrolls towards start (left side, negative), right button scrolls towards end (right side, positive)
    const scrollValue = isRTL
      ? direction === "left"
        ? -scrollAmount
        : scrollAmount
      : direction === "left"
        ? -scrollAmount
        : scrollAmount;
    scrollContainerRef.current.scrollBy({
      left: scrollValue,
      behavior: "smooth",
    });
  };

  if (locations.length === 0) return null;

  return (
    <div className="mt-12 first:mt-0">
      <h3 className="text-xl font-bold text-foreground mb-4">{title}</h3>
      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute start-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-border hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Scroll left"
          >
            {isRTL ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute end-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-border hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Scroll right"
          >
            {isRTL ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="flex gap-6 min-w-max sm:min-w-0">
            {locations.slice(0, 12).map((loc) => (
              <div key={loc.id} className="w-[280px] sm:w-[300px] shrink-0">
                <LocationCard location={loc} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturedLocations({ initialData }: FeaturedLocationsProps) {
  const t = useTranslations("marketing.featuredLocations");
  const tLoc = useTranslations("locations");
  const { locations, loading } = usePublishedLocations(initialData);
  const [popularLocations, setPopularLocations] = useState<Location[]>([]);
  const [popularityLoading, setPopularityLoading] = useState(true);

  const topCategories = useMemo(
    () => mockCategories.filter((c) => !c.parentId && c.visible),
    []
  );

  // Fetch popularity stats and calculate popular locations
  useEffect(() => {
    if (loading || locations.length === 0) {
      setPopularityLoading(false);
      return;
    }

    async function loadPopularLocations() {
      setPopularityLoading(true);
      try {
        const locationIds = locations.map((l) => l.id);
        const stats = await fetchLocationPopularityStats(locationIds);

        const locationsWithPopularity = locations.map((loc) => {
          const stat = stats.find((s) => s.locationId === loc.id);
          const popularity = stat
            ? calculateLocationPopularity({
                viewCount: stat.viewCount,
                bookingCount: stat.bookingCount,
                favoriteCount: stat.favoriteCount,
              })
            : 0;
          return { location: loc, popularity };
        });

        const sorted = locationsWithPopularity
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 12)
          .map((item) => item.location);

        setPopularLocations(sorted);
      } catch (error) {
        console.error("[FeaturedLocations] Error loading popularity:", error);
        setPopularLocations([]);
      } finally {
        setPopularityLoading(false);
      }
    }

    loadPopularLocations();
  }, [locations, loading]);

  // Group locations by category
  const locationsByCategory = useMemo(() => {
    const grouped = new Map<string, Location[]>();

    topCategories.forEach((cat) => {
      const categoryLocations = locations.filter((loc) =>
        loc.categoryIds.includes(cat.id)
      );
      if (categoryLocations.length > 0) {
        grouped.set(cat.id, categoryLocations);
      }
    });

    return grouped;
  }, [locations, topCategories]);

  if (!loading && !popularityLoading && locations.length === 0) return null;

  return (
    <section className="bg-muted/40 py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("title")}
          </h2>
          <Button asChild className="rounded-full gap-1.5 px-6 w-fit shadow-card">
            <Link href="/locations">
              {t("viewAll")}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading || popularityLoading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] overflow-hidden rounded-2xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            {/* Popular Locations Section */}
            {popularLocations.length > 0 && (
              <LocationSection
                title={t("popularLocations")}
                locations={popularLocations}
              />
            )}

            {/* Category Sections */}
            {topCategories.map((cat) => {
              const categoryLocations = locationsByCategory.get(cat.id);
              if (!categoryLocations || categoryLocations.length === 0)
                return null;
              return (
                <LocationSection
                  key={cat.id}
                  title={tLoc(`categories.${cat.slug}`)}
                  locations={categoryLocations}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
