"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { encrypt, decrypt } from "@/lib/encryption";
import {
  getGoogleOAuthClient,
  getCalendarClient,
} from "@/lib/google-calendar";
import type { GoogleCalendarConnection } from "@/types";

// ── DB row shape ─────────────────────────────────────────────────────────────

type ConnectionRow = {
  id: string;
  host_id: string;
  google_account_email: string;
  calendar_id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  token_expires_at: string | null;
  last_sync_at: string | null;
  sync_enabled: boolean;
  sync_token: string | null;
  created_at: string;
};

function rowToConnection(row: ConnectionRow): GoogleCalendarConnection {
  return {
    id: row.id,
    hostId: row.host_id,
    googleAccountEmail: row.google_account_email,
    calendarId: row.calendar_id,
    lastSyncAt: row.last_sync_at ?? undefined,
    syncEnabled: row.sync_enabled,
    syncToken: row.sync_token ?? undefined,
  };
}

// ── Token refresh helper ────────────────────────────────────────────────────

async function getValidAccessToken(
  row: ConnectionRow
): Promise<{ accessToken: string; error?: string }> {
  let accessToken = decrypt(row.access_token_encrypted);
  const refreshToken = decrypt(row.refresh_token_encrypted);

  const expiresAt = row.token_expires_at
    ? new Date(row.token_expires_at)
    : null;

  if (!expiresAt || expiresAt < new Date()) {
    const oauth2 = getGoogleOAuthClient();
    oauth2.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2.refreshAccessToken();
    if (!credentials.access_token) {
      return { accessToken: "", error: "Failed to refresh Google token" };
    }
    accessToken = credentials.access_token;

    const db = createAdminClient();
    await db
      .from("google_calendar_connections")
      .update({
        access_token_encrypted: encrypt(accessToken),
        token_expires_at: credentials.expiry_date
          ? new Date(credentials.expiry_date).toISOString()
          : null,
      })
      .eq("id", row.id);
  }

  return { accessToken };
}

// ── Helper: get all location IDs for a host ─────────────────────────────────

async function getHostLocationIds(hostId: string): Promise<string[]> {
  const db = createAdminClient();
  const { data } = await db
    .from("locations")
    .select("id")
    .eq("host_id", hostId);
  return (data ?? []).map((r: { id: string }) => r.id);
}

// ── Helper: load connection row by host_id ──────────────────────────────────

async function loadConnectionRow(
  hostId: string
): Promise<ConnectionRow | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("google_calendar_connections")
    .select("*")
    .eq("host_id", hostId)
    .maybeSingle();
  if (error || !data) return null;
  return data as ConnectionRow;
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function fetchGoogleConnectionByHost(
  hostId: string
): Promise<GoogleCalendarConnection | null> {
  try {
    const row = await loadConnectionRow(hostId);
    if (!row) return null;
    return rowToConnection(row);
  } catch (err) {
    console.error("[fetchGoogleConnectionByHost] error:", err);
    return null;
  }
}

export async function disconnectGoogleCalendar(
  hostId: string
): Promise<{ error?: string }> {
  const db = createAdminClient();

  const locationIds = await getHostLocationIds(hostId);
  if (locationIds.length > 0) {
    const { error: blocksError } = await db
      .from("availability_blocks")
      .delete()
      .in("location_id", locationIds)
      .eq("source", "google_calendar");
    if (blocksError) return { error: blocksError.message };
  }

  const { error } = await db
    .from("google_calendar_connections")
    .delete()
    .eq("host_id", hostId);

  if (error) return { error: error.message };
  return {};
}

// ── OAuth token exchange + save ──────────────────────────────────────────────

export async function saveGoogleConnection(params: {
  hostId: string;
  code: string;
  redirectUri: string;
}): Promise<{ error?: string }> {
  const oauth2 = getGoogleOAuthClient(params.redirectUri);

  const { tokens } = await oauth2.getToken(params.code);
  if (!tokens.access_token || !tokens.refresh_token) {
    return { error: "Google did not return required tokens" };
  }

  oauth2.setCredentials(tokens);
  const oauth2Api = (await import("googleapis")).google.oauth2({
    version: "v2",
    auth: oauth2,
  });
  const { data: userInfo } = await oauth2Api.userinfo.get();
  const email = userInfo.email ?? "unknown";

  const db = createAdminClient();
  const { error } = await db.from("google_calendar_connections").upsert(
    {
      host_id: params.hostId,
      google_account_email: email,
      calendar_id: "primary",
      access_token_encrypted: encrypt(tokens.access_token),
      refresh_token_encrypted: encrypt(tokens.refresh_token),
      token_expires_at: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : null,
      sync_enabled: true,
      sync_token: null,
    },
    { onConflict: "host_id" }
  );

  if (error) return { error: error.message };
  return {};
}

