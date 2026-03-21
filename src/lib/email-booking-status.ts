import emailsHe from "@/locales/he/emails";
import emailsEn from "@/locales/en/emails";

type EmailLocaleBundle = typeof emailsHe | typeof emailsEn;

export type BookingEmailLocale = "he" | "en";

export function getBookingEmailCopy(locale: BookingEmailLocale): EmailLocaleBundle {
  return locale === "en" ? emailsEn : emailsHe;
}

export function interpolate(
  template: string,
  vars: Record<string, string>
): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    const needle = `{${key}}`;
    out = out.split(needle).join(value);
  }
  return out;
}

export function statusLabelForEmail(
  copy: EmailLocaleBundle,
  status: string
): string {
  const labels = copy.bookingStatusLabels;
  const key = status as keyof typeof labels;
  if (key in labels) {
    return labels[key];
  }
  return status;
}
