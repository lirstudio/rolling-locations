"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublishedLocations } from "@/hooks/use-published-locations";
import { mockCategories } from "@/mocks/categories";
import { LocationCard } from "@/components/locations/location-card";

export function FeaturedLocations() {
  const t = useTranslations("marketing.featuredLocations");
  const tCat = useTranslations("marketing.categories");
  const tLoc = useTranslations("locations");
  const [activeCategory, setActiveCategoryRaw] = useState<string | null>(null);
  const { locations, loading } = usePublishedLocations();

  const setActiveCategory = (id: string | null) => {
    setActiveCategoryRaw(id);
  };

  const topCategories = useMemo(
    () => mockCategories.filter((c) => !c.parentId && c.visible),
    []
  );

  const filtered = useMemo(() => {
    if (!activeCategory) return locations;
    return locations.filter((loc) => loc.categoryIds.includes(activeCategory));
  }, [locations, activeCategory]);

  if (!loading && locations.length === 0) return null;

  return (
    <section className="bg-muted/40 py-14 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Location cards — same component as discover page (/locations) */}
        {loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] overflow-hidden rounded-xl bg-muted animate-pulse"
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
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((loc) => (
              <LocationCard key={loc.id} location={loc} />
            ))}
          </div>
        )}

        <p className="mt-8 text-sm text-muted-foreground max-w-md text-start sm:text-end leading-relaxed">
          {t("subtitle")}
        </p>
      </div>
    </section>
  );
}
