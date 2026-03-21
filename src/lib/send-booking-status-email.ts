import React from "react";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { CreatorBookingStatusEmail } from "@/emails/creator-booking-status";
import {
  getBookingEmailCopy,
  interpolate,
  statusLabelForEmail,
  type BookingEmailLocale,
} from "@/lib/email-booking-status";
import { mergeNotificationPreferences } from "@/lib/notification-preferences";
import {
  getCreatorUserIdByEmailAdmin,
  getNotificationPreferencesByUserIdAdmin,
} from "@/lib/notification-preferences-admin";

export type BookingRowForStatusEmail = {
  id: string;
  creator_email: string;
  creator_name: string;
  location_title: string;
};

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.BOOKINGS_FROM_EMAIL ?? "Rollin Locations <bookings@locations.rollin.video>";

function resolveLocale(): BookingEmailLocale {
  return "he";
}

export async function sendCreatorBookingStatusEmail(args: {
  booking: BookingRowForStatusEmail;
  newStatus: string;
}): Promise<{ sent: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[sendCreatorBookingStatusEmail] RESEND_API_KEY missing");
    return { sent: false, error: "missing_api_key" };
  }

  const locale = resolveLocale();
  const copy = getBookingEmailCopy(locale);
  const creatorUserId = await getCreatorUserIdByEmailAdmin(
    args.booking.creator_email
  );
  const prefs = creatorUserId
    ? await getNotificationPreferencesByUserIdAdmin(creatorUserId)
    : mergeNotificationPreferences(null);

  if (!prefs.email_booking_status) {
    return { sent: false };
  }

  const statusLabel = statusLabelForEmail(copy, args.newStatus);
  const subject = interpolate(copy.bookingStatus.creatorSubject, {
    locationTitle: args.booking.location_title,
  });
  const intro = interpolate(copy.bookingStatus.creatorIntro, {
    creatorName: args.booking.creator_name,
  });
  const statusLine = interpolate(copy.bookingStatus.statusLine, {
    locationTitle: args.booking.location_title,
    statusLabel,
  });
  const dir = locale === "he" ? "rtl" : "ltr";

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: args.booking.creator_email,
    subject,
    react: React.createElement(CreatorBookingStatusEmail, {
      dir,
      lang: locale,
      intro,
      statusLine,
      bookingIdLabel: copy.bookingStatus.bookingId,
      bookingId: args.booking.id,
      footerHint: copy.bookingStatus.viewInApp,
    }),
  });

  if (error) {
    console.error(
      "[sendCreatorBookingStatusEmail] Resend error:",
      JSON.stringify(error)
    );
    return { sent: false, error: "resend_failed" };
  }

  return { sent: true };
}

export async function markBookingLastStatusNotified(
  bookingId: string,
  status: string
): Promise<void> {
  const db = createAdminClient();
  const { error } = await db
    .from("booking_requests")
    .update({ last_status_notified: status })
    .eq("id", bookingId);

  if (error) {
    console.error("[markBookingLastStatusNotified]", error.message);
  }
}
