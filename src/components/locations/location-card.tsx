"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  MapPin,
  MoreHorizontal,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Location, LocationStatus } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { useIsFavorite, useToggleFavorite } from "@/hooks/use-favorites";
import { formatDistance } from "@/utils/geo";

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
  /** Variant: "card" (vertical, default) or "compact" (horizontal row) */
  variant?: "card" | "compact";
  /** Render as link (default true). Set false to render as div (e.g., when already inside a Link) */
  asLink?: boolean;
  /** Additional className for the root element */
  className?: string;
  /** Show favorite button (default: true for authenticated creators) */
  showFavoriteButton?: boolean;
  /** Distance from user in km (if available) */
  distanceKm?: number;
}

/**
 * Single location card used everywhere: marketing (discover, featured, related), host dashboard, and booking flows.
 * Supports two variants:
 * - "card" (default): Vertical card with image carousel, gradient overlay, bottom glass bar
 * - "compact": Horizontal row layout for lists and summaries
 */
export function LocationCard({
  location,
  href,
  showStatus = false,
  menuContent,
  variant = "card",
  asLink = true,
  className,
  showFavoriteButton = true,
  distanceKm,
}: LocationCardProps) {
  const t = useTranslations("marketing.locationCard");
  const tHost = useTranslations("host");
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isCreator = user?.role === "creator";
  const shouldShowFavorite = showFavoriteButton && isAuthenticated && isCreator;
  const { isFavorite } = useIsFavorite(location.id);
  const toggleFavorite = useToggleFavorite();
  const images = getImageItems(location.mediaGallery);
  // Find the featured image index, or default to 0
  const featuredIndex = useMemo(() => {
    const idx = images.findIndex((img) => {
      const mediaItem = location.mediaGallery.find((m) => m.url === img.url);
      return mediaItem?.isFeatured;
    });
    return idx >= 0 ? idx : 0;
  }, [images, location.mediaGallery]);
  
  const [index, setIndex] = useState(featuredIndex);
  const prevFeaturedIndexRef = useRef(featuredIndex);

  // Only reset index when the featured image itself changes (not on every user navigation)
  useEffect(() => {
    if (prevFeaturedIndexRef.current !== featuredIndex) {
      prevFeaturedIndexRef.current = featuredIndex;
      setIndex(featuredIndex);
    }
  }, [featuredIndex]);
  
  const currentUrl = images[index]?.url;
  const hasMultiple = images.length > 1;
  const linkHref = href ?? `/locations/${location.slug}`;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated && isCreator) {
      toggleFavorite.mutate(location.id);
    }
  };

  const go = (delta: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + delta + images.length) % images.length);
  };

  // Compact variant: horizontal row layout
  if (variant === "compact") {
    const coverUrl =
      location.mediaGallery.find((m) => m.isFeatured)?.url ??
      location.mediaGallery[0]?.url;

    const compactContent = (
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-16 sm:w-16">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={location.title}
              fill
              className="object-cover"
              sizes="64px"
              unoptimized={isSupabaseStorageUrl(coverUrl)}
            />
          ) : (
            <div className="size-full bg-muted" />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-medium text-foreground">
            {location.title}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{location.address.city}</span>
          </span>
        </div>
      </div>
    );

    if (asLink) {
      return (
        <Link
          href={linkHref}
          className={`group relative block overflow-hidden ${className ?? ""}`}
        >
          {compactContent}
        </Link>
      );
    }

    return (
      <div className={`group relative block overflow-hidden ${className ?? ""}`}>
        {compactContent}
      </div>
    );
  }

  // Card variant: new design - image top, content middle, button bottom
  const cardContent = (ctaAsDecorativeSpan: boolean) => (
    <div className="flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-card">
      {/* Image section - top */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt={location.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={isSupabaseStorageUrl(currentUrl)}
          />
        ) : (
          <div className="size-full bg-muted" />
        )}

        {/* Image overlay controls */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={go(-1)}
              className="absolute top-1/2 start-2.5 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md opacity-100 md:opacity-70 md:group-hover:opacity-100 transition-all hover:bg-black/80 hover:scale-110 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={t("previousImage")}
            >
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={go(1)}
              className="absolute top-1/2 end-2.5 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md opacity-100 md:opacity-70 md:group-hover:opacity-100 transition-all hover:bg-black/80 hover:scale-110 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={t("nextImage")}
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-2 start-2.5 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <ImageIcon className="h-3 w-3" />
            {index + 1} / {images.length}
          </div>
        )}

        {/* Status badge - top left */}
        {showStatus && (
          <Badge
            variant={statusVariant[location.status]}
            className="absolute top-3 start-3 z-10 text-xs font-medium px-2.5 py-1 shadow-sm"
          >
            {tHost(`locations.${location.status}` as "locations.draft")}
          </Badge>
        )}

        {/* Favorite button - top right (only for creators) */}
        {shouldShowFavorite && (
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="absolute top-3 end-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-foreground hover:bg-white transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
            aria-pressed={isFavorite}
            disabled={toggleFavorite.isPending}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isFavorite
                  ? "fill-primary text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            />
          </button>
        )}

        {/* Host menu - top right (if favorite button not shown, or below it) */}
        {menuContent != null && (
          <div
            className={`absolute z-10 ${shouldShowFavorite ? "top-14 end-3" : "top-3 end-3"}`}
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
      </div>

      {/* Content section - middle */}
      <div className="flex-1 p-4 space-y-2">
        <h3 className="text-base font-semibold text-foreground truncate leading-snug">
          {location.title}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{location.address.city}</span>
          {distanceKm != null && (
            <Badge variant="secondary" className="ms-auto shrink-0 text-[11px] px-1.5 py-0">
              {formatDistance(distanceKm)}
            </Badge>
          )}
        </div>
        <div className="text-lg font-bold text-foreground">
          ₪{location.pricing.dailyRate.toLocaleString("he-IL")}
        </div>
      </div>

      {/* CTA — overlay <Link> mode: no nested <a> inside <a> */}
      <div className="p-4 pt-0">
        {ctaAsDecorativeSpan ? (
          <span
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full pointer-events-none"
            )}
          >
            {t("viewDetails")}
          </span>
        ) : (
          <Button asChild className="w-full" variant="default">
            <Link href={linkHref} onClick={(e) => e.stopPropagation()}>
              {t("viewDetails")}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <div className={cn("group relative block h-full", className)}>
        <Link
          href={linkHref}
          className="absolute inset-0 z-[1] rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`${location.title}, ${location.address.city}`}
        >
          <span className="sr-only">{t("viewDetails")}</span>
        </Link>
        <div className="relative z-[2] pointer-events-none [&_button]:pointer-events-auto">
          {cardContent(true)}
        </div>
      </div>
    );
  }

  return (
    <div className={`group ${className ?? ""}`} role="group">
      {cardContent(false)}
    </div>
  );
}