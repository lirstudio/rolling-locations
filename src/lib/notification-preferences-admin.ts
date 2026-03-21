import { createAdminClient } from "@/lib/supabase/admin";
import { mergeNotificationPreferences } from "@/lib/notification-preferences";
import type { NotificationPreferencesInput } from "@/types/notification-preferences";

export async function getNotificationPreferencesByUserIdAdmin(
  userId: string
): Promise<NotificationPreferencesInput> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("user_notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[getNotificationPreferencesByUserIdAdmin]", error.message);
    return mergeNotificationPreferences(null);
  }
  return mergeNotificationPreferences(data);
}

export async function getCreatorUserIdByEmailAdmin(
  email: string
): Promise<string | null> {
  const db = createAdminClient();
  const { data, error } = await db.rpc("user_id_by_email", {
    email_input: email,
  });

  if (error) {
    console.error("[user_id_by_email]", error.message);
    return null;
  }
  if (data == null || typeof data !== "string") {
    return null;
  }
  return data;
}
