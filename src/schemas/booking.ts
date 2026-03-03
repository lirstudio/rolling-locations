import { z } from "zod";

export const bookingRequestSchema = z.object({
  locationId: z.string().min(1, "נדרש לוקיישן"),
  start: z.string().min(1, "נדרש תאריך ושעת התחלה"),
  end: z.string().min(1, "נדרש תאריך ושעת סיום"),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => new Date(data.end) > new Date(data.start),
  { message: "שעת הסיום חייבת להיות אחרי שעת ההתחלה", path: ["end"] }
);

export const bookingReviewSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  hostNote: z.string().max(300).optional(),
});

export type BookingRequestFormValues = z.infer<typeof bookingRequestSchema>;
export type BookingReviewFormValues = z.infer<typeof bookingReviewSchema>;
