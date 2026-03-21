export interface UserNotificationPreferences {
  user_id: string;
  email_new_booking_request: boolean;
  email_booking_status: boolean;
  email_messages: boolean;
  email_marketing: boolean;
  updated_at: string;
}

export type NotificationPreferencesInput = Omit<
  UserNotificationPreferences,
  "user_id" | "updated_at"
>;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferencesInput = {
  email_new_booking_request: true,
  email_booking_status: true,
  email_messages: true,
  email_marketing: false,
};
