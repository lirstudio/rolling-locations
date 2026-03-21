import type {
  NotificationPreferencesInput,
  UserNotificationPreferences,
} from "@/types/notification-preferences";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/types/notification-preferences";

export function mergeNotificationPreferences(
  row: Partial<UserNotificationPreferences> | null
): NotificationPreferencesInput {
  if (!row) {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
  return {
    email_new_booking_request:
      row.email_new_booking_request ??
      DEFAULT_NOTIFICATION_PREFERENCES.email_new_booking_request,
    email_booking_status:
      row.email_booking_status ??
      DEFAULT_NOTIFICATION_PREFERENCES.email_booking_status,
    email_messages:
      row.email_messages ?? DEFAULT_NOTIFICATION_PREFERENCES.email_messages,
    email_marketing:
      row.email_marketing ?? DEFAULT_NOTIFICATION_PREFERENCES.email_marketing,
  };
}
