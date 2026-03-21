"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuthStore } from "@/stores/auth-store";
import {
  getNotificationPreferences,
  upsertNotificationPreferences,
} from "@/app/actions/notification-preferences";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/types/notification-preferences";
import type { NotificationPreferencesInput } from "@/types/notification-preferences";

const profileSchema = z.object({
  displayName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function CreatorSettingsPage() {
  const locale = useLocale();
  const dir = locale === "he" ? "rtl" : "ltr";
  const t = useTranslations("creator");
  const { user, updateUser, updateUserMetadata } = useAuthStore();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      bio: "",
    },
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.name,
        email: user.email,
        phone: user.phone ?? "",
        bio: "",
      });
    }
  }, [user, form]);

  const [notifications, setNotifications] =
    React.useState<NotificationPreferencesInput>(DEFAULT_NOTIFICATION_PREFERENCES);

  React.useEffect(() => {
    getNotificationPreferences().then((r) => {
      if (r.prefs) {
        setNotifications(r.prefs);
      }
    });
  }, []);

  function onSubmitProfile(data: ProfileValues) {
    updateUser({
      name: data.displayName,
      email: data.email,
      phone: data.phone || undefined,
    });
    updateUserMetadata({
      name: data.displayName,
      phone: data.phone || undefined,
    });
    toast.success(t("settings.saveSuccess"));
  }

  async function handleSaveNotifications() {
    const result = await upsertNotificationPreferences(notifications);
    if (result.error) {
      toast.error(t("settings.saveError"));
      return;
    }
    toast.success(t("settings.saveSuccess"));
  }

  return (
    <div
      dir={dir}
      className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 lg:px-6"
    >
      <h1 className="text-start text-2xl font-bold tracking-tight">
        {t("settings.title")}
      </h1>

      <Tabs dir={dir} defaultValue="profile" className="w-full">
        <div className="flex w-full justify-start">
          <TabsList>
            <TabsTrigger value="profile">{t("settings.profile")}</TabsTrigger>
            <TabsTrigger value="notifications">
              {t("settings.notifications")}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitProfile)}>
              <Card>
                <CardHeader className="text-start">
                  <CardTitle>{t("settings.profile")}</CardTitle>
                  <CardDescription>
                    {t("settings.profileDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-start">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("settings.displayName")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("settings.email")}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              dir="ltr"
                              className="!text-end"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>{t("settings.phone")}</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              dir="ltr"
                              className="!text-end"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("settings.bio")}</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-start">
                    <Button type="submit" className="cursor-pointer">
                      {t("settings.saveChanges")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader className="text-start">
              <CardTitle>{t("settings.notifications")}</CardTitle>
              <CardDescription>
                {t("settings.notificationsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-start">
              <h3 className="text-sm font-medium">
                {t("settings.emailNotifications")}
              </h3>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bookingStatus">
                    {t("settings.bookingStatusNotification")}
                  </Label>
                  <Switch
                    id="bookingStatus"
                    checked={notifications.email_booking_status}
                    onCheckedChange={(checked) =>
                      setNotifications((n) => ({
                        ...n,
                        email_booking_status: checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="newMessage">
                    {t("settings.newMessageNotification")}
                  </Label>
                  <Switch
                    id="newMessage"
                    checked={notifications.email_messages}
                    onCheckedChange={(checked) =>
                      setNotifications((n) => ({
                        ...n,
                        email_messages: checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="marketing">
                    {t("settings.marketingNotification")}
                  </Label>
                  <Switch
                    id="marketing"
                    checked={notifications.email_marketing}
                    onCheckedChange={(checked) =>
                      setNotifications((n) => ({
                        ...n,
                        email_marketing: checked,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-start">
                <Button
                  type="button"
                  onClick={handleSaveNotifications}
                  className="cursor-pointer"
                >
                  {t("settings.saveChanges")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
