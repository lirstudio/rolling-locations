import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Privacy Policy | Rollin Locations",
  description: "Privacy policy for Rollin Locations.",
};

export default async function PrivacyPage() {
  const t = await getTranslations("marketing.legal");
  return (
    <div className="container px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground">{t("privacyTitle")}</h1>
        <p className="mt-4 text-muted-foreground">{t("privacyPlaceholder")}</p>
      </div>
    </div>
  );
}
