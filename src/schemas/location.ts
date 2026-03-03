import { z } from "zod";

export const locationPricingSchema = z.object({
  hourlyRate: z.number().positive("מחיר לשעה חייב להיות חיובי"),
  dailyRate: z.number().positive("מחיר יומי חייב להיות חיובי").optional(),
  minimumHours: z.number().int().min(1).optional(),
});

export const locationAddressSchema = z.object({
  street: z.string().min(1, "נדרשת כתובת"),
  city: z.string().min(1, "נדרשת עיר"),
  country: z.string().min(1, "נדרשת מדינה").default("IL"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const locationSchema = z.object({
  title: z.string().min(3, "כותרת חייבת להכיל לפחות 3 תווים").max(100),
  description: z.string().min(10, "תיאור חייב להכיל לפחות 10 תווים").max(2000),
  type: z.enum(["studio", "rooftop", "apartment", "office", "outdoor", "industrial", "other"]),
  address: locationAddressSchema,
  categoryIds: z.array(z.string()).min(1, "בחר לפחות קטגוריה אחת"),
  pricing: locationPricingSchema,
  rules: z.string().max(1000).optional(),
  amenities: z.array(z.string()).optional(),
  status: z.enum(["draft", "published", "paused"]).default("draft"),
});

export type LocationFormValues = z.infer<typeof locationSchema>;
