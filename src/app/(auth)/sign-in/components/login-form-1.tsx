"use client";

import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trans, useTranslations } from "next-intl";
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
import { signInSchema, verifyOtpSchema, type SignInFormValues, type VerifyOtpFormValues } from "@/schemas/auth";
import { useAuthStore, roleRedirectPath } from "@/stores/auth-store";

export function LoginForm1({ className, ...props }: React.ComponentProps<"div">) {
  const t = useTranslations("auth");
  const router = useRouter();
  const {
    sendOtp,
    verifyOtp,
    signInWithGoogle,
    isLoading,
    error,
    clearError,
    isAuthenticated,
    user,
  } = useAuthStore();

  const [step, setStep] = useState<"email" | "sent" | "otp">("email");
  const [otpEmail, setOtpEmail] = useState("");

  const emailForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: "", token: "" },
  });

  const didRedirect = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || !user || didRedirect.current) return;
    didRedirect.current = true;
    router.replace(roleRedirectPath(user.role));
  }, [isAuthenticated, user, router]);

  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
      </div>
    );
  }

  async function onEmailSubmit(data: SignInFormValues) {
    clearError();
    await sendOtp(data.email);
    setOtpEmail(data.email);
    otpForm.setValue("email", data.email);
    setStep("otp");
  }

  async function onOtpSubmit(data: VerifyOtpFormValues) {
    clearError();
    await verifyOtp(data.email, data.token);
  }

  async function onGoogle() {
    clearError();
    await signInWithGoogle();
  }

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("welcomeTitle")}</CardTitle>
          <CardDescription>{t("authDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === "otp" && (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="grid gap-4">
                <p className="text-sm text-muted-foreground text-center">
                  {t("otpSentTo", { email: otpEmail })}
                </p>
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
                          autoFocus
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
                  onClick={() => {
                    clearError();
                    setStep("email");
                  }}
                >
                  {t("backToSignIn")}
                </Button>
              </form>
            </Form>
          )}

          {step === "email" && (
            <>
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                  className="grid gap-4"
                >
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("email")}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            autoComplete="email"
                            autoFocus
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
                    {isLoading ? "..." : t("sendCode")}
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

              <p className="mt-4 text-center text-xs text-muted-foreground">
                <Trans
                  i18nKey="termsFooter"
                  t={t}
                  components={{
                    terms: (chunks) => (
                      <Link
                        href="/terms"
                        className="underline underline-offset-2 hover:text-foreground"
                      >
                        {chunks}
                      </Link>
                    ),
                    privacy: (chunks) => (
                      <Link
                        href="/privacy"
                        className="underline underline-offset-2 hover:text-foreground"
                      >
                        {chunks}
                      </Link>
                    ),
                  }}
                />
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
