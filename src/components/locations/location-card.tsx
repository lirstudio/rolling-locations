"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  MapPin,
  MoreHorizontal,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Location, LocationStatus } from "@/types";

function isSupabaseStorageUrl(url: string): boolean {
  return url.includes("supabase.co") && url.includes("/storage/");
}

function getImageItems(mediaGallery: { type: string; url: string }[]) {
  return mediaGallery.filter((m) => m.type === "image");
}

const statusVariant: Record<
  LocationStatus,
  "default" | "secondary" | "outline"
> = {
  published: "default",
  draft: "secondary",
  paused: "outline",
};

export interface LocationCardProps {
  location: Location;
  /** Default: /locations/[slug]. Host can pass /host/locations/[id]/view */
  href?: string;
  /** Show status badge (e.g. Published/Draft) — for host dashboard */
  showStatus?: boolean;
  /** Dropdown menu content — for host dashboard (view, edit, delete, etc.) */
  menuContent?: React.ReactNode;
}

/**
 * Single location card used everywhere: marketing (discover, featured, related) and host dashboard.
 * Vertical card: image, bottom dark bar (title, city, price), optional status badge and menu.
 */
export function LocationCard({
  location,
  href,
  showStatus = false,
  menuContent,
}: LocationCardProps) {
  const t = useTranslations("marketing.locationCard");
  const tHost = useTranslations("host");
  const images = getImageItems(location.mediaGallery);
  const [index, setIndex] = useState(0);
  const currentUrl = images[index]?.url;
  const hasMultiple = images.length > 1;
  const linkHref = href ?? `/locations/${location.slug}`;

  const go = (delta: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + delta + images.length) % images.length);
  };

  const cardContent = (
    <>
      {currentUrl ? (
        <Image
          src={currentUrl}
          alt={location.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 80vw, (max-width: 1200px) 50vw, 33vw"
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
            className="absolute top-1/2 start-2.5 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-black/65 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={t("previousImage")}
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={go(1)}
            className="absolute top-1/2 end-2.5 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-black/65 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={t("nextImage")}
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-16 start-2.5 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
          <ImageIcon className="h-3 w-3" />
          {index + 1} / {images.length}
        </div>
      )}

      {showStatus && (
        <Badge
          variant={statusVariant[location.status]}
          className="absolute top-3 start-3 z-10 text-xs font-medium px-2.5 py-1 shadow-sm"
        >
          {tHost(`locations.${location.status}` as "locations.draft")}
        </Badge>
      )}

      {menuContent != null && (
        <div
          className="absolute top-3 end-3 z-10"
          onClick={(e) => e.preventDefault()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="size-8 rounded-full bg-white/80 backdrop-blur-sm text-foreground hover:bg-white"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {menuContent}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <div className="rounded-xl bg-black/55 backdrop-blur-xl border border-white/10 px-4 py-3.5">
          <h3 className="text-sm font-semibold text-white truncate leading-snug">
            {location.title}
          </h3>
          <p className="flex items-center justify-end gap-2 text-[12px] text-white/75 mt-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span>{location.address.city}</span>
            <span className="font-semibold text-white">
              ₪{location.pricing.dailyRate.toLocaleString("he-IL")}
            </span>
          </p>
        </div>
      </div>
    </>
  );

  return (
    <Link
      href={linkHref}
      className="card-hover group relative block aspect-[3/4] overflow-hidden rounded-2xl shadow-card"
    >
      {cardContent}
    </Link>
  );
}
