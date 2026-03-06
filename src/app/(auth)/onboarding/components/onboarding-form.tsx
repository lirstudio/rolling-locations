"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Camera, MapPin } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { onboardingSchema, type OnboardingFormValues } from "@/schemas/auth";
import { useAuthStore, roleRedirectPath } from "@/stores/auth-store";
import { isOnboardingComplete } from "@/lib/auth";

export function OnboardingForm({ className, ...props }: React.ComponentProps<"div">) {
  const t = useTranslations("auth");
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, isLoading, error, updateUserMetadata } = useAuthStore();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: "creator",
      name: user?.name ?? "",
      phone: user?.phone ?? "",
    },
  });

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (isInitialized && isAuthenticated && user && isOnboardingComplete(user.role)) {
      router.replace(roleRedirectPath(user.role));
    }
  }, [isInitialized, isAuthenticated, user, router]);

  if (!isInitialized || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isOnboardingComplete(user.role)) {
    return null;
  }

  async function onSubmit(data: OnboardingFormValues) {
    await updateUserMetadata({
      role: data.role,
      name: data.name,
      phone: data.phone || undefined,
    });

    const state = useAuthStore.getState();
    if (state.user) {
      router.push(roleRedirectPath(state.user.role));
    }
  }

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("onboardingTitle")}</CardTitle>
          <CardDescription>{t("onboardingDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fullName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("fullName")}
                        autoComplete="name"
                        autoFocus
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
                    <FormLabel>{t("phone")}</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="050-000-0000"
                        autoComplete="tel"
                        dir="ltr"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("roleSelection")}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div>
                          <RadioGroupItem
                            value="creator"
                            id="role-creator"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="role-creator"
                            className="flex flex-col items-center gap-2 rounded-xl border-2 border-border p-4 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-accent transition-colors"
                          >
                            <Camera className="h-6 w-6 text-muted-foreground" />
                            <span className="font-medium text-sm">{t("roleCreator")}</span>
                            <span className="text-xs text-muted-foreground text-center">
                              {t("roleCreatorDescription")}
                            </span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value="host"
                            id="role-host"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="role-host"
                            className="flex flex-col items-center gap-2 rounded-xl border-2 border-border p-4 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-accent transition-colors"
                          >
                            <MapPin className="h-6 w-6 text-muted-foreground" />
                            <span className="font-medium text-sm">{t("roleHost")}</span>
                            <span className="text-xs text-muted-foreground text-center">
                              {t("roleHostDescription")}
                            </span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading ? "..." : t("completeProfile")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
