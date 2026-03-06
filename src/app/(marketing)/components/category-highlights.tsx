"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { MOCK_CATEGORIES } from "@/data/mock-locations";

export function CategoryHighlights() {
  const t = useTranslations("marketing.categories");
  const tLoc = useTranslations("locations");

  return (
    <section className="border-b border-border bg-muted/30 py-12 sm:py-16">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{t("title")}</h2>
          <Link
            href="/locations"
            className="text-sm font-medium text-primary hover:underline shrink-0"
          >
            {t("viewAll")}
          </Link>
        </div>
        <div className="mt-6 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
          <div className="flex gap-2 sm:flex-wrap min-w-0 pb-2 sm:pb-0">
            {MOCK_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/locations?category=${cat.slug}`}
                className="shrink-0 snap-start rounded-full border border-border bg-card px-5 py-2.5 text-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 font-medium text-sm sm:rounded-xl sm:px-4 sm:py-2"
              >
                <span>{tLoc(`categories.${cat.slug}`)}</span>
                {cat.count != null && (
                  <span className="ms-2 text-muted-foreground">({cat.count})</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
