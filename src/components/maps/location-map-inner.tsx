"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [31.77, 35.21];
const DEFAULT_ZOOM = 14;

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationMapInnerProps {
  lat?: number;
  lng?: number;
  title?: string;
  className?: string;
}

export function LocationMapInner({
  lat,
  lng,
  title,
  className,
}: LocationMapInnerProps) {
  const hasCoords = lat != null && lng != null;
  const center: [number, number] = hasCoords
    ? [lat, lng]
    : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={hasCoords ? DEFAULT_ZOOM : 8}
      scrollWheelZoom={false}
      className={className ?? "h-[280px] w-full rounded-xl"}
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hasCoords && (
        <Marker position={[lat, lng]} icon={markerIcon}>
          {title && <Popup>{title}</Popup>}
        </Marker>
      )}
    </MapContainer>
  );
}
