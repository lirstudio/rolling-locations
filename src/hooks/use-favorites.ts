import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFavoriteLocations,
  isFavorite as checkIsFavorite,
  toggleFavorite,
} from "@/app/actions/favorites";
import { queryKeys } from "@/lib/query-keys";
import type { Location } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

/**
 * Hook to get all favorite locations for the current user
 */
export function useFavorites(initialData?: Location[]) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: locations = [], isLoading } = useQuery({
    queryKey: queryKeys.favorites.all(),
    queryFn: getFavoriteLocations,
    initialData,
    enabled: isAuthenticated,
  });

  return { locations, isLoading };
}

/**
 * Hook to check if a specific location is favorited
 */
export function useIsFavorite(locationId: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: isFavorited = false, isLoading } = useQuery({
    queryKey: queryKeys.favorites.byLocationId(locationId),
    queryFn: () => checkIsFavorite(locationId),
    enabled: isAuthenticated && !!locationId,
  });

  return { isFavorite: isFavorited, isLoading };
}

/**
 * Hook to toggle favorite status for a location
 * Includes optimistic updates for better UX
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useMutation({
    mutationFn: async (locationId: string) => {
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }
      const result = await toggleFavorite(locationId);
      if (result.error) {
        throw new Error(result.error);
      }
      return locationId;
    },
    onMutate: async (locationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.all() });
      await queryClient.cancelQueries({
        queryKey: queryKeys.favorites.byLocationId(locationId),
      });

      // Snapshot previous values
      const previousFavorites = queryClient.getQueryData<Location[]>(
        queryKeys.favorites.all()
      );
      const previousIsFavorite = queryClient.getQueryData<boolean>(
        queryKeys.favorites.byLocationId(locationId)
      );

      // Optimistically update
      queryClient.setQueryData<boolean>(
        queryKeys.favorites.byLocationId(locationId),
        (old) => !old
      );

      return { previousFavorites, previousIsFavorite };
    },
    onError: (error, locationId, context) => {
      // Rollback on error
      if (context?.previousIsFavorite !== undefined) {
        queryClient.setQueryData(
          queryKeys.favorites.byLocationId(locationId),
          context.previousIsFavorite
        );
      }
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites.all(), context.previousFavorites);
      }
      toast.error(error.message || "Failed to update favorite");
    },
    onSuccess: (locationId) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.favorites.byLocationId(locationId),
      });
    },
  });
}
