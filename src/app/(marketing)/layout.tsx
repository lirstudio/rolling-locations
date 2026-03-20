import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: { default: "Rollin Locations", template: "%s | Rollin Locations" },
  description: "Find and book unique shoot locations by the hour.",
  openGraph: { title: "Rollin Locations", description: "Find and book unique shoot locations by the hour.", type: "website" },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
