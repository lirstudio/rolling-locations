"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { LocationCard } from "@/components/locations/location-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePublishedLocations } from "@/hooks/use-published-locations";
import { mockCategories } from "@/mocks/categories";
import type { Location } from "@/types";

const PAGE_SIZE = 6;
const PRICE_MIN = 0;
const PRICE_MAX = 5000;
const PRICE_STEP = 100;

type LocationTypeFilter = "all" | "indoor" | "outdoor";

const OUTDOOR_CATEGORY_IDS = new Set(
  mockCategories.filter((c) => c.slug === "outdoor-photography").map((c) => c.id)
);

function matchLocationType(loc: Location, type: LocationTypeFilter): boolean {
  if (type === "all") return true;
  const isOutdoor = loc.categoryIds.some((id) => OUTDOOR_CATEGORY_IDS.has(id));
  return type === "outdoor" ? isOutdoor : !isOutdoor;
}


export default function LocationsIndexPage() {
  const t = useTranslations("marketing.locationsIndex");
  const locale = useLocale();
  const dir = locale === "he" ? "rtl" : "ltr";
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "";
  const cityParam = searchParams.get("city") ?? "";
  const queryParam = searchParams.get("q") ?? "";

  const { locations: publishedLocations } = usePublishedLocations();

  const topLevelCategories = useMemo(
    () => mockCategories.filter((c) => c.visible && !c.parentId),
    []
  );

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(() => {
    if (!categoryParam) return [];
    const cat = mockCategories.find((c) => c.slug === categoryParam);
    return cat ? [cat.id] : [];
  });
  const [locationType, setLocationType] = useState<LocationTypeFilter>("all");
  const [city, setCity] = useState(cityParam);
  const [query, setQuery] = useState(queryParam);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
    setPage(1);
  };

  const isPriceFiltered = priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX;

  const filtered = useMemo(() => {
    let list = publishedLocations;
    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(needle) ||
          l.description.toLowerCase().includes(needle) ||
          l.address.city.toLowerCase().includes(needle)
      );
    }
    if (selectedCategoryIds.length > 0) {
      list = list.filter((l) =>
        l.categoryIds.some((id) => selectedCategoryIds.includes(id))
      );
    }
    list = list.filter((l) => matchLocationType(l, locationType));
    if (city) {
      list = list.filter((l) =>
        l.address.city.toLowerCase().includes(city.toLowerCase())
      );
    }
    list = list.filter(
      (l) => l.pricing.dailyRate >= priceRange[0] && l.pricing.dailyRate <= priceRange[1]
    );
    return list;
  }, [publishedLocations, query, selectedCategoryIds, locationType, city, priceRange]);

  const paginated = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page]
  );
  const hasMore = paginated.length < filtered.length;
  const activeFilters =
    (query ? 1 : 0) +
    (selectedCategoryIds.length > 0 ? 1 : 0) +
    (locationType !== "all" ? 1 : 0) +
    (city ? 1 : 0) +
    (isPriceFiltered ? 1 : 0);

  const clearFilters = () => {
    setQuery("");
    setSelectedCategoryIds([]);
    setLocationType("all");
    setCity("");
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setPage(1);
  };

  const filterPanel = (
    <div className="space-y-6">
      {/* Free-text search */}
      <div className="space-y-2">
        <Label className="text-foreground">{t("search")}</Label>
        <div className="relative">
          <Search className="absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="h-9 ps-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setPage(1); }}
              className="absolute top-1/2 end-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={t("clearFilters")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-3">
        <Label className="text-foreground">{t("category")}</Label>
        <div className="flex flex-col gap-2">
          {topLevelCategories.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={selectedCategoryIds.includes(c.id)}
                onCheckedChange={() => toggleCategory(c.id)}
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      {/* Location type */}
      <div className="space-y-2">
        <Label className="text-foreground">{t("type")}</Label>
        <Select
          value={locationType}
          onValueChange={(v) => {
            setLocationType(v as LocationTypeFilter);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">—</SelectItem>
            <SelectItem value="indoor">{t("typeIndoor")}</SelectItem>
            <SelectItem value="outdoor">{t("typeOutdoor")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label className="text-foreground">{t("city")}</Label>
        <div className="relative">
          <Input
            type="text"
            placeholder="—"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
            className="h-9 pe-8"
          />
          {city && (
            <button
              type="button"
              onClick={() => { setCity(""); setPage(1); }}
              className="absolute top-1/2 end-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={t("clearFilters")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Price range */}
      <div className="space-y-3">
        <Label className="text-foreground">{t("priceRange")}</Label>
        <p className="text-sm font-medium text-foreground tabular-nums">
          ₪{priceRange[0].toLocaleString()}
          {" – "}
          {priceRange[1] >= PRICE_MAX
            ? `₪${PRICE_MAX.toLocaleString()}+`
            : `₪${priceRange[1].toLocaleString()}`}
          <span className="text-muted-foreground font-normal">
            {" "}/{t("pricePerDayUnit")}
          </span>
        </p>
        <Slider
          dir={dir}
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={priceRange}
          onValueChange={(v) => {
            setPriceRange(v as [number, number]);
            setPage(1);
          }}
          className="mt-1"
        />
      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
        {t("clearFilters")}
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl tracking-tight">{t("title")}</h1>
        <p className="mt-2.5 text-muted-foreground leading-relaxed">{t("intro")}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {/* Mobile filter trigger */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 lg:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                {t("showFilters")}
                {activeFilters > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {activeFilters}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side={dir === "rtl" ? "right" : "left"} className="w-80 overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>{t("showFilters")}</SheetTitle>
              </SheetHeader>
              {filterPanel}
            </SheetContent>
          </Sheet>

          {activeFilters > 0 && (
            <Button variant="secondary" size="sm" onClick={clearFilters} className="gap-1">
              <X className="h-3.5 w-3.5" />
              {t("clearFilters")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="hidden lg:block space-y-6 rounded-2xl border border-border/60 bg-muted/30 p-5 shadow-card h-fit sticky top-24">
          {filterPanel}
        </aside>

        <div>
          {paginated.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-16 text-center shadow-card">
              <h2 className="text-lg font-semibold text-foreground">{t("emptyTitle")}</h2>
              <p className="mt-2.5 text-muted-foreground">{t("emptyDesc")}</p>
              <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button variant="outline" className="rounded-full" onClick={clearFilters}>
                  {t("clearFilters")}
                </Button>
                <Button className="rounded-full" asChild>
                  <Link href="/">{t("backToHome")}</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginated.map((loc) => (
                  <LocationCard key={loc.id} location={loc} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <Button variant="outline" className="rounded-full px-8" onClick={() => setPage((p) => p + 1)}>
                    {t("loadMore")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
