"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { format, isSameDay } from "date-fns";
import { he } from "date-fns/locale/he";
import { MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fetchLocationBySlug, fetchPublishedLocations } from "@/app/actions/locations";
import { VideoCarousel } from "@/components/locations/video-carousel";
import { LocationCard } from "@/components/locations/location-card";
import { LocationGallery } from "@/components/locations/location-gallery";
import { useUnavailableDates } from "@/hooks/use-unavailable-dates";
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

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarClickCount = useRef(0);

  const disabledDays = useMemo(() => {
    const matchers: Array<Date | { before: Date }> = [
      { before: new Date() },
    ];
    for (const d of unavailableDates) {
      matchers.push(d);
    }
    return matchers;
  }, [unavailableDates]);

  const isDateUnavailable = useMemo(() => {
    return (date: Date) =>
      unavailableDates.some((d) => isSameDay(d, date));
  }, [unavailableDates]);

  const days = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    const diff = Math.round(
      (dateRange.to.getTime() - dateRange.from.getTime()) / 86_400_000
    );
    return diff >= 0 ? diff + 1 : 0;
  }, [dateRange]);

  const estimate = location ? location.pricing.dailyRate * days : 0;

  if (location === undefined) {
    return (
      <div className="container flex min-h-[50vh] items-center justify-center px-4 py-16">
        <Loader2 className="size-10 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="container px-4 py-16 text-center">
        <p className="text-muted-foreground">{t("notFound")}</p>
        <Button asChild className="mt-4">
          <Link href="/locations">{t("backToLocations")}</Link>
        </Button>
      </div>
    );
  }

  const gallery = location.mediaGallery;

  return (
    <div className="container px-4 pb-24 sm:px-6 lg:px-8">
      {/* Gallery — full width above the grid */}
      <LocationGallery gallery={gallery} title={location.title} />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {location.title}
            </h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              {location.address.street}, {location.address.city}
            </p>
            <Separator className="my-5" />
            <p className="text-muted-foreground leading-relaxed">
              {location.description}
            </p>
          </section>

          {location.amenities && location.amenities.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                {t("amenities")}
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {location.amenities.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
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
                  <LocationCard key={loc.id} location={loc} variant="compact" />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: booking card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 overflow-hidden border border-border shadow-sm">
            <CardContent className="p-0">
              {/* Price header */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-foreground">
                    ₪{location.pricing.dailyRate.toLocaleString("he-IL")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {t("day")}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Date picker */}
              <div className="px-5 py-4 space-y-3">
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
                  <PopoverContent className="w-auto p-0" align="center" side="bottom">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        if (range?.from && isDateUnavailable(range.from)) return;
                        if (range?.to && isDateUnavailable(range.to)) return;
                        setDateRange(range);
                        calendarClickCount.current += 1;
                        if (calendarClickCount.current >= 2) {
                          setCalendarOpen(false);
                          calendarClickCount.current = 0;
                        }
                      }}
                      numberOfMonths={2}
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

              {/* CTA */}
              <div className="px-5 pb-5 space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={days <= 0}
                  asChild={days > 0}
                >
                  {days > 0 ? (
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

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 start-0 end-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm p-4 lg:hidden">
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
            disabled={days <= 0}
            asChild={days > 0}
          >
            {days > 0 ? (
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
