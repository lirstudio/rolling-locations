import type { AvailabilityBlock } from "@/types";

export const mockAvailability: AvailabilityBlock[] = [
  {
    id: "avail-1",
    locationId: "loc-1",
    start: "2026-03-15T00:00:00Z",
    end: "2026-03-16T23:59:59Z",
    isBlocked: true,
    note: "תחזוקה",
    source: "manual",
  },
  {
    id: "avail-2",
    locationId: "loc-1",
    start: "2026-03-20T00:00:00Z",
    end: "2026-03-21T23:59:59Z",
    isBlocked: true,
    note: "הזמנה פרטית",
    source: "manual",
  },
  {
    id: "avail-3",
    locationId: "loc-2",
    start: "2026-03-18T00:00:00Z",
    end: "2026-03-18T23:59:59Z",
    isBlocked: true,
    source: "manual",
  },
];
