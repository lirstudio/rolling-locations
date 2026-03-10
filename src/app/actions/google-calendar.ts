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
  location_id: string;
  google_account_email: string;
  calendar_id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  token_expires_at: string | null;
  last_sync_at: string | null;
  sync_enabled: boolean;
  created_at: string;
};

function rowToConnection(row: ConnectionRow): GoogleCalendarConnection {
  return {
    id: row.id,
    hostId: row.host_id,
    locationId: row.location_id,
    googleAccountEmail: row.google_account_email,
    calendarId: row.calendar_id,
    lastSyncAt: row.last_sync_at ?? undefined,
    syncEnabled: row.sync_enabled,
  };
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function fetchGoogleConnection(
  locationId: string
): Promise<GoogleCalendarConnection | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("google_calendar_connections")
    .select("*")
    .eq("location_id", locationId)
    .maybeSingle();

  if (error || !data) return null;
  return rowToConnection(data as ConnectionRow);
}

export async function disconnectGoogleCalendar(
  locationId: string
): Promise<{ error?: string }> {
  const db = createAdminClient();

  // Remove synced blocks
  const { error: blocksError } = await db
    .from("availability_blocks")
    .delete()
    .eq("location_id", locationId)
    .eq("source", "google_calendar");

  if (blocksError) return { error: blocksError.message };

  // Remove connection
  const { error } = await db
    .from("google_calendar_connections")
    .delete()
    .eq("location_id", locationId);

  if (error) return { error: error.message };
  return {};
}

// ── OAuth token exchange + save ──────────────────────────────────────────────

export async function saveGoogleConnection(params: {
  hostId: string;
  locationId: string;
  code: string;
}): Promise<{ error?: string }> {
  const oauth2 = getGoogleOAuthClient();

  const { tokens } = await oauth2.getToken(params.code);
  if (!tokens.access_token || !tokens.refresh_token) {
    return { error: "Google did not return required tokens" };
  }

  // Get user email
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
      location_id: params.locationId,
      google_account_email: email,
      calendar_id: "primary",
      access_token_encrypted: encrypt(tokens.access_token),
      refresh_token_encrypted: encrypt(tokens.refresh_token),
      token_expires_at: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : null,
      sync_enabled: true,
    },
    { onConflict: "host_id,location_id" }
  );

  if (error) return { error: error.message };
  return {};
}

// ── Sync events → blocks ─────────────────────────────────────────────────────

export async function syncGoogleCalendar(
  locationId: string
): Promise<{ error?: string; synced?: number }> {
  const db = createAdminClient();

  const { data: conn, error: connError } = await db
    .from("google_calendar_connections")
    .select("*")
    .eq("location_id", locationId)
    .maybeSingle();

  if (connError || !conn) {
    return { error: "No Google Calendar connection found" };
  }

  const row = conn as ConnectionRow;
  let accessToken = decrypt(row.access_token_encrypted);
  const refreshToken = decrypt(row.refresh_token_encrypted);

  // Refresh token if expired
  const expiresAt = row.token_expires_at
    ? new Date(row.token_expires_at)
    : null;
  if (!expiresAt || expiresAt < new Date()) {
    const oauth2 = getGoogleOAuthClient();
    oauth2.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2.refreshAccessToken();
    if (!credentials.access_token) {
      return { error: "Failed to refresh Google token" };
    }
    accessToken = credentials.access_token;

    // Update stored tokens
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

  // Fetch events for next 90 days
  const calendar = getCalendarClient(accessToken);
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 90);

  const { data: eventsData } = await calendar.events.list({
    calendarId: row.calendar_id || "primary",
    timeMin: now.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 500,
  });

  const events = eventsData?.items ?? [];

  // Delete old synced blocks for this location
  await db
    .from("availability_blocks")
    .delete()
    .eq("location_id", locationId)
    .eq("source", "google_calendar");

  // Insert new blocks from calendar events
  const blocks = events
    .filter((e) => {
      // Only block confirmed/tentative events, not "free" transparency
      return e.status !== "cancelled" && e.transparency !== "transparent";
    })
    .map((e) => ({
      location_id: locationId,
      start_at: e.start?.dateTime ?? `${e.start?.date}T00:00:00Z`,
      end_at: e.end?.dateTime ?? `${e.end?.date}T23:59:59Z`,
      is_blocked: true,
      note: e.summary ?? null,
      source: "google_calendar",
      external_event_id: e.id ?? null,
    }));

  if (blocks.length > 0) {
    const { error: insertError } = await db
      .from("availability_blocks")
      .insert(blocks);
    if (insertError) return { error: insertError.message };
  }

  // Update last_sync_at
  await db
    .from("google_calendar_connections")
    .update({ last_sync_at: new Date().toISOString() })
    .eq("id", row.id);

  return { synced: blocks.length };
}
