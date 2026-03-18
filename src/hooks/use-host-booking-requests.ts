"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllBookingRequests,
  type DbBookingRequest,
} from "@/app/actions/bookings";
import { queryKeys } from "@/lib/query-keys";

export function useHostBookingRequests() {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading: loading } = useQuery<
    DbBookingRequest[]
  >({
    queryKey: queryKeys.bookings.host(),
    queryFn: fetchAllBookingRequests,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings.host() });

  return { requests, loading, refresh };
}
