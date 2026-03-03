"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
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
import { signUpSchema, type SignUpFormValues } from "@/schemas/auth";
import { useAuthStore, roleRedirectPath } from "@/stores/auth-store";

export function SignupForm1({ className, ...props }: React.ComponentProps<"div">) {
  const t = useTranslations("auth");
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuthStore();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "creator",
    },
  });

  async function onSubmit(data: SignUpFormValues) {
    clearError();
    await signUp({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
    });

    const state = useAuthStore.getState();
    if (state.isAuthenticated && state.user) {
      router.push(roleRedirectPath(state.user.role));
    }
  }

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("createAccount")}</CardTitle>
          <CardDescription>{t("signUpDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("fullName")}</FormLabel>
                        <FormControl>
                          <Input autoComplete="name" {...field} />
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("phone")}</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            dir="ltr"
                            autoComplete="tel"
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
                        <FormLabel>{t("password")}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("confirmPassword")}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Role selection */}
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
                                <span className="font-medium text-sm">
                                  {t("roleCreator")}
                                </span>
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
                                <span className="font-medium text-sm">
                                  {t("roleHost")}
                                </span>
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
                    <p className="text-sm text-destructive text-center">
                      {t(error)}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? "..." : t("signUp")}
                  </Button>
                </div>

                <div className="text-center text-sm">
                  {t("alreadyHaveAccount")}{" "}
                  <Link
                    href="/sign-in"
                    className="underline underline-offset-4"
                  >
                    {t("signIn")}
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
