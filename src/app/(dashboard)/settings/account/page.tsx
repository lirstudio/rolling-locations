"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function AccountSettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const { user, updateUser } = useAuthStore();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
      });
    }
  }, [user, profileForm]);

  function onProfileSubmit(data: ProfileValues) {
    updateUser({ name: data.name, email: data.email, phone: data.phone || undefined });
    toast.success(t("saved"));
  }

  function onPasswordSubmit(_data: PasswordValues) {
    toast.success(t("saved"));
    passwordForm.reset();
  }

  function handleDiscard() {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
      });
    }
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">{t("account.title")}</h1>
        <p className="text-muted-foreground">{t("account.description")}</p>
      </div>

      {/* Personal info */}
      <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("account.personalInfo")}</CardTitle>
              <CardDescription>
                {t("account.personalInfoDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("user.firstName")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("user.email")}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("user.phone")}</FormLabel>
                    <FormControl>
                      <Input type="tel" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="cursor-pointer">
                  {t("saveChanges")}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleDiscard}
                  className="cursor-pointer"
                >
                  {t("discard")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Password */}
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{t("account.changePassword")}</CardTitle>
              <CardDescription>
                {t("account.changePasswordDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("account.currentPassword")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("account.newPassword")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("account.confirmNewPassword")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="outline" className="cursor-pointer">
                {t("account.changePassword")}
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Danger zone */}
      <Card>
        <CardHeader>
          <CardTitle>{t("account.dangerZone")}</CardTitle>
          <CardDescription>{t("account.dangerZoneDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-semibold">{t("account.deleteAccount")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("account.deleteAccountDescription")}
              </p>
            </div>
            <Button variant="destructive" type="button" className="cursor-pointer">
              {tCommon("delete")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
