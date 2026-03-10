"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { AvailabilityBlock, OperatingHoursEntry } from "@/types";

// ── DB row shapes ────────────────────────────────────────────────────────────

type OperatingHoursRow = {
  id: string;
  location_id: string;
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
};

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

// ── Mappers ──────────────────────────────────────────────────────────────────

function hoursRowToEntry(row: OperatingHoursRow): OperatingHoursEntry {
  return {
    id: row.id,
    locationId: row.location_id,
    dayOfWeek: row.day_of_week,
    isOpen: row.is_open,
    openTime: row.open_time ?? undefined,
    closeTime: row.close_time ?? undefined,
  };
}

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

// ── Operating Hours ──────────────────────────────────────────────────────────

export async function fetchOperatingHours(
  locationId: string
): Promise<OperatingHoursEntry[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("location_operating_hours")
    .select("*")
    .eq("location_id", locationId)
    .order("day_of_week");

  if (error || !data) return [];
  return (data as OperatingHoursRow[]).map(hoursRowToEntry);
}

export async function saveOperatingHours(
  locationId: string,
  entries: OperatingHoursEntry[]
): Promise<{ error?: string }> {
  const db = createAdminClient();

  const { error: deleteError } = await db
    .from("location_operating_hours")
    .delete()
    .eq("location_id", locationId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (entries.length === 0) return {};

  const rows = entries.map((e) => ({
    location_id: locationId,
    day_of_week: e.dayOfWeek,
    is_open: e.isOpen,
    open_time: e.isOpen ? (e.openTime ?? null) : null,
    close_time: e.isOpen ? (e.closeTime ?? null) : null,
  }));

  const { error: insertError } = await db
    .from("location_operating_hours")
    .insert(rows);

  if (insertError) {
    return { error: insertError.message };
  }

  return {};
}

// ── Availability Blocks ──────────────────────────────────────────────────────

export async function fetchAvailabilityBlocks(
  locationId: string
): Promise<AvailabilityBlock[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("availability_blocks")
    .select("*")
    .eq("location_id", locationId)
    .order("start_at");

  if (error || !data) return [];
  return (data as AvailabilityBlockRow[]).map(blockRowToBlock);
}

export async function addAvailabilityBlock(
  block: Omit<AvailabilityBlock, "id" | "createdAt">
): Promise<{ error?: string }> {
  const db = createAdminClient();
  const { error } = await db.from("availability_blocks").insert({
    location_id: block.locationId,
    start_at: block.start,
    end_at: block.end,
    is_blocked: block.isBlocked,
    note: block.note ?? null,
    source: block.source,
    external_event_id: block.externalEventId ?? null,
  });

  if (error) return { error: error.message };
  return {};
}

export async function removeAvailabilityBlock(
  blockId: string
): Promise<{ error?: string }> {
  const db = createAdminClient();
  const { error } = await db
    .from("availability_blocks")
    .delete()
    .eq("id", blockId);

  if (error) return { error: error.message };
  return {};
}
