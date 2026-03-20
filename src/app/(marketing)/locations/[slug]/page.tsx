"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { format, isSameDay } from "date-fns";
import { he } from "date-fns/locale/he";
import { MapPin, Loader2, Map as MapIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  fetchLocationBySlug,
  fetchPublishedLocations,
  incrementLocationViewCount,
} from "@/app/actions/locations";
import { VideoCarousel } from "@/components/locations/video-carousel";
import { LocationCard } from "@/components/locations/location-card";
import { LocationGallery } from "@/components/locations/location-gallery";
import { LocationMap } from "@/components/maps/location-map";
import { searchAddress } from "@/lib/nominatim";
import { useUnavailableDates } from "@/hooks/use-unavailable-dates";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Location } from "@/types";
import type { DateRange } from "react-day-picker";

function normalizeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export default function LocationDetailsPage() {
  const params = useParams();
  const slugRaw = typeof params.slug === "string" ? params.slug : "";
  const slug = useMemo(() => normalizeSlug(slugRaw), [slugRaw]);
  const t = useTranslations("marketing.locationDetails");

  const [location, setLocation] = useState<Location | null | undefined>(undefined);
  const [similar, setSimilar] = useState<Location[]>([]);

  useEffect(() => {
    setLocation(undefined);
    setSimilar([]);
    fetchLocationBySlug(slug).then((loc) => {
      setLocation(loc);
      if (loc) {
        // Track view count (once per session)
        const viewKey = `viewed_${loc.id}`;
        if (!sessionStorage.getItem(viewKey)) {
          sessionStorage.setItem(viewKey, "true");
          incrementLocationViewCount(loc.id).catch((err) => {
            console.error("[LocationDetailsPage] View count error:", err);
          });
        }

        fetchPublishedLocations().then((all) => {
          setSimilar(
            all
              .filter(
                (l) =>
                  l.id !== loc.id &&
                  (l.categoryIds.some((id) => loc.categoryIds.includes(id)) ||
                    l.address.city === loc.address.city)
              )
              .slice(0, 6)
          );
        });
      }
    });
  }, [slug]);

  const { unavailableDates } = useUnavailableDates(location?.id);
  const isMobile = useIsMobile();

  const [mapOpen, setMapOpen] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoading, setMapLoading] = useState(false);

  const handleShowMap = async () => {
    if (mapOpen) {
      setMapOpen(false);
      return;
    }

    if (location?.address.lat != null && location?.address.lng != null) {
      setMapCoords({ lat: location.address.lat, lng: location.address.lng });
      setMapOpen(true);
      return;
    }

    if (!location) return;
    const addressQuery = `${location.address.street}, ${location.address.city}`;
    setMapLoading(true);
    try {
      const results = await searchAddress(addressQuery, { limit: 1 });
      if (results.length > 0) {
        setMapCoords({ lat: results[0].lat, lng: results[0].lng });
        setMapOpen(true);
      }
    } finally {
      setMapLoading(false);
    }
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarClickCount = useRef(0);

  const isDateUnavailable = useMemo(
    () => (date: Date) => unavailableDates.some((d) => isSameDay(d, date)),
    [unavailableDates]
  );

  // When user has picked `from` but not `to` yet (react-day-picker sets to=from
  // on first click), cap selectable end date at the day before the first blocked
  // date after `from`.
  const maxEndDate = useMemo(() => {
    if (!dateRange?.from) return null;
    // Active when to is unset OR when to equals from (react-day-picker first-click state)
    const isPickingEnd = !dateRange.to || isSameDay(dateRange.from, dateRange.to);
    if (!isPickingEnd) return null;
    const from = dateRange.from;
    const next = unavailableDates
      .filter((d) => d > from)
      .sort((a, b) => a.getTime() - b.getTime())[0];
    if (!next) return null;
    const cap = new Date(next);
    cap.setDate(cap.getDate() - 1);
    return cap;
  }, [dateRange?.from, dateRange?.to, unavailableDates]);

  const disabledDays = useMemo(() => {
    const matchers: Array<Date | { before: Date } | { after: Date }> = [
      { before: new Date() },
      ...unavailableDates,
    ];
    if (maxEndDate) {
      matchers.push({ after: maxEndDate });
    }
    return matchers;
  }, [unavailableDates, maxEndDate]);

  const days = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    const diff = Math.round(
      (dateRange.to.getTime() - dateRange.from.getTime()) / 86_400_000
    );
    return diff >= 0 ? diff + 1 : 0;
  }, [dateRange]);

  const estimate = location ? location.pricing.dailyRate * days : 0;

  const hasBlockedInRange = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return false;
    return unavailableDates.some(
      (d) => d >= dateRange.from! && d <= dateRange.to!
    );
  }, [dateRange, unavailableDates]);

  if (location === undefined) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-16">
        <Loader2 className="size-10 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">{t("notFound")}</p>
        <Button asChild className="mt-4">
          <Link href="/locations">{t("backToLocations")}</Link>
        </Button>
      </div>
    );
  }

  const gallery = location.mediaGallery;

  return (
    <div className="container mx-auto px-4 pb-24 sm:px-6 lg:px-8">
      {/* Gallery — full width above the grid */}
      <LocationGallery gallery={gallery} title={location.title} />

      <div className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl tracking-tight">
              {location.title}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{location.address.street}, {location.address.city}</span>
              <button
                type="button"
                onClick={handleShowMap}
                disabled={mapLoading}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ms-1"
              >
                {mapLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : mapOpen ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  <MapIcon className="h-3.5 w-3.5" />
                )}
                {mapOpen ? t("hideMap") : t("showOnMap")}
              </button>
            </div>

            {mapOpen && mapCoords && (
              <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
                <LocationMap
                  lat={mapCoords.lat}
                  lng={mapCoords.lng}
                  title={location.title}
                />
              </div>
            )}

            <div className="my-6 h-px bg-border/60" />
            <p className="text-muted-foreground leading-relaxed">
              {location.description}
            </p>
          </section>

          {location.amenities && location.amenities.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                {t("amenities")}
              </h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {location.amenities.map((a) => (
                  <Badge
                    key={a}
                    variant="outline"
                    className="rounded-xl border-border px-3 py-1.5 text-sm font-normal text-foreground"
                  >
                    {a}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {location.rules && (
            <section>
              <h2 className="text-lg font-semibold text-foreground">{t("rules")}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                {location.rules}
              </p>
            </section>
          )}

          {similar.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                {t("similarLocations")}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {similar.map((loc) => (
                  <LocationCard key={loc.id} location={loc} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: booking card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 overflow-hidden rounded-2xl border border-border/60 shadow-float">
            <CardContent className="p-0">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-foreground">
                    ₪{location.pricing.dailyRate.toLocaleString("he-IL")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {t("day")}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border/60" />

              <div className="px-6 py-5 space-y-4">
                <Popover
                  open={calendarOpen}
                  onOpenChange={(open) => {
                    setCalendarOpen(open);
                    if (open) calendarClickCount.current = 0;
                  }}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-full rounded-xl border border-border overflow-hidden text-start transition-colors hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        calendarOpen && "border-foreground/30 ring-2 ring-ring ring-offset-2"
                      )}
                    >
                      <div className="grid grid-cols-2 divide-x divide-border rtl:divide-x-reverse">
                        <div className="px-3 py-3">
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {t("startDate")}
                          </span>
                          <span className={cn("mt-0.5 block text-sm", !dateRange?.from && "text-muted-foreground")}>
                            {dateRange?.from
                              ? format(dateRange.from, "d MMM yyyy", { locale: he })
                              : t("selectDates")}
                          </span>
                        </div>
                        <div className="px-3 py-3">
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {t("endDate")}
                          </span>
                          <span className={cn("mt-0.5 block text-sm", !dateRange?.to && "text-muted-foreground")}>
                            {dateRange?.to
                              ? format(dateRange.to, "d MMM yyyy", { locale: he })
                              : t("selectDates")}
                          </span>
                        </div>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0 overflow-x-hidden" align="center" side="bottom">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        if (range?.from && isDateUnavailable(range.from)) return;
                        if (range?.to && isDateUnavailable(range.to)) return;
                        // Reject any range that spans over a blocked date
                        if (range?.from && range?.to) {
                          const hasBlocked = unavailableDates.some(
                            (d) => d > range.from! && d < range.to!
                          );
                          if (hasBlocked) {
                            setDateRange({ from: range.from, to: undefined });
                            return;
                          }
                        }
                        setDateRange(range);
                        calendarClickCount.current += 1;
                        if (calendarClickCount.current >= 2) {
                          setCalendarOpen(false);
                          calendarClickCount.current = 0;
                        }
                      }}
                      numberOfMonths={isMobile ? 1 : 2}
                      disabled={disabledDays}
                      locale={he}
                      dir="rtl"
                    />
                    {dateRange?.from && (
                      <div className="border-t border-border p-2 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDateRange(undefined);
                            setCalendarOpen(false);
                          }}
                        >
                          {t("resetDates")}
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>

                {/* Price breakdown */}
                {days > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground underline decoration-dotted underline-offset-4">
                        ₪{location.pricing.dailyRate.toLocaleString("he-IL")} × {days} {t("days")}
                      </span>
                      <span className="text-foreground">
                        ₪{estimate.toLocaleString("he-IL")}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between font-semibold">
                      <span>{t("estimatedTotal")}</span>
                      <span>₪{estimate.toLocaleString("he-IL")}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 pb-6 space-y-2">
                <Button
                  className="w-full rounded-full"
                  size="lg"
                  disabled={days <= 0 || hasBlockedInRange}
                  asChild={days > 0 && !hasBlockedInRange}
                >
                  {days > 0 && !hasBlockedInRange ? (
                    <Link
                      href={`/locations/${encodeURIComponent(slug)}/booking?from=${format(dateRange!.from!, "yyyy-MM-dd")}&to=${format(dateRange!.to!, "yyyy-MM-dd")}`}
                    >
                      {t("requestBooking")}
                    </Link>
                  ) : (
                    t("requestBooking")
                  )}
                </Button>
                {days <= 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    {t("selectDatesToBook")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Videos — centered, limited width */}
      {location.showcaseVideos && location.showcaseVideos.length > 0 && (
        <section className="mt-12 border-t border-border pt-10 flex justify-center">
          <div className="w-full max-w-3xl mx-auto px-4 sm:px-0">
            <div className="mb-5 text-center">
              <h2 className="text-xl font-semibold text-foreground">
                {t("videosFromLocation")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("videosFromLocationSubline")}
              </p>
            </div>
            <VideoCarousel
              urls={location.showcaseVideos}
              prevLabel={t("playVideo")}
              nextLabel={t("playVideo")}
              playLabel={t("playVideo")}
            />
          </div>
        </section>
      )}

      <div className="fixed bottom-0 start-0 end-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl shadow-sticky px-4 py-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-base font-bold text-foreground">
              ₪{location.pricing.dailyRate.toLocaleString("he-IL")}
            </span>
            <span className="text-xs text-muted-foreground ms-1">/ {t("day")}</span>
            {days > 0 && (
              <span className="block text-xs text-muted-foreground truncate">
                {format(dateRange!.from!, "d MMM", { locale: he })} — {format(dateRange!.to!, "d MMM", { locale: he })}
              </span>
            )}
          </div>
          <Button
            size="lg"
            disabled={days <= 0 || hasBlockedInRange}
            asChild={days > 0 && !hasBlockedInRange}
          >
            {days > 0 && !hasBlockedInRange ? (
              <Link
                href={`/locations/${encodeURIComponent(slug)}/booking?from=${format(dateRange!.from!, "yyyy-MM-dd")}&to=${format(dateRange!.to!, "yyyy-MM-dd")}`}
              >
                {t("requestBooking")}
              </Link>
            ) : (
              t("requestBooking")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
