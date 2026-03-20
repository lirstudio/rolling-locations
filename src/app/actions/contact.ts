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
  try {
    const parsed = contactSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject") || undefined,
      message: formData.get("message"),
    });

    if (!parsed.success) {
      console.warn("[contact] Validation failed:", parsed.error.issues);
      return { error: "Invalid form data" };
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("[contact] RESEND_API_KEY not configured");
      return { error: "Email service not configured" };
    }

    const { name, email, subject, message } = parsed.data;

    // Sanitize HTML to prevent XSS
    const sanitizeHtml = (text: string) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const { error, data } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      replyTo: email,
      subject: subject
        ? `[יצירת קשר] ${sanitizeHtml(subject)}`
        : "[יצירת קשר] Rollin Locations",
      html: `
        <p><strong>שם:</strong> ${sanitizeHtml(name)}</p>
        <p><strong>אימייל:</strong> <a href="mailto:${sanitizeHtml(email)}">${sanitizeHtml(email)}</a></p>
        <p><strong>נושא:</strong> ${subject ? sanitizeHtml(subject) : "—"}</p>
        <p><strong>הודעה:</strong></p>
        <p>${sanitizeHtml(message).replace(/\n/g, "<br>")}</p>
      `.trim(),
    });

    if (error) {
      console.error("[contact] Resend API error:", {
        message: error.message,
        name: error.name,
        email: email.replace(/(.{2}).*(@.*)/, "$1…$2"), // Partial email for logging
      });
      return { error: "Failed to send message. Please try again later." };
    }

    if (data?.id) {
      console.info("[contact] Message sent successfully:", {
        id: data.id,
        email: email.replace(/(.{2}).*(@.*)/, "$1…$2"),
      });
    }

    return {};
  } catch (err) {
    // Catch any unexpected errors to prevent 500
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("[contact] Unexpected error:", errorMessage, err);
    return {
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}
