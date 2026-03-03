"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/schemas/auth";

export function ForgotPasswordForm1({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations("auth");
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(_data: ForgotPasswordFormValues) {
    await new Promise((r) => setTimeout(r, 400));
    setSent(true);
  }

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {t("forgotPasswordTitle")}
          </CardTitle>
          <CardDescription>{t("forgotPasswordDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="grid gap-4 text-center">
              <p className="text-sm text-muted-foreground">
                {t("resetLinkSent")}
              </p>
              <Link href="/sign-in">
                <Button variant="outline" className="w-full cursor-pointer">
                  {t("backToSignIn")}
                </Button>
              </Link>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-6">
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("email")}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="name@example.com"
                              autoComplete="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full cursor-pointer">
                      {t("sendResetLink")}
                    </Button>
                  </div>
                  <div className="text-center text-sm">
                    {t("rememberPassword")}{" "}
                    <Link
                      href="/sign-in"
                      className="underline underline-offset-4"
                    >
                      {t("backToSignIn")}
                    </Link>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
