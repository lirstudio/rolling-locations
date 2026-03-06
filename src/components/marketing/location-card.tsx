"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { MapPin, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MockLocation } from "@/data/mock-locations";

const PLACEHOLDER_IMAGES: Record<string, string> = {
  studio: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&q=80",
  office: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  loft: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
  outdoor: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80",
};

interface LocationCardProps {
  location: MockLocation;
  showPriceHourly?: boolean;
}

export function LocationCard({ location, showPriceHourly = true }: LocationCardProps) {
  const tLoc = useTranslations("locations");
  const tFeatured = useTranslations("marketing.featuredLocations");

  const imgSrc = PLACEHOLDER_IMAGES[location.imagePlaceholder] ?? PLACEHOLDER_IMAGES.studio;
  const city = tLoc(location.cityKey);
  const category = tLoc(`categories.${location.categorySlug}`);
  const title = tLoc(location.titleKey);

  const priceText = showPriceHourly
    ? tFeatured("fromPerHour", { price: location.priceHourly })
    : location.priceDaily
      ? tFeatured("fromPerDay", { price: location.priceDaily })
      : tFeatured("fromPerHour", { price: location.priceHourly });

  return (
    <Link
      href={`/locations/${location.slug}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-xl"
    >
      <Image
        src={imgSrc}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      {/* Price badge – top end */}
      <Badge className="absolute top-3 end-3 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 shadow-sm">
        {priceText}
      </Badge>

      {/* Available badge – top start */}
      {location.available !== false && (
        <Badge className="absolute top-3 start-3 bg-white/90 text-foreground text-xs font-medium px-2.5 py-1 shadow-sm backdrop-blur-sm">
          {tFeatured("available")}
        </Badge>
      )}

      {/* Bottom glass overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="rounded-xl bg-white/20 backdrop-blur-md border border-white/30 p-3.5 shadow-lg">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-full bg-white/30 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-medium text-white mb-1.5">
                {category} · {city}
              </span>
              <h3 className="text-sm font-semibold text-white truncate leading-snug">
                {title}
              </h3>
              <p className="flex items-center gap-1 text-[12px] text-white/80 mt-0.5">
                <MapPin className="h-3 w-3 shrink-0" />
                {city}
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
