"use server";

import { createClient } from "@/lib/supabase/server";
import { mergeNotificationPreferences } from "@/lib/notification-preferences";
import type { NotificationPreferencesInput } from "@/types/notification-preferences";

export async function getNotificationPreferences(): Promise<{
  prefs: NotificationPreferencesInput | null;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { prefs: null, error: "unauthorized" };
  }

  const { data, error } = await supabase
    .from("user_notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[getNotificationPreferences]", error.message);
    return { prefs: mergeNotificationPreferences(null), error: error.message };
  }

  return { prefs: mergeNotificationPreferences(data) };
}

export async function upsertNotificationPreferences(
  input: NotificationPreferencesInput
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "unauthorized" };
  }

  const { error } = await supabase.from("user_notification_preferences").upsert(
    {
      user_id: user.id,
      email_new_booking_request: input.email_new_booking_request,
      email_booking_status: input.email_booking_status,
      email_messages: input.email_messages,
      email_marketing: input.email_marketing,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("[upsertNotificationPreferences]", error.message);
    return { error: error.message };
  }

  return {};
}
