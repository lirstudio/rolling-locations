"use client";

import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Camera,
  Check,
  Loader2,
  MapPin,
  Sparkles,
  User,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { onboardingSchema, type OnboardingFormValues } from "@/schemas/auth";
import { useAuthStore, roleRedirectPath } from "@/stores/auth-store";
import { isOnboardingComplete } from "@/lib/auth";

const TOTAL_STEPS = 3;

export function OnboardingForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isInitialized,
    isLoading,
    error,
    updateUserMetadata,
  } = useAuthStore();

  const [step, setStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: "creator",
      name: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isInitialized, isAuthenticated, router]);

  const didRedirectRef = useRef(false);
  useEffect(() => {
    if (
      !isInitialized ||
      !isAuthenticated ||
      !user ||
      !isOnboardingComplete(user.role) ||
      didRedirectRef.current
    )
      return;
    didRedirectRef.current = true;
    router.replace(roleRedirectPath(user.role));
  }, [isInitialized, isAuthenticated, user, router]);

  const didPopulate = useRef(false);
  useEffect(() => {
    if (!user || didPopulate.current) return;
    didPopulate.current = true;
    if (user.name && user.name !== "User") {
      form.setValue("name", user.name);
    }
    if (user.phone) {
      form.setValue("phone", user.phone);
    }
  }, [user, form]);

  if (!isInitialized || !isAuthenticated || !user) {
    return (
      <div className="bg-muted flex min-h-svh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isOnboardingComplete(user.role)) {
    return null;
  }

  const progressValue = isComplete
    ? 100
    : Math.round(((step + 1) / TOTAL_STEPS) * 100);

  async function handleNext() {
    if (step === 1) {
      const valid = await form.trigger(["name", "phone"]);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: OnboardingFormValues) {
    await updateUserMetadata({
      role: data.role,
      name: data.name,
      phone: data.phone,
    });

    setIsComplete(true);

    setTimeout(() => {
      const state = useAuthStore.getState();
      if (state.user) {
        didRedirectRef.current = true;
        router.replace(roleRedirectPath(state.user.role));
      }
    }, 1500);
  }

  if (isComplete) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6">
        <div className="animate-in zoom-in-50 fade-in-0 duration-500 flex flex-col items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              {t("onboardingSuccessTitle")}
            </h2>
            <p className="text-muted-foreground">
              {t("onboardingSuccessSubtitle")}
            </p>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 self-center text-lg font-semibold"
        >
          <Logo size={28} className="text-primary" />
          {tc("appName")}
        </a>

        {/* Progress */}
        <div className="space-y-2">
          <div dir="ltr">
            <Progress value={progressValue} className="h-1.5" />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {t("onboardingStepOf", {
              current: step + 1,
              total: TOTAL_STEPS,
            })}
          </p>
        </div>

        {/* Step content */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="shadow-lg">
              <div key={step} className="animate-in fade-in-0 duration-300">
                {/* ── Step 0: Welcome ── */}
                {step === 0 && (
                  <>
                    <CardHeader className="pb-2 text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface-hover">
                        <Sparkles className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="text-2xl tracking-tight">
                        {t("onboardingWelcomeTitle")}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {t("onboardingWelcomeSubtitle")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2">
                      <div className="flex justify-center">
                        <Badge
                          variant="secondary"
                          className="gap-2 px-4 py-2 text-sm"
                        >
                          <User className="h-3.5 w-3.5" />
                          <span dir="ltr">{user.email}</span>
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        size="lg"
                        className="w-full cursor-pointer"
                        onClick={handleNext}
                      >
                        {t("onboardingLetsStart")}
                      </Button>
                    </CardContent>
                  </>
                )}

                {/* ── Step 1: Personal details ── */}
                {step === 1 && (
                  <>
                    <CardHeader className="pb-2 text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface-hover">
                        <User className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="text-xl tracking-tight">
                        {t("onboardingPersonalTitle")}
                      </CardTitle>
                      <CardDescription>
                        {t("onboardingPersonalSubtitle")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          {t("onboardingEmailLabel")}
                        </Label>
                        <Input
                          value={user.email}
                          disabled
                          dir="ltr"
                          className="bg-muted text-muted-foreground"
                        />
                      </div>

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
                            <FormLabel>
                              {t("phone")}
                              <span className="ms-0.5 text-destructive">*</span>
                            </FormLabel>
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

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 cursor-pointer"
                          onClick={handleBack}
                        >
                          {t("onboardingBack")}
                        </Button>
                        <Button
                          type="button"
                          className="flex-1 cursor-pointer"
                          onClick={handleNext}
                        >
                          {t("onboardingNext")}
                        </Button>
                      </div>
                    </CardContent>
                  </>
                )}

                {/* ── Step 2: Role selection ── */}
                {step === 2 && (
                  <>
                    <CardHeader className="pb-2 text-center">
                      <CardTitle className="text-xl tracking-tight">
                        {t("onboardingRoleTitle")}
                      </CardTitle>
                      <CardDescription>
                        {t("onboardingRoleSubtitle")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
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
                                    className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-border p-6 transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-surface-hover"
                                  >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                      <Camera className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <span className="font-semibold">
                                      {t("roleCreator")}
                                    </span>
                                    <span className="text-center text-xs leading-relaxed text-muted-foreground">
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
                                    className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-border p-6 transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-surface-hover"
                                  >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                      <MapPin className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <span className="font-semibold">
                                      {t("roleHost")}
                                    </span>
                                    <span className="text-center text-xs leading-relaxed text-muted-foreground">
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
                        <p className="text-center text-sm text-destructive">
                          {error}
                        </p>
                      )}

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 cursor-pointer"
                          onClick={handleBack}
                        >
                          {t("onboardingBack")}
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 cursor-pointer"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            t("completeProfile")
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </>
                )}
              </div>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
