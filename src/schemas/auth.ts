import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
});

export const signUpSchema = z
  .object({
    name: z.string().min(2, "שם חייב להכיל לפחות 2 תווים"),
    email: z.string().email("כתובת אימייל לא תקינה"),
    phone: z.string().optional(),
    password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
    confirmPassword: z.string(),
    role: z.enum(["creator", "host"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
