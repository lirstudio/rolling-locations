"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchAllBookingRequests,
  type DbBookingRequest,
} from "@/app/actions/bookings";

export function useHostBookingRequests() {
  const [requests, setRequests] = useState<DbBookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await fetchAllBookingRequests();
    setRequests(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { requests, loading, refresh };
}
