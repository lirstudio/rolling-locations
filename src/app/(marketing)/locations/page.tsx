"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationCard } from "@/components/marketing/location-card";
import {
  MOCK_LOCATIONS,
  MOCK_CATEGORIES,
} from "@/data/mock-locations";

const PAGE_SIZE = 6;
const PRICE_MIN = 0;
const PRICE_MAX = 300;
const PRICE_STEP = 10;

type LocationTypeFilter = "all" | "indoor" | "outdoor";

function matchLocationType(categorySlug: string, type: LocationTypeFilter): boolean {
  if (type === "all") return true;
  if (type === "outdoor") return categorySlug === "outdoor";
  return categorySlug !== "outdoor";
}

export default function LocationsIndexPage() {
  const t = useTranslations("marketing.locationsIndex");
  const tLoc = useTranslations("locations");
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "";

  const [categories, setCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [locationType, setLocationType] = useState<LocationTypeFilter>("all");
  const [city, setCity] = useState("");
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [page, setPage] = useState(1);

  const toggleCategory = (slug: string) => {
    setCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = [...MOCK_LOCATIONS];
    if (categories.length > 0) {
      list = list.filter((l) => categories.includes(l.categorySlug));
    }
    list = list.filter((l) => matchLocationType(l.categorySlug, locationType));
    if (city) {
      list = list.filter((l) =>
        tLoc(l.cityKey).toLowerCase().includes(city.toLowerCase())
      );
    }
    list = list.filter((l) => l.priceHourly <= priceMax);
    return list;
  }, [categories, locationType, city, priceMax, tLoc]);

  const paginated = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page]
  );
  const hasMore = paginated.length < filtered.length;
  const activeFilters =
    (categories.length > 0 ? 1 : 0) +
    (locationType !== "all" ? 1 : 0) +
    (city ? 1 : 0) +
    (priceMax < PRICE_MAX ? 1 : 0);

  const clearFilters = () => {
    setCategories([]);
    setLocationType("all");
    setCity("");
    setPriceMax(PRICE_MAX);
    setPage(1);
  };

  return (
    <div className="container px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("intro")}</p>
        {activeFilters > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("activeFilters")}:</span>
            <Button variant="secondary" size="sm" onClick={clearFilters} className="gap-1">
              <X className="h-3.5 w-3.5" />
              {t("clearFilters")}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-6 rounded-xl border border-border bg-muted/30 p-4">
          <div className="space-y-3">
            <Label className="text-foreground">{t("category")}</Label>
            <div className="flex flex-col gap-2">
              {MOCK_CATEGORIES.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={categories.includes(c.slug)}
                    onCheckedChange={() => toggleCategory(c.slug)}
                  />
                  {tLoc(`categories.${c.slug}`)}
                </label>
              ))}
            </div>
          </div>
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
          <div className="space-y-2">
            <Label className="text-foreground">{t("city")}</Label>
            <Input
              type="text"
              placeholder="—"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">
              {t("priceRange")} ≤ ₪{priceMax}/hr
            </Label>
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={priceMax}
              onChange={(e) => {
                setPriceMax(Number(e.target.value));
                setPage(1);
              }}
              className="w-full accent-primary"
            />
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
            {t("clearFilters")}
          </Button>
        </aside>

        <div>
          {paginated.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/30 p-12 text-center">
              <h2 className="text-lg font-semibold text-foreground">{t("emptyTitle")}</h2>
              <p className="mt-2 text-muted-foreground">{t("emptyDesc")}</p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button variant="outline" onClick={clearFilters}>
                  {t("clearFilters")}
                </Button>
                <Button asChild>
                  <Link href="/">{t("backToHome")}</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {paginated.map((loc) => (
                  <LocationCard key={loc.id} location={loc} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
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
