"use client";

import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

export default function CreatorInvoicesPage() {
  const t = useTranslations("creator");

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("invoices.title")}
      </h1>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <FileText className="size-8 text-muted-foreground" />
          </div>
          <CardTitle className="mb-2">{t("invoices.comingSoon")}</CardTitle>
          <CardDescription className="max-w-md">
            {t("invoices.description")}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
