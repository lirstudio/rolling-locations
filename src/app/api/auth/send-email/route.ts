import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const AUTH_FROM_EMAIL =
  process.env.AUTH_FROM_EMAIL ?? "Rollin Locations <noreply@locations.rollin.video>";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const ACTION_SUBJECTS: Record<string, string> = {
  signup: "קוד אימות – Rollin Locations",
  magiclink: "קישור כניסה – Rollin Locations",
  recovery: "איפוס סיסמה – Rollin Locations",
  invite: "הזמנה ל-Rollin Locations",
  email_change: "שינוי אימייל – Rollin Locations",
  email: "קוד אימות – Rollin Locations",
  reauthentication: "אימות מחדש – Rollin Locations",
  password_changed_notification: "הסיסמה שונתה – Rollin Locations",
  email_changed_notification: "האימייל שונה – Rollin Locations",
  phone_changed_notification: "הטלפון שונה – Rollin Locations",
  identity_linked_notification: "חיבור חשבון – Rollin Locations",
  identity_unlinked_notification: "ניתוק חשבון – Rollin Locations",
  mfa_factor_enrolled_notification: "אימות דו-שלבי הופעל – Rollin Locations",
  mfa_factor_unenrolled_notification: "אימות דו-שלבי בוטל – Rollin Locations",
};

function buildAuthEmailHtml(params: {
  token: string;
  tokenHash: string;
  redirectTo: string;
  emailActionType: string;
  recipientEmail: string;
}): string {
  const { token, tokenHash, redirectTo, emailActionType } = params;
  const verifyUrl =
    SUPABASE_URL &&
    `${SUPABASE_URL}/auth/v1/verify?token=${encodeURIComponent(tokenHash)}&type=email&redirect_to=${encodeURIComponent(redirectTo)}`;
  const isMagicLink = emailActionType === "magiclink" || emailActionType === "signup";

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;line-height:1.6;color:#333;max-width:480px;margin:0 auto;padding:24px;">
  <h1 style="font-size:1.25rem;margin-bottom:16px;">Rollin Locations</h1>
  <p style="margin-bottom:16px;">שלום,</p>
  <p style="margin-bottom:16px;">הנה קוד האימות שלך:</p>
  <p style="font-size:1.5rem;font-weight:bold;letter-spacing:0.2em;text-align:center;background:#f4f4f4;padding:12px;border-radius:8px;margin:16px 0;">${token}</p>
  ${
    isMagicLink && verifyUrl
      ? `<p style="margin:16px 0;"><a href="${verifyUrl}" style="color:#ca2527;">לחץ כאן להתחברות</a></p>`
      : ""
  }
  <p style="margin-top:24px;font-size:0.875rem;color:#666;">אם לא ביקשת זאת, התעלם ממייל זה.</p>
  <p style="margin-top:16px;font-size:0.875rem;color:#666;">Rollin Locations</p>
</body>
</html>`.trim();
}

export async function POST(request: Request) {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET;
  if (!secret || !process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: { message: "Send email hook or Resend not configured" } },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const rawBody = await request.text();
  const headers = Object.fromEntries(request.headers) as Record<string, string>;
  const hookSecret = secret.replace(/^v1,whsec_/, "");

  let payload: { user: { email: string }; email_data: { token: string; token_hash: string; redirect_to: string; email_action_type: string; site_url: string } };
  try {
    const wh = new Webhook(hookSecret);
    payload = wh.verify(rawBody, headers) as typeof payload;
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid webhook signature" } },
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { user, email_data: emailData } = payload;
  const to = user?.email;
  if (!to) {
    return NextResponse.json(
      { error: { message: "Missing recipient email" } },
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const subject = ACTION_SUBJECTS[emailData.email_action_type] ?? "הודעת Rollin Locations";
  const html = buildAuthEmailHtml({
    token: emailData.token,
    tokenHash: emailData.token_hash,
    redirectTo: emailData.redirect_to,
    emailActionType: emailData.email_action_type,
    recipientEmail: to,
  });

  const { error } = await resend.emails.send({
    from: AUTH_FROM_EMAIL,
    to: [to],
    subject,
    html,
  });

  if (error) {
    return NextResponse.json(
      { error: { http_code: 503, message: error.message } },
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  return NextResponse.json({}, { status: 200, headers: { "Content-Type": "application/json" } });
}
