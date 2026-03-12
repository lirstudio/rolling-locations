import { google } from "googleapis";

/**
 * Returns an OAuth2 client. When redirectUri is provided (e.g. from request origin),
 * use it so the same app works on localhost and production without changing env.
 */
export function getGoogleOAuthClient(redirectUri?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const resolvedRedirectUri =
    redirectUri ?? process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Google OAuth env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"
    );
  }
  if (!resolvedRedirectUri) {
    throw new Error(
      "Missing redirect URI: pass redirectUri or set GOOGLE_REDIRECT_URI"
    );
  }

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    resolvedRedirectUri
  );
}

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function getCalendarClient(accessToken: string) {
  const auth = getGoogleOAuthClient();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth });
}
