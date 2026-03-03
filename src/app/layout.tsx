import type { Metadata } from "next";
import "./globals.css";

import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { heebo } from "@/lib/fonts";
import heMessages from "@/locales/he";

export const metadata: Metadata = {
  title: "Rollin Locations",
  description: "מצאו ובצעו הזמנה של לוקיישנים ייחודיים לצילום.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = "he";

  return (
    <html lang={locale} dir={locale === "he" ? "rtl" : "ltr"} className={`${heebo.variable} antialiased`}>
      <body className={heebo.className}>
        <NextIntlClientProvider locale={locale} messages={heMessages}>
          <ThemeProvider defaultTheme="light" storageKey="rollin-theme">
            <SidebarConfigProvider>
              {children}
            </SidebarConfigProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
