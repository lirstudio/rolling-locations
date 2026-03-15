"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const t = useTranslations("marketing.contact");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        {sent ? (
          <p className="mt-8 rounded-xl border border-border bg-muted/30 p-6 text-foreground">
            {t("success")}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <Label htmlFor="name">{t("name")}</Label>
              <Input id="name" name="name" className="mt-2" required />
            </div>
            <div>
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" name="email" type="email" className="mt-2" required />
            </div>
            <div>
              <Label htmlFor="subject">{t("subject")}</Label>
              <Input id="subject" name="subject" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="message">{t("message")}</Label>
              <Textarea id="message" name="message" rows={5} className="mt-2" required />
            </div>
            <Button type="submit">{t("send")}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
