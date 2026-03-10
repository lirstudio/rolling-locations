"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { MapPin, CheckCircle2, ArrowUpRight, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mockCategories } from "@/mocks/categories";
import type { Location } from "@/types";

function isSupabaseStorageUrl(url: string): boolean {
  return url.includes("supabase.co") && url.includes("/storage/");
}

const MAX_AMENITIES_SHOWN = 3;

function getImageItems(mediaGallery: { type: string; url: string }[]) {
  return mediaGallery.filter((m) => m.type === "image");
}

interface LocationCardProps {
  location: Location;
  variant?: "compact" | "detailed";
}

export function LocationCard({ location, variant = "detailed" }: LocationCardProps) {
  if (variant === "compact") {
    return <CompactCard location={location} />;
  }

  return <DetailedCard location={location} />;
}

/* ─── Compact (carousel / homepage) ────────────────────────────────────────── */

function CompactCard({ location }: { location: Location }) {
  const t = useTranslations("marketing.locationCard");
  const images = getImageItems(location.mediaGallery);
  const [index, setIndex] = useState(0);
  const currentUrl = images[index]?.url;
  const hasMultiple = images.length > 1;

  const go = (delta: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + delta + images.length) % images.length);
  };

  return (
    <Link
      href={`/locations/${location.slug}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-xl"
    >
      {currentUrl ? (
        <Image
          src={currentUrl}
          alt={location.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 80vw, (max-width: 1200px) 50vw, 25vw"
          unoptimized={isSupabaseStorageUrl(currentUrl)}
        />
      ) : (
        <div className="size-full bg-muted" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={go(-1)}
            className="absolute top-1/2 start-2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={t("previousImage")}
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={go(1)}
            className="absolute top-1/2 end-2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={t("nextImage")}
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
        </>
      )}

      <Badge className="absolute top-3 end-3 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 shadow-sm">
        {t("fromPerDay", { price: location.pricing.dailyRate })}
      </Badge>

      <Badge className="absolute top-3 start-3 bg-white/90 text-foreground text-xs font-medium px-2.5 py-1 shadow-sm backdrop-blur-sm">
        {t("available")}
      </Badge>

      {images.length > 1 && (
        <div className="absolute bottom-14 start-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          <ImageIcon className="h-3 w-3" />
          {index + 1} / {images.length}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="rounded-xl bg-white/20 backdrop-blur-md border border-white/30 p-3.5 shadow-lg">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-white truncate leading-snug">
                {location.title}
              </h3>
              <p className="flex items-center gap-1 text-[12px] text-white/80 mt-0.5">
                <MapPin className="h-3 w-3 shrink-0" />
                {location.address.city}
              </p>
            </div>
            <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm text-white transition-colors group-hover:bg-white group-hover:text-foreground">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Detailed (listing page) ──────────────────────────────────────────────── */

function DetailedCard({ location }: { location: Location }) {
  const t = useTranslations("marketing.locationCard");
  const images = getImageItems(location.mediaGallery);
  const [index, setIndex] = useState(0);
  const currentUrl = images[index]?.url;
  const hasMultiple = images.length > 1;

  const go = (delta: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + delta + images.length) % images.length);
  };

  const categories = mockCategories.filter((c) =>
    location.categoryIds.includes(c.id)
  );

  const amenities = location.amenities ?? [];
  const shownAmenities = amenities.slice(0, MAX_AMENITIES_SHOWN);
  const extraAmenities = amenities.length - MAX_AMENITIES_SHOWN;

  const descriptionPreview =
    location.description.length > 100
      ? location.description.slice(0, 100) + "…"
      : location.description;

  return (
    <Link
      href={`/locations/${location.slug}`}
      className="group flex flex-col sm:flex-row overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
    >
      {/* Image side — carousel */}
      <div className="relative w-full sm:w-72 lg:w-80 shrink-0 aspect-[4/3] sm:aspect-auto sm:min-h-[220px]">
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt={location.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 320px"
            unoptimized={isSupabaseStorageUrl(currentUrl)}
          />
        ) : (
          <div className="size-full bg-muted" />
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={go(-1)}
              className="absolute top-1/2 start-2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={t("previousImage")}
            >
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={go(1)}
              className="absolute top-1/2 end-2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={t("nextImage")}
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-2 start-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            <ImageIcon className="h-3 w-3" />
            {index + 1} / {images.length}
          </div>
        )}

        <Badge className="absolute top-2 start-2 bg-white/90 text-foreground text-[11px] font-medium px-2 py-0.5 shadow-sm backdrop-blur-sm">
          {t("available")}
        </Badge>
      </div>

      {/* Content side */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Header: title + price */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
              {location.title}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {location.address.street}, {location.address.city}
            </p>
          </div>
          <div className="shrink-0 text-end">
            <p className="text-lg font-bold text-primary leading-tight">
              ₪{location.pricing.dailyRate.toLocaleString("he-IL")}
            </p>
            <p className="text-xs text-muted-foreground">{t("perDay")}</p>
          </div>
        </div>

        {/* Description */}
        <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {descriptionPreview}
        </p>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <Badge
                key={c.id}
                variant="secondary"
                className="text-[11px] font-normal px-2 py-0.5"
              >
                {c.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            {shownAmenities.map((a) => (
              <span
                key={a}
                className="flex items-center gap-1 text-xs text-muted-foreground"
              >
                <CheckCircle2 className="h-3 w-3 shrink-0 text-primary/70" />
                {a}
              </span>
            ))}
            {extraAmenities > 0 && (
              <span className="text-xs text-muted-foreground">
                +{extraAmenities} {t("more")}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-xs font-medium text-primary group-hover:underline inline-flex items-center gap-1">
            {t("viewDetails")}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
