"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { APP_VERSION } from "@/generated/version";

export function SiteFooter() {
  const t = useTranslations("marketing.footer");

  const productLinks = [
    { href: "/locations", label: t("discover") },
    { href: "/#how-it-works", label: t("howItWorks") },
    { href: "/for-hosts", label: t("forHosts") },
  ];

  const companyLinks = [
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
    { href: "/faq", label: t("faq") },
  ];

  const legalLinks = [
    { href: "/terms", label: t("terms") },
    { href: "/privacy", label: t("privacy") },
  ];

  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="font-bold text-foreground">Rollin Locations</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm">{t("tagline")}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t("product")}</h3>
            <ul className="mt-3 space-y-2">
              {productLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t("company")}</h3>
            <ul className="mt-3 space-y-2">
              {companyLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Rollin Locations. {t("allRights")}</p>
            <p className="text-xs text-muted-foreground">{t("version")} {APP_VERSION}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {legalLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
