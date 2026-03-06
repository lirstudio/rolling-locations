import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
  token: z.string().min(6, "קוד בן 6 תווים"),
});

export const onboardingSchema = z.object({
  role: z.enum(["creator", "host"]),
  name: z.string().min(2, "שם חייב להכיל לפחות 2 תווים"),
  phone: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
