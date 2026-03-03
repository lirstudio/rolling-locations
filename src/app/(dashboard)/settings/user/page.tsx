"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  const t = useTranslations("settings");
  const { user, updateUser } = useAuthStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfileImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setProfileImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "U";

  return (
    <div className="px-4 lg:px-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{t("user.title")}</CardTitle>
              <CardDescription>{t("user.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 rounded-lg">
                  <AvatarImage src={profileImage ?? undefined} />
                  <AvatarFallback className="rounded-lg text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={handleFileUpload}
                      className="cursor-pointer"
                    >
                      <Upload className="me-2 h-4 w-4" />
                      {t("user.uploadPhoto")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={handleReset}
                      className="cursor-pointer"
                    >
                      {t("user.reset")}
                    </Button>
                  </div>
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

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <Input type="email" {...field} />
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
                        <Input type="tel" dir="ltr" {...field} />
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

              {/* Actions */}
              <div className="flex gap-3">
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
    </div>
  );
}
