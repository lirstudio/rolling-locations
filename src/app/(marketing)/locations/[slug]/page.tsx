"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { he } from "date-fns/locale/he";
import { MapPin, CheckCircle2, Loader2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fetchLocationBySlug, fetchPublishedLocations } from "@/app/actions/locations";
import { VideoCarousel } from "@/components/locations/video-carousel";
import { LocationCard } from "@/components/locations/location-card";
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

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarClickCount = useRef(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => setSelectedImageIndex(0), [slug]);

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
  const mainImageUrl = gallery[selectedImageIndex]?.url ?? gallery[0]?.url;

  return (
    <div className="container px-4 pb-24 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {mainImageUrl && (
            <section className="overflow-hidden rounded-xl border border-border bg-muted">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={mainImageUrl}
                  alt={location.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority={selectedImageIndex === 0}
                  unoptimized={mainImageUrl.includes("supabase.co") && mainImageUrl.includes("/storage/")}
                />
              </div>
              {gallery.length > 1 && (
                <div className="flex gap-2 p-2 overflow-x-auto">
                  {gallery.map((m, index) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-16 w-24 shrink-0 rounded overflow-hidden bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        index === selectedImageIndex
                          ? "ring-2 ring-primary ring-offset-2"
                          : ""
                      }`}
                    >
                      <Image
                        src={m.url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized={m.url.includes("supabase.co") && m.url.includes("/storage/")}
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          <section>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {location.title}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              {location.address.street}, {location.address.city}
            </p>
            <p className="mt-4 text-muted-foreground">{location.description}</p>
          </section>

          {location.amenities && location.amenities.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                {t("amenities")}
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {location.amenities.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {location.rules && (
            <section>
              <h2 className="text-lg font-semibold text-foreground">{t("rules")}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {location.rules}
              </p>
            </section>
          )}

          {location.showcaseVideos && location.showcaseVideos.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                {t("videosFromLocation")}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t("videosFromLocationSubline")}
              </p>
              <div className="mt-4">
                <VideoCarousel
                  urls={location.showcaseVideos}
                  prevLabel={t("playVideo")}
                  nextLabel={t("playVideo")}
                  playLabel={t("playVideo")}
                />
              </div>
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

        <div className="lg:col-span-1">
          <Card className="sticky top-24 border border-border">
            <CardHeader>
              <h2 className="text-lg font-semibold">{t("pricing")}</h2>
              <p className="text-sm text-muted-foreground">
                ₪{location.pricing.dailyRate} / {t("days").replace("ימים", "יום")}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Popover
                open={calendarOpen}
                onOpenChange={(open) => {
                  setCalendarOpen(open);
                  if (open) calendarClickCount.current = 0;
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-start font-normal h-auto min-h-10 py-2",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="me-2 h-4 w-4 shrink-0" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <span>
                          {format(dateRange.from, "EEE, d MMM", { locale: he })}
                          {" — "}
                          {format(dateRange.to, "EEE, d MMM", { locale: he })}
                        </span>
                      ) : (
                        format(dateRange.from, "EEE, d MMM", { locale: he })
                      )
                    ) : (
                      t("selectDates")
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      calendarClickCount.current += 1;
                      if (calendarClickCount.current >= 2) {
                        setCalendarOpen(false);
                        calendarClickCount.current = 0;
                      }
                    }}
                    numberOfMonths={2}
                    disabled={{ before: new Date() }}
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

              {days > 0 && (
                <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      ₪{location.pricing.dailyRate} × {days} {t("days")}
                    </span>
                    <span className="font-medium text-foreground">
                      ₪{estimate.toLocaleString("he-IL")}
                    </span>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
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
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 start-0 end-0 z-40 border-t border-border bg-background p-4 lg:hidden">
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
      </div>
    </div>
  );
}
