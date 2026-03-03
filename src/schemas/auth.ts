import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
  token: z.string().min(6, "קוד בן 6 תווים"),
});

export const signUpSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
  role: z.enum(["creator", "host"]),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
