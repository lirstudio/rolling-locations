"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { Location } from "@/types";

const LocationsMapInner = dynamic(
  () =>
    import("@/components/maps/locations-map-inner").then(
      (mod) => mod.LocationsMapInner
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] w-full items-center justify-center rounded-xl bg-muted">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

interface LocationsMapViewProps {
  locations: Location[];
  className?: string;
}

export function LocationsMapView(props: LocationsMapViewProps) {
  return <LocationsMapInner {...props} />;
}
