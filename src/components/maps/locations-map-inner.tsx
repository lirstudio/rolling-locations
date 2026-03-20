"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Location } from "@/types";

const ISRAEL_CENTER: [number, number] = [31.77, 34.8];
const DEFAULT_ZOOM = 8;

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function isSupabaseStorageUrl(url: string): boolean {
  return url.includes("supabase.co") && url.includes("/storage/");
}

function FitBounds({ locations }: { locations: Location[] }) {
  const map = useMap();

  useMemo(() => {
    const pts = locations
      .filter((l) => l.address.lat != null && l.address.lng != null)
      .map((l) => [l.address.lat!, l.address.lng!] as [number, number]);

    if (pts.length === 0) return;
    if (pts.length === 1) {
      map.setView(pts[0], 14);
      return;
    }
    const bounds = L.latLngBounds(pts);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [locations, map]);

  return null;
}

interface LocationsMapInnerProps {
  locations: Location[];
  className?: string;
}

export function LocationsMapInner({
  locations,
  className,
}: LocationsMapInnerProps) {
  const geoLocations = locations.filter(
    (l) => l.address.lat != null && l.address.lng != null
  );

  return (
    <MapContainer
      center={ISRAEL_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className={className ?? "h-[500px] w-full rounded-xl"}
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds locations={geoLocations} />
      {geoLocations.map((loc) => {
        const coverUrl =
          loc.mediaGallery.find((m) => m.isFeatured)?.url ??
          loc.mediaGallery[0]?.url;

        return (
          <Marker
            key={loc.id}
            position={[loc.address.lat!, loc.address.lng!]}
            icon={markerIcon}
          >
            <Popup minWidth={220} maxWidth={260}>
              <div className="flex flex-col gap-2" dir="rtl">
                {coverUrl && (
                  <div className="relative h-28 w-full overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={coverUrl}
                      alt={loc.title}
                      fill
                      className="object-cover"
                      sizes="260px"
                      unoptimized={isSupabaseStorageUrl(coverUrl)}
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm text-foreground truncate">
                    {loc.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {loc.address.street}, {loc.address.city}
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    ₪{loc.pricing.dailyRate.toLocaleString("he-IL")}
                    <span className="text-xs font-normal text-muted-foreground">
                      {" "}
                      / יום
                    </span>
                  </p>
                </div>
                <Link
                  href={`/locations/${loc.slug}`}
                  className="block w-full rounded-lg bg-primary px-3 py-1.5 text-center text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  לפרטים
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
