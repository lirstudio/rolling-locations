"use server";

import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.AUTH_FROM_EMAIL ??
  "Rollin Locations <noreply@locations.rollin.video>";

const CONTACT_TO_EMAIL =
  process.env.CONTACT_EMAIL ?? "contact@locations.rollin.video";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(1),
});

export async function sendContactMessage(
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject") || undefined,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: "Invalid form data" };
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[contact] RESEND_API_KEY not configured");
    return { error: "Email service not configured" };
  }

  const { name, email, subject, message } = parsed.data;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [CONTACT_TO_EMAIL],
    replyTo: email,
    subject: subject
      ? `[יצירת קשר] ${subject}`
      : "[יצירת קשר] Rollin Locations",
    html: `
      <p><strong>שם:</strong> ${name}</p>
      <p><strong>אימייל:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>נושא:</strong> ${subject ?? "—"}</p>
      <p><strong>הודעה:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `.trim(),
  });

  if (error) {
    console.error("[contact] Resend error:", error);
    return { error: error.message };
  }

  return {};
}
