"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { AvailabilityBlock } from "@/types";

// ── DB row shape ────────────────────────────────────────────────────────────

type AvailabilityBlockRow = {
  id: string;
  location_id: string;
  start_at: string;
  end_at: string;
  is_blocked: boolean;
  note: string | null;
  source: string;
  external_event_id: string | null;
  created_at: string;
};

// ── Mapper ──────────────────────────────────────────────────────────────────

function blockRowToBlock(row: AvailabilityBlockRow): AvailabilityBlock {
  return {
    id: row.id,
    locationId: row.location_id,
    start: row.start_at,
    end: row.end_at,
    isBlocked: row.is_blocked,
    note: row.note ?? undefined,
    source: row.source as AvailabilityBlock["source"],
    externalEventId: row.external_event_id ?? undefined,
    createdAt: row.created_at,
  };
}

// ── Availability Blocks (Google Calendar sourced) ───────────────────────────

export async function fetchAvailabilityBlocks(
  locationId: string
): Promise<AvailabilityBlock[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("availability_blocks")
    .select("*")
    .eq("location_id", locationId)
    .eq("source", "google_calendar")
    .order("start_at");

  if (error || !data) return [];
  return (data as AvailabilityBlockRow[]).map(blockRowToBlock);
}
