"use server";

import React from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale/he";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { HostBookingEmail } from "@/emails/host-booking-notification";
import { CreatorBookingEmail } from "@/emails/creator-booking-confirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.BOOKINGS_FROM_EMAIL ?? "Rollin Locations <bookings@locations.rollin.video>";
const ADMIN_FALLBACK_HOST_EMAIL = process.env.ADMIN_HOST_FALLBACK_EMAIL;

export interface CreateBookingInput {
  locationId: string;
  locationTitle: string;
  locationAddress: string;
  hostId: string;
  hostEmail?: string;
  creatorName: string;
  creatorEmail: string;
  creatorPhone?: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  dailyRate: number;
  subtotal: number;
  total: number;
  notes?: string;
}

export interface CreateBookingResult {
  bookingId?: string;
  error?: string;
}

// ── DB booking row type ───────────────────────────────────────────────────────

export interface DbBookingRequest {
  id: string;
  location_id: string;
  location_title: string;
  location_address: string;
  creator_name: string;
  creator_email: string;
  creator_phone: string | null;
  start_date: string;
  end_date: string;
  duration_days: number;
  daily_rate: number;
  subtotal: number;
  total: number;
  notes: string | null;
  status: string;
  host_id: string | null;
  host_email: string | null;
  created_at: string;
  updated_at: string;
}

// ── Fetch all booking requests (admin-level; v1 has no per-host auth yet) ─────

export async function fetchAllBookingRequests(): Promise<DbBookingRequest[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[fetchAllBookingRequests] error:", error.message);
    return [];
  }
  return (data ?? []) as DbBookingRequest[];
}

export async function fetchBookingRequestById(
  id: string
): Promise<DbBookingRequest | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("booking_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as DbBookingRequest;
}

export async function updateBookingStatusInDb(
  id: string,
  status: string
): Promise<{ error?: string }> {
  const db = createAdminClient();
  const { error } = await db
    .from("booking_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[updateBookingStatusInDb] error:", error.message);
    return { error: error.message };
  }
  return {};
}

export async function createBookingRequest(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  const db = createAdminClient();

  // 1. Persist to DB
  const { data, error: dbError } = await db
    .from("booking_requests")
    .insert({
      location_id: input.locationId,
      location_title: input.locationTitle,
      location_address: input.locationAddress,
      creator_name: input.creatorName,
      creator_email: input.creatorEmail,
      creator_phone: input.creatorPhone ?? null,
      start_date: input.startDate,
      end_date: input.endDate,
      duration_days: input.durationDays,
      daily_rate: input.dailyRate,
      subtotal: input.subtotal,
      total: input.total,
      notes: input.notes ?? null,
      status: "requested",
      host_id: input.hostId,
      host_email: input.hostEmail ?? null,
    })
    .select("id")
    .single();

  if (dbError || !data) {
    console.error("[createBookingRequest] DB error:", dbError?.message);
    return { error: dbError?.message ?? "שגיאה בשמירת הבקשה" };
  }

  const bookingId = (data as { id: string }).id;

  const hostEmailTarget = input.hostEmail ?? ADMIN_FALLBACK_HOST_EMAIL;

  const displayStart = format(new Date(input.startDate), "EEEE, d MMMM yyyy", { locale: he });
  const displayEnd = format(new Date(input.endDate), "EEEE, d MMMM yyyy", { locale: he });

  // 2. Send both emails in parallel – don't block on failure (host email only if target from input or env)
  const hostPromise = hostEmailTarget
    ? resend.emails.send({
        from: FROM_EMAIL,
        to: hostEmailTarget,
        subject: `בקשת הזמנה חדשה — ${input.locationTitle}`,
        react: React.createElement(HostBookingEmail, {
          locationTitle: input.locationTitle,
          locationAddress: input.locationAddress,
          creatorName: input.creatorName,
          creatorEmail: input.creatorEmail,
          creatorPhone: input.creatorPhone,
          startDate: displayStart,
          endDate: displayEnd,
          durationDays: input.durationDays,
          dailyRate: input.dailyRate,
          subtotal: input.subtotal,
          total: input.total,
          notes: input.notes,
          bookingId,
        }),
      })
    : Promise.resolve({ data: null, error: null });
  const creatorPromise = resend.emails.send({
    from: FROM_EMAIL,
    to: input.creatorEmail,
    subject: `אישור בקשת הזמנה — ${input.locationTitle}`,
    react: React.createElement(CreatorBookingEmail, {
      creatorName: input.creatorName,
      locationTitle: input.locationTitle,
      locationAddress: input.locationAddress,
      startDate: displayStart,
      endDate: displayEnd,
      durationDays: input.durationDays,
      dailyRate: input.dailyRate,
      subtotal: input.subtotal,
      total: input.total,
      notes: input.notes,
      bookingId,
    }),
  });

  const [hostResult, creatorResult] = await Promise.allSettled([hostPromise, creatorPromise]);

  if (hostResult.status === "rejected") {
    console.error("[createBookingRequest] Host email REJECTED:", hostResult.reason);
  } else {
    const hostData = hostResult.value;
    if (hostData.error) {
      console.error("[createBookingRequest] Host email API error:", JSON.stringify(hostData.error));
    } else {
      console.log("[createBookingRequest] Host email sent:", hostData.data?.id);
    }
  }

  if (creatorResult.status === "rejected") {
    console.error("[createBookingRequest] Creator email REJECTED:", creatorResult.reason);
  } else {
    const creatorData = creatorResult.value;
    if (creatorData.error) {
      console.error("[createBookingRequest] Creator email API error:", JSON.stringify(creatorData.error));
    } else {
      console.log("[createBookingRequest] Creator email sent:", creatorData.data?.id);
    }
  }

  return { bookingId };
}
