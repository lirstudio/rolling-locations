import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Terms of Use | Rollin Locations",
  description: "Terms of use for Rollin Locations.",
};

export default async function TermsPage() {
  const t = await getTranslations("marketing.legal");
  return (
    <div className="container px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground">{t("termsTitle")}</h1>
        <p className="mt-4 text-muted-foreground">{t("termsPlaceholder")}</p>
      </div>
    </div>
  );
}
