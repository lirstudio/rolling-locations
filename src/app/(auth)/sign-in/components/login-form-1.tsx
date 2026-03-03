"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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
import { signInSchema, type SignInFormValues } from "@/schemas/auth";
import { useAuthStore, roleRedirectPath } from "@/stores/auth-store";

export function LoginForm1({ className, ...props }: React.ComponentProps<"div">) {
  const t = useTranslations("auth");
  const router = useRouter();
  const { signIn, isLoading, error, clearError } = useAuthStore();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: SignInFormValues) {
    clearError();
    await signIn(data.email, data.password);

    const state = useAuthStore.getState();
    if (state.isAuthenticated && state.user) {
      router.push(roleRedirectPath(state.user.role));
    }
  }

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("welcomeBack")}</CardTitle>
          <CardDescription>{t("signInDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
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
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>{t("password")}</FormLabel>
                          <Link
                            href="/forgot-password"
                            className="text-sm underline-offset-4 hover:underline"
                          >
                            {t("forgotPassword")}
                          </Link>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="current-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <p className="text-sm text-destructive text-center">
                      {t(error)}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? "..." : t("signIn")}
                  </Button>
                </div>

                <div className="text-center text-sm">
                  {t("dontHaveAccount")}{" "}
                  <Link
                    href="/sign-up"
                    className="underline underline-offset-4"
                  >
                    {t("signUp")}
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
