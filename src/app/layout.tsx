import type { Metadata } from "next";
import "./globals.css";

import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { AuthProvider } from "@/components/auth/auth-provider";
import { QueryProvider } from "@/components/query-provider";
import { RadixDirectionProvider } from "@/components/providers/radix-direction-provider";
import { heebo } from "@/lib/fonts";
import heMessages from "@/locales/he";

export const metadata: Metadata = {
  title: "Rollin Locations",
  description: "מצאו ובצעו הזמנה של לוקיישנים ייחודיים לצילום.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
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
          <RadixDirectionProvider>
            <ThemeProvider defaultTheme="light" storageKey="rollin-theme">
              <QueryProvider>
                <AuthProvider>
                  <SidebarConfigProvider>
                    {children}
                  </SidebarConfigProvider>
                </AuthProvider>
              </QueryProvider>
            </ThemeProvider>
          </RadixDirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
