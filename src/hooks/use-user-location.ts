"use client";

import { useState, useCallback } from "react";

export interface UserCoords {
  lat: number;
  lng: number;
}

interface UseUserLocationReturn {
  coords: UserCoords | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
}

export function useUserLocation(): UseUserLocationReturn {
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("GEOLOCATION_UNSUPPORTED");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.code === err.PERMISSION_DENIED ? "PERMISSION_DENIED" : "POSITION_ERROR");
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
    );
  }, []);

  return { coords, loading, error, requestLocation };
}