// ── Sync events → blocks for ALL host locations ─────────────────────────────

export async function syncGoogleCalendarForHost(
  hostId: string
): Promise<{ error?: string; synced?: number }> {
  const db = createAdminClient();

  const row = await loadConnectionRow(hostId);
  if (!row) {
    return { error: "No Google Calendar connection found" };
  }

  const { accessToken, error: tokenError } = await getValidAccessToken(row);
  if (tokenError) return { error: tokenError };

  const calendar = getCalendarClient(accessToken);
  const calendarId = row.calendar_id || "primary";

  const locationIds = await getHostLocationIds(hostId);

  type CalendarEvent = {
    id?: string | null;
    status?: string | null;
    transparency?: string | null;
    summary?: string | null;
    start?: { dateTime?: string | null; date?: string | null } | null;
    end?: { dateTime?: string | null; date?: string | null } | null;
  };

  let allEvents: CalendarEvent[] = [];
  let nextSyncToken: string | undefined;

  try {
    if (row.sync_token) {
      let pageToken: string | undefined;
      do {
        const { data: eventsData } = await calendar.events.list({
          calendarId,
          syncToken: row.sync_token,
          pageToken,
          singleEvents: true,
          maxResults: 500,
        });
        allEvents.push(...(eventsData?.items ?? []));
        pageToken = eventsData?.nextPageToken ?? undefined;
        if (!pageToken) {
          nextSyncToken = eventsData?.nextSyncToken ?? undefined;
        }
      } while (pageToken);
    } else {
      throw new Error("full_sync");
    }
  } catch (err: unknown) {
    const isGone =
      err instanceof Error &&
      (err.message === "full_sync" ||
        ("code" in err && (err as { code: number }).code === 410));

    if (isGone) {
      // Full sync: clear old blocks for ALL host locations, fetch next 90 days
      if (locationIds.length > 0) {
        await db
          .from("availability_blocks")
          .delete()
          .in("location_id", locationIds)
          .eq("source", "google_calendar");
      }

      allEvents = [];
      const now = new Date();
      const end = new Date(now);
      end.setDate(end.getDate() + 90);

      let pageToken: string | undefined;
      do {
        const { data: eventsData } = await calendar.events.list({
          calendarId,
          timeMin: now.toISOString(),
          timeMax: end.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 500,
          pageToken,
        });
        allEvents.push(...(eventsData?.items ?? []));
        pageToken = eventsData?.nextPageToken ?? undefined;
        if (!pageToken) {
          nextSyncToken = eventsData?.nextSyncToken ?? undefined;
        }
      } while (pageToken);

      // Insert blocks for every host location
      const eventBlocks = allEvents
        .filter(
          (e) =>
            e.status !== "cancelled" && e.transparency !== "transparent"
        )
        .map((e) => ({
          start_at: e.start?.dateTime ?? `${e.start?.date}T00:00:00Z`,
          end_at: e.end?.dateTime ?? `${e.end?.date}T23:59:59Z`,
          is_blocked: true,
          note: e.summary ?? null,
          source: "google_calendar" as const,
          external_event_id: e.id ?? null,
        }));

      const rows = locationIds.flatMap((locId) =>
        eventBlocks.map((b) => ({ ...b, location_id: locId }))
      );

      if (rows.length > 0) {
        const { error: insertError } = await db
          .from("availability_blocks")
          .insert(rows);
        if (insertError) return { error: insertError.message };
      }

      await db
        .from("google_calendar_connections")
        .update({
          last_sync_at: new Date().toISOString(),
          sync_token: nextSyncToken ?? null,
        })
        .eq("id", row.id);

      return { synced: eventBlocks.length };
    }
    throw err;
  }

  // Incremental: process changed events across all host locations
  let upsertCount = 0;
  for (const event of allEvents) {
    if (!event.id) continue;

    if (
      event.status === "cancelled" ||
      event.transparency === "transparent"
    ) {
      if (locationIds.length > 0) {
        await db
          .from("availability_blocks")
          .delete()
          .in("location_id", locationIds)
          .eq("external_event_id", event.id);
      }
    } else {
      if (locationIds.length > 0) {
        await db
          .from("availability_blocks")
          .delete()
          .in("location_id", locationIds)
          .eq("external_event_id", event.id);
      }

      const newRows = locationIds.map((locId) => ({
        location_id: locId,
        start_at:
          event.start?.dateTime ?? `${event.start?.date}T00:00:00Z`,
        end_at:
          event.end?.dateTime ?? `${event.end?.date}T23:59:59Z`,
        is_blocked: true,
        note: event.summary ?? null,
        source: "google_calendar" as const,
        external_event_id: event.id,
      }));

      if (newRows.length > 0) {
        await db.from("availability_blocks").insert(newRows);
      }
      upsertCount++;
    }
  }

  await db
    .from("google_calendar_connections")
    .update({
      last_sync_at: new Date().toISOString(),
      sync_token: nextSyncToken ?? row.sync_token,
    })
    .eq("id", row.id);

  return { synced: upsertCount };
}

