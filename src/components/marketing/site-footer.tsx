"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
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
    <footer className="border-t border-border/60 bg-muted/40">
      <div className="container mx-auto px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="text-lg font-bold text-foreground tracking-tight">Rollin Locations</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">{t("tagline")}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t("product")}</h3>
            <ul className="mt-4 space-y-2.5">
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
            <ul className="mt-4 space-y-2.5">
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
        <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-10 text-xs text-muted-foreground items-center text-center">
          <a
            href="https://lirstudio.co.il/"
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 fill-current shrink-0" />
            <span>by: Lir branding studio</span>
          </a>
          <p>© {new Date().getFullYear()} Rollin Locations. {t("allRights")}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {legalLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            ))}
          </div>
          <p>{t("version")} {APP_VERSION}</p>
        </div>
      </div>
    </footer>
  );
}
