"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { uploadAvatar } from "@/lib/upload-avatar";

const profileSchema = z.object({
  displayName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function HostSettingsPage() {
  const t = useTranslations("host");
  const { user, updateUser, updateUserMetadata } = useAuthStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.avatarUrl ?? null
  );
  const [uploading, setUploading] = useState(false);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      bio: "",
    },
  });

  useEffect(() => {
    if (user) {
      setProfileImage(user.avatarUrl ?? null);
      form.reset({
        displayName: user.name,
        email: user.email,
        phone: user.phone ?? "",
        bio: "",
      });
    }
  }, [user, form]);

  const [notifications, setNotifications] = useState({
    newRequest: true,
    requestStatus: true,
    marketing: false,
  });

  function onSubmit(data: ProfileValues) {
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

  function handleDiscard() {
    if (user) {
      form.reset({
        displayName: user.name,
        email: user.email,
        phone: user.phone ?? "",
        bio: "",
      });
    }
  }

  const handleFileUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      await updateUserMetadata({ avatar_url: url });
      updateUser({ avatarUrl: url });
      setProfileImage(url);
      toast.success(t("settings.saveSuccess"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleResetPhoto = async () => {
    if (!user) return;
    setProfileImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    try {
      await updateUserMetadata({ avatar_url: "" });
      updateUser({ avatarUrl: undefined });
      toast.success(t("settings.saveSuccess"));
    } catch {
      toast.error("Failed to remove photo");
    }
  };

  function handleSaveNotifications() {
    toast.success(t("settings.saveSuccess"));
  }

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("settings.title")}
      </h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">{t("settings.profile")}</TabsTrigger>
          <TabsTrigger value="notifications">
            {t("settings.notifications")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>{t("settings.profile")}</CardTitle>
                  <CardDescription>
                    {t("settings.profileDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={handleFileUpload}
                        disabled={uploading}
                        className="group relative h-20 w-20 cursor-pointer rounded-full overflow-hidden border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
                        aria-label={t("settings.uploadPhoto")}
                      >
                        <Avatar className="h-full w-full">
                          <AvatarImage
                            src={profileImage ?? undefined}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-xl font-semibold bg-muted">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-disabled:opacity-0">
                          {uploading ? (
                            <Loader2 className="h-5 w-5 text-white animate-spin" />
                          ) : (
                            <Camera className="h-5 w-5 text-white" />
                          )}
                        </div>
                      </button>
                      {profileImage && !uploading && (
                        <button
                          type="button"
                          onClick={handleResetPhoto}
                          className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow-sm hover:bg-destructive/90 cursor-pointer"
                          aria-label={t("settings.resetPhoto")}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">
                        {t("settings.profilePicture")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("settings.allowedFormats")}
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/gif,image/png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  <Separator />

                  <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
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
                            <Input type="email" dir="ltr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("settings.phone")}</FormLabel>
                          <FormControl>
                            <Input type="tel" dir="ltr" {...field} />
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
                          <Textarea
                            placeholder={t("settings.bioPlaceholder")}
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3">
                    <Button type="submit" className="cursor-pointer">
                      {t("settings.saveChanges")}
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleDiscard}
                      className="cursor-pointer"
                    >
                      {t("settings.discard")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.notifications")}</CardTitle>
              <CardDescription>
                {t("settings.notificationsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className="text-sm font-medium">
                {t("settings.emailNotifications")}
              </h3>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="newRequest">
                    {t("settings.newRequestNotification")}
                  </Label>
                  <Switch
                    id="newRequest"
                    checked={notifications.newRequest}
                    onCheckedChange={(checked) =>
                      setNotifications((n) => ({
                        ...n,
                        newRequest: checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="requestStatus">
                    {t("settings.requestStatusNotification")}
                  </Label>
                  <Switch
                    id="requestStatus"
                    checked={notifications.requestStatus}
                    onCheckedChange={(checked) =>
                      setNotifications((n) => ({
                        ...n,
                        requestStatus: checked,
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
                    checked={notifications.marketing}
                    onCheckedChange={(checked) =>
                      setNotifications((n) => ({
                        ...n,
                        marketing: checked,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex gap-3">
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
