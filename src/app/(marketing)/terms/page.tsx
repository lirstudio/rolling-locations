import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalMarkdownBody } from "@/components/legal/legal-markdown-body";
import { getLegalMarkdown } from "@/lib/get-legal-markdown";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("marketing.legal");
  return {
    title: `${t("termsTitle")} | Rollin Locations`,
    description: t("termsMetaDescription"),
  };
}

export default async function TermsPage() {
  const t = await getTranslations("marketing.legal");
  const markdown = await getLegalMarkdown("terms");

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("termsTitle")}</h1>
        <p className="mt-2 text-xs text-muted-foreground">{t("legalNotice")}</p>
        <LegalMarkdownBody content={markdown} />
      </article>
    </div>
  );
}
