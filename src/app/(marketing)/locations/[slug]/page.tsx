"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LocationCard } from "@/components/marketing/location-card";
import {
  LocationShowcaseVideos,
  type ShowcaseVideoItem,
} from "@/components/marketing/location-showcase-videos";
import { getLocationBySlug, getSimilarLocations } from "@/data/mock-locations";

const PLACEHOLDER_IMAGES: Record<string, string> = {
  studio: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&q=80",
  office: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  loft: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
  outdoor: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80",
};

export default function LocationDetailsPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const t = useTranslations("marketing.locationDetails");
  const tLoc = useTranslations("locations");

  const location = useMemo(() => getLocationBySlug(slug), [slug]);
  const similar = useMemo(
    () => (location ? getSimilarLocations(location, 6) : []),
    [location]
  );

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [galleryOpen, setGalleryOpen] = useState(false);

  const hours = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    return eh - sh + (em - sm) / 60;
  }, [startTime, endTime]);

  const estimate = location ? Math.round(location.priceHourly * hours) : 0;

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

  const imgSrc = PLACEHOLDER_IMAGES[location.imagePlaceholder] ?? PLACEHOLDER_IMAGES.studio;
  const title = tLoc(location.titleKey);
  const city = tLoc(location.cityKey);
  const category = tLoc(`categories.${location.categorySlug}`);

  return (
    <div className="container px-4 pb-24 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="overflow-hidden rounded-xl border border-border bg-muted">
            <button
              type="button"
              className="relative block w-full aspect-[16/10] cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-xl overflow-hidden"
              onClick={() => setGalleryOpen(true)}
            >
              <Image
                src={imgSrc}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            </button>
            <div className="flex gap-2 p-2 overflow-x-auto">
              {[1, 2, 3].map((i) => (
                <button
                  key={i}
                  type="button"
                  className="relative h-16 w-24 shrink-0 rounded overflow-hidden bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setGalleryOpen(true)}
                >
                  <Image src={imgSrc} alt="" fill className="object-cover" sizes="96px" />
                </button>
              ))}
            </div>
          </section>
          <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{t("galleryPlaceholder")}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{t("galleryPlaceholder")}</p>
            </DialogContent>
          </Dialog>

          <section>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              {city}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-md bg-muted px-2 py-1 text-sm">{category}</span>
            </div>
            <p className="mt-4 text-muted-foreground">{tLoc(location.descriptionKey)}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("amenities")}</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {location.amenitiesKeys.map((key) => (
                <li key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  {tLoc(key)}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">{t("rules")}</h2>
            <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {location.rulesKeys.map((key) => (
                <li key={key}>{tLoc(key)}</li>
              ))}
            </ul>
          </section>

          {location.showcaseVideos?.length ? (
            <LocationShowcaseVideos
              videos={location.showcaseVideos.map(
                (v): ShowcaseVideoItem => ({
                  id: v.id,
                  url: v.url,
                  thumbnailUrl: v.thumbnailUrl,
                  caption: v.captionKey ? tLoc(v.captionKey) : undefined,
                })
              )}
            />
          ) : null}

          {similar.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground">{t("similarLocations")}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {similar.map((loc) => (
                  <LocationCard key={loc.id} location={loc} />
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
                {t("perHour", { price: location.priceHourly })}
                {location.priceDaily != null && (
                  <span className="ms-2"> / {t("perDay", { price: location.priceDaily })}</span>
                )}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("date")}</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>{t("startTime")}</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("endTime")}</Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              {hours > 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("estimate")}: <span className="font-medium text-foreground">₪{estimate}</span>
                </p>
              )}
              <Button className="w-full" asChild>
                <Link href="/auth/sign-in">{t("requestBooking")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6 border border-border">
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold text-foreground">{t("host")}</h3>
              <div className="mt-3 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                    {tLoc(location.hostNameKey).slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium text-foreground">{tLoc(location.hostNameKey)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 start-0 end-0 z-40 border-t border-border bg-background p-4 lg:hidden">
        <Button className="w-full" size="lg" asChild>
          <Link href="/auth/sign-in">{t("requestBooking")}</Link>
        </Button>
      </div>
    </div>
  );
}