// ── FreeBusy real-time check (looks up host via location) ───────────────────

export interface BusyPeriod {
  start: string;
  end: string;
}

async function getHostIdForLocation(
  locationId: string
): Promise<string | null> {
  const db = createAdminClient();
  const { data } = await db
    .from("locations")
    .select("host_id")
    .eq("id", locationId)
    .maybeSingle();
  return data?.host_id ?? null;
}

export async function checkFreeBusy(
  locationId: string,
  start: string,
  end: string
): Promise<{ busy: BusyPeriod[]; error?: string }> {
  const hostId = await getHostIdForLocation(locationId);
  if (!hostId)
    return { busy: [], error: "Location not found" };

  const row = await loadConnectionRow(hostId);
  if (!row)
    return { busy: [], error: "No Google Calendar connection" };

  const { accessToken, error: tokenError } = await getValidAccessToken(row);
  if (tokenError) return { busy: [], error: tokenError };

  const calendar = getCalendarClient(accessToken);
  const calendarId = row.calendar_id || "primary";

  const { data: freeBusyData } = await calendar.freebusy.query({
    requestBody: {
      timeMin: start,
      timeMax: end,
      items: [{ id: calendarId }],
    },
  });

  const busySlots =
    freeBusyData?.calendars?.[calendarId]?.busy ?? [];

  return {
    busy: busySlots.map((slot) => ({
      start: slot.start ?? start,
      end: slot.end ?? end,
    })),
  };
}

// ── Write-back: create event for approved booking ───────────────────────────

export async function createBookingEvent(params: {
  locationId: string;
  summary: string;
  description: string;
  startDate: string;
  endDate: string;
}): Promise<{ eventId?: string; error?: string }> {
  const hostId = await getHostIdForLocation(params.locationId);
  if (!hostId) return { error: "Location not found" };

  const row = await loadConnectionRow(hostId);
  if (!row) return { error: "No Google Calendar connection" };

  const { accessToken, error: tokenError } = await getValidAccessToken(row);
  if (tokenError) return { error: tokenError };

  const calendar = getCalendarClient(accessToken);
  const calendarId = row.calendar_id || "primary";

  const { data: event } = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: params.summary,
      description: params.description,
      start: { date: params.startDate },
      end: { date: params.endDate },
      transparency: "opaque",
    },
  });

  return { eventId: event?.id ?? undefined };
}

// ── Check if host has an active Google Calendar connection ───────────────────

export async function hasGoogleCalendarConnection(
  hostId: string
): Promise<boolean> {
  const db = createAdminClient();
  const { data } = await db
    .from("google_calendar_connections")
    .select("id")
    .eq("host_id", hostId)
    .eq("sync_enabled", true)
    .maybeSingle();

  return !!data;
}

// ── Check last sync staleness (by locationId — resolves host internally) ────

const STALE_THRESHOLD_MS = 5 * 60 * 1000;

export async function syncIfStale(locationId: string): Promise<void> {
  const hostId = await getHostIdForLocation(locationId);
  if (!hostId) return;

  const db = createAdminClient();
  const { data: conn } = await db
    .from("google_calendar_connections")
    .select("host_id, last_sync_at")
    .eq("host_id", hostId)
    .eq("sync_enabled", true)
    .maybeSingle();

  if (!conn) return;

  const lastSync = conn.last_sync_at
    ? new Date(conn.last_sync_at)
    : null;
  const isStale =
    !lastSync || Date.now() - lastSync.getTime() > STALE_THRESHOLD_MS;

  if (isStale) {
    await syncGoogleCalendarForHost(hostId);
  }
}
