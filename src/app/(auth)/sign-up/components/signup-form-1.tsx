"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Camera, MapPin, Mail } from "lucide-react";
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
import { signUpSchema, verifyOtpSchema, type SignUpFormValues, type VerifyOtpFormValues } from "@/schemas/auth";
import { useAuthStore, roleRedirectPath } from "@/stores/auth-store";

export function SignupForm1({ className, ...props }: React.ComponentProps<"div">) {
  const t = useTranslations("auth");
  const router = useRouter();
  const {
    sendMagicLink,
    sendOtp,
    verifyOtp,
    signInWithGoogle,
    setPendingSignUpRole,
    isLoading,
    error,
    clearError,
    isAuthenticated,
    user,
  } = useAuthStore();

  const [step, setStep] = useState<"details" | "sent" | "otp">("details");

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", role: "creator" },
  });

  const otpForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: "", token: "" },
  });

  if (isAuthenticated && user) {
    router.push(roleRedirectPath(user.role));
    return null;
  }

  async function onSignUpSubmit(data: SignUpFormValues, mode: "link" | "code") {
    clearError();
    setPendingSignUpRole(data.role);

    if (mode === "link") {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      await sendMagicLink(data.email, `${origin}/auth/callback`);
      if (!useAuthStore.getState().error) setStep("sent");
    } else {
      await sendOtp(data.email);
      if (!useAuthStore.getState().error) {
        otpForm.setValue("email", data.email);
        setStep("otp");
      }
    }
  }

  async function onOtpSubmit(data: VerifyOtpFormValues) {
    clearError();
    await verifyOtp(data.email, data.token);
    const state = useAuthStore.getState();
    if (state.isAuthenticated && state.user) {
      router.push(roleRedirectPath(state.user.role));
    }
  }

  async function onGoogle() {
    clearError();
    const role = signUpForm.getValues("role");
    await signInWithGoogle(undefined, role);
  }

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("createAccount")}</CardTitle>
          <CardDescription>{t("signUpDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === "sent" && (
            <div className="grid gap-4 text-center">
              <p className="text-sm text-muted-foreground">{t("checkYourEmail")}</p>
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => setStep("details")}
              >
                {t("backToSignIn")}
              </Button>
              <div className="text-center text-sm">
                {t("alreadyHaveAccount")}{" "}
                <Link href="/sign-in" className="underline underline-offset-4">
                  {t("signIn")}
                </Link>
              </div>
            </div>
          )}

          {step === "otp" && (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="grid gap-4">
                <FormField
                  control={otpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={otpForm.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("enterCode")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("codePlaceholder")}
                          maxLength={6}
                          className="text-center font-mono text-lg tracking-widest"
                          dir="ltr"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
                <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                  {isLoading ? "..." : t("verify")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full cursor-pointer"
                  onClick={() => setStep("details")}
                >
                  {t("backToSignIn")}
                </Button>
              </form>
            </Form>
          )}

          {step === "details" && (
            <>
              <Form {...signUpForm}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    signUpForm.handleSubmit((data) => onSignUpSubmit(data, "link"))(e);
                  }}
                  className="grid gap-4"
                >
                  <FormField
                    control={signUpForm.control}
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

                  <FormField
                    control={signUpForm.control}
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
                    {isLoading ? "..." : t("sendMagicLink")}
                  </Button>
                </form>
              </Form>

              <div className="relative my-4">
                <span className="bg-card absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </span>
                <span className="bg-card relative flex justify-center text-xs uppercase text-muted-foreground">
                  {t("orContinueWith")}
                </span>
              </div>

              <div className="grid gap-2">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full cursor-pointer"
                  disabled={isLoading}
                  onClick={() =>
                    signUpForm.handleSubmit(
                      (data) => onSignUpSubmit(data, "code"),
                      () => {}
                    )()
                  }
                >
                  <Mail className="me-2 h-4 w-4" />
                  {t("sendCode")}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full cursor-pointer"
                  disabled={isLoading}
                  onClick={onGoogle}
                >
                  <svg className="me-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {t("continueWithGoogle")}
                </Button>
              </div>

              <div className="text-center text-sm">
                {t("alreadyHaveAccount")}{" "}
                <Link href="/sign-in" className="underline underline-offset-4">
                  {t("signIn")}
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
