import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "שם חייב להכיל לפחות 2 תווים").max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "slug יכול להכיל רק אותיות קטנות, מספרים ומקפים"),
  order: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
