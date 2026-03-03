import { getRequestConfig } from "next-intl/server";
import heMessages from "@/locales/he";
import enMessages from "@/locales/en";

const messages = { he: heMessages, en: enMessages } as const;
type Locale = keyof typeof messages;

export default getRequestConfig(async () => {
  const locale: Locale = "he";

  return {
    locale,
    messages: messages[locale],
  };
});
