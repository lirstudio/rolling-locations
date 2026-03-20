/**
 * Calculate popularity score for a location based on combined metrics.
 * Weights: views=1, bookings=2, favorites=1.5
 */
export function calculateLocationPopularity(stats: {
  viewCount: number;
  bookingCount: number;
  favoriteCount: number;
}): number {
  return (
    stats.viewCount * 1 +
    stats.bookingCount * 2 +
    stats.favoriteCount * 1.5
  );
}
