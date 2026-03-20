"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const LocationMapInner = dynamic(
  () =>
    import("@/components/maps/location-map-inner").then(
      (mod) => mod.LocationMapInner
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] w-full items-center justify-center rounded-xl bg-muted">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

interface LocationMapProps {
  lat?: number;
  lng?: number;
  title?: string;
  className?: string;
}

export function LocationMap(props: LocationMapProps) {
  return <LocationMapInner {...props} />;
}
