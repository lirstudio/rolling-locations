"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadAvatar } from "@/lib/upload-avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";

const userFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  language: z.string().optional(),
  bio: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UserSettingsPage() {
  const locale = useLocale();
  const dir = locale === "he" ? "rtl" : "ltr";
  const t = useTranslations("settings");
  const { user, updateUser, updateUserMetadata } = useAuthStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(user?.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);

  const nameParts = user?.name?.split(" ") ?? [""];
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName,
      lastName,
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      language: "he",
      bio: "",
    },
  });

  useEffect(() => {
    if (user) {
      setProfileImage(user.avatarUrl ?? null);
      const parts = user.name.split(" ");
      form.reset({
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" "),
        email: user.email,
        phone: user.phone ?? "",
        language: "he",
        bio: "",
      });
    }
  }, [user, form]);

  function onSubmit(data: UserFormValues) {
    const name = [data.firstName, data.lastName].filter(Boolean).join(" ");
    updateUser({ name, email: data.email, phone: data.phone || undefined });
    toast.success(t("saved"));
  }

  function handleDiscard() {
    if (user) {
      const parts = user.name.split(" ");
      form.reset({
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" "),
        email: user.email,
        phone: user.phone ?? "",
        language: "he",
        bio: "",
      });
    }
  }

  const handleFileUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      await updateUserMetadata({ avatar_url: url });
      updateUser({ avatarUrl: url });
      setProfileImage(url);
      toast.success(t("saved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReset = async () => {
    if (!user) return;
    setProfileImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    try {
      await updateUserMetadata({ avatar_url: "" });
      updateUser({ avatarUrl: undefined });
      toast.success(t("saved"));
    } catch {
      toast.error(t("saved"));
    }
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "U";

  return (
    <div
      dir={dir}
      className="mx-auto w-full max-w-4xl px-4 lg:px-6"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="rounded-2xl border-border/60 shadow-card">
            <CardHeader className="text-start">
              <CardTitle>{t("user.title")}</CardTitle>
              <CardDescription>{t("user.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 text-start">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={handleFileUpload}
                    disabled={uploading}
                    className="group relative h-20 w-20 cursor-pointer rounded-full overflow-hidden border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
                    aria-label={t("user.uploadPhoto")}
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
                      onClick={handleReset}
                      className="absolute -top-1 -end-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow-sm hover:bg-destructive/90 cursor-pointer"
                      aria-label={t("user.reset")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{t("user.profilePicture")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("user.allowedFormats")}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormField
                  control={form.control}
                  name="firstName"
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
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("user.lastName")}</FormLabel>
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
                      <FormLabel>{t("user.email")}</FormLabel>
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
                    <FormItem>
                      <FormLabel>{t("user.phone")}</FormLabel>
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
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("user.language")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="he">
                            {t("languages.he")}
                          </SelectItem>
                          <SelectItem value="en">
                            {t("languages.en")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
                    <FormLabel>{t("user.bio")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("user.bioPlaceholder")}
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-wrap gap-3 justify-start">
                <Button type="submit" className="rounded-full px-6 cursor-pointer">
                  {t("saveChanges")}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleDiscard}
                  className="rounded-full cursor-pointer"
                >
                  {t("discard")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
