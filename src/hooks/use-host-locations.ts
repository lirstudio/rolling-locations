"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchAllLocations,
  saveLocation,
  deleteLocationAction,
} from "@/app/actions/locations";
import { hasGoogleCalendarConnection } from "@/app/actions/google-calendar";
import { queryKeys } from "@/lib/query-keys";
import type { Location, LocationStatus } from "@/types";

export function useHostLocations(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: allLocations = [], isLoading } = useQuery({
    queryKey: queryKeys.locations.byHost(userId ?? ""),
    queryFn: fetchAllLocations,
    enabled: !!userId,
  });

  const locations = userId
    ? allLocations.filter((l) => l.hostId === userId)
    : allLocations;

  const addMutation = useMutation({
    mutationFn: async (location: Location) => {
      const { error } = await saveLocation(location);
      if (error) throw new Error(error);
    },
    onMutate: async (location) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.locations.byHost(userId ?? ""),
      });
      const previous = queryClient.getQueryData<Location[]>(
        queryKeys.locations.byHost(userId ?? "")
      );
      queryClient.setQueryData<Location[]>(
        queryKeys.locations.byHost(userId ?? ""),
        (old = []) => [...old, location]
      );
      return { previous };
    },
    onError: (_err, _location, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.locations.byHost(userId ?? ""),
          context.previous
        );
      }
      toast.error("שגיאה בשמירת הלוקיישן — נסו שוב");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations.byHost(userId ?? ""),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Location>;
    }) => {
      const current = queryClient
        .getQueryData<Location[]>(queryKeys.locations.byHost(userId ?? ""))
        ?.find((l) => l.id === id);
      if (!current) throw new Error("Location not found");
      const updated = { ...current, ...updates };
      const { error } = await saveLocation(updated);
      if (error) throw new Error(error);
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.locations.byHost(userId ?? ""),
      });
      const previous = queryClient.getQueryData<Location[]>(
        queryKeys.locations.byHost(userId ?? "")
      );
      queryClient.setQueryData<Location[]>(
        queryKeys.locations.byHost(userId ?? ""),
        (old = []) =>
          old.map((l) => (l.id === id ? { ...l, ...updates } : l))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.locations.byHost(userId ?? ""),
          context.previous
        );
      }
      toast.error("שגיאה בעדכון הלוקיישן — נסו שוב");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations.byHost(userId ?? ""),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await deleteLocationAction(id);
      if (error) throw new Error(error);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.locations.byHost(userId ?? ""),
      });
      const previous = queryClient.getQueryData<Location[]>(
        queryKeys.locations.byHost(userId ?? "")
      );
      queryClient.setQueryData<Location[]>(
        queryKeys.locations.byHost(userId ?? ""),
        (old = []) => old.filter((l) => l.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.locations.byHost(userId ?? ""),
          context.previous
        );
      }
      toast.error("שגיאה במחיקת הלוקיישן — נסו שוב");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations.byHost(userId ?? ""),
      });
    },
  });

  const setStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: LocationStatus;
    }) => {
      if (status === "published") {
        const loc = queryClient
          .getQueryData<Location[]>(queryKeys.locations.byHost(userId ?? ""))
          ?.find((l) => l.id === id);
        if (loc) {
          const connected = await hasGoogleCalendarConnection(loc.hostId);
          if (!connected) {
            throw new Error(
              "יש לחבר יומן גוגל לפני פרסום. עברו לניהול זמינות."
            );
          }
        }
      }
      const current = queryClient
        .getQueryData<Location[]>(queryKeys.locations.byHost(userId ?? ""))
        ?.find((l) => l.id === id);
      if (!current) throw new Error("Location not found");
      const { error } = await saveLocation({ ...current, status });
      if (error) throw new Error(error);
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.locations.byHost(userId ?? ""),
      });
      const previous = queryClient.getQueryData<Location[]>(
        queryKeys.locations.byHost(userId ?? "")
      );
      queryClient.setQueryData<Location[]>(
        queryKeys.locations.byHost(userId ?? ""),
        (old = []) =>
          old.map((l) => (l.id === id ? { ...l, status } : l))
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.locations.byHost(userId ?? ""),
          context.previous
        );
      }
      toast.error(
        err instanceof Error ? err.message : "שגיאה בעדכון סטטוס — נסו שוב"
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations.byHost(userId ?? ""),
      });
    },
  });

  return {
    locations,
    isLoading,
    addLocation: addMutation.mutateAsync,
    updateLocation: (id: string, updates: Partial<Location>) =>
      updateMutation.mutateAsync({ id, updates }),
    deleteLocation: deleteMutation.mutate,
    setLocationStatus: (id: string, status: LocationStatus) =>
      setStatusMutation.mutate({ id, status }),
  };
}
