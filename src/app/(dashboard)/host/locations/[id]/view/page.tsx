"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { VideoCarousel } from "@/components/locations/video-carousel";
import { useHostStore } from "@/stores/host-store";

const HOST_ID = "user-host-1";

function isSupabaseStorageUrl(url: string): boolean {
  return url.includes("supabase.co") && url.includes("/storage/");
}

export default function HostLocationViewPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const t = useTranslations("host");
  const tDetail = useTranslations("marketing.locationDetails");
  const location = useHostStore((s) => s.locations.find((l) => l.id === id));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => setSelectedImageIndex(0), [id]);

  const isOwnLocation = location?.hostId === HOST_ID;

  if (!location || !isOwnLocation) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-muted-foreground">{t("locations.noLocations")}</p>
        <Button asChild className="mt-4">
          <Link href="/host/locations">
            <ArrowRight className="me-2 size-4 rtl:rotate-180" />
            {t("locations.title")}
          </Link>
        </Button>
      </div>
    );
  }

  const gallery = location.mediaGallery;
  const mainImageUrl =
    gallery[selectedImageIndex]?.url ??
    gallery.find((m) => m.isFeatured)?.url ??
    gallery[0]?.url;

  return (
    <div className="container mx-auto max-w-4xl px-4 pb-12 sm:px-6">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/host/locations" className="hover:text-foreground">
          {t("locations.title")}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{location.title}</span>
      </div>

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
                  unoptimized={isSupabaseStorageUrl(mainImageUrl)}
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
                        unoptimized={isSupabaseStorageUrl(m.url)}
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
                {tDetail("amenities")}
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
              <h2 className="text-lg font-semibold text-foreground">
                {tDetail("rules")}
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {location.rules}
              </p>
            </section>
          )}

          {location.showcaseVideos && location.showcaseVideos.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                {tDetail("videosFromLocation")}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {tDetail("videosFromLocationSubline")}
              </p>
              <div className="mt-4">
                <VideoCarousel
                  urls={location.showcaseVideos}
                  prevLabel={tDetail("playVideo")}
                  nextLabel={tDetail("playVideo")}
                  playLabel={tDetail("playVideo")}
                />
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card className="sticky top-24 border border-border">
            <CardHeader>
              <h2 className="text-lg font-semibold">
                ₪{location.pricing.dailyRate} {t("locations.daily")}
              </h2>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild variant="default">
                <Link href={`/host/locations/${location.id}/edit`}>
                  {t("locations.edit")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/host/locations/${location.id}/availability`}>
                  {t("locations.manageAvailability")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
