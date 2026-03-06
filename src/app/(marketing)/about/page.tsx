"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const t = useTranslations("marketing.about");

  return (
    <div className="container px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-foreground">{t("storyTitle")}</h2>
          <p className="mt-3 text-muted-foreground">{t("storyBody")}</p>
        </section>
        <section className="mt-10 grid gap-8 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-muted/30 p-6">
            <h3 className="font-semibold text-foreground">{t("forCreators")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("forCreatorsBody")}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-6">
            <h3 className="font-semibold text-foreground">{t("forHosts")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("forHostsBody")}</p>
          </div>
        </section>
        <div className="mt-10">
          <Button asChild>
            <Link href="/locations">{t("cta")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
