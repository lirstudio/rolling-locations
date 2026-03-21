import * as React from "react";

export interface CreatorBookingStatusEmailProps {
  dir: "rtl" | "ltr";
  lang: "he" | "en";
  intro: string;
  statusLine: string;
  bookingIdLabel: string;
  bookingId: string;
  footerHint: string;
}

const primary = "#ca2527";
const bg = "#f7f9fc";
const border = "#e5e7eb";
const text = "#3e4243";
const muted = "#6b7280";

export function CreatorBookingStatusEmail({
  dir,
  lang,
  intro,
  statusLine,
  bookingIdLabel,
  bookingId,
  footerHint,
}: CreatorBookingStatusEmailProps) {
  const textAlign = dir === "rtl" ? "right" : "left";
  return (
    <html dir={dir} lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Rollin Locations</title>
      </head>
      <body
        style={{
          backgroundColor: bg,
          fontFamily: "'Segoe UI', Arial, sans-serif",
          margin: 0,
          padding: "32px 16px",
          direction: dir,
        }}
      >
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ maxWidth: 600, margin: "0 auto" }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  backgroundColor: primary,
                  borderRadius: "12px 12px 0 0",
                  padding: "24px 32px",
                  textAlign,
                }}
              >
                <span
                  style={{
                    color: "#ffffff",
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "-0.5px",
                  }}
                >
                  Rollin Locations
                </span>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  backgroundColor: "#ffffff",
                  padding: "32px",
                  borderRight: `1px solid ${border}`,
                  borderLeft: `1px solid ${border}`,
                }}
              >
                <h1
                  style={{
                    color: text,
                    fontSize: 22,
                    fontWeight: 700,
                    margin: "0 0 16px",
                  }}
                >
                  {intro}
                </h1>
                <p
                  style={{
                    color: text,
                    fontSize: 16,
                    lineHeight: 1.6,
                    margin: "0 0 20px",
                  }}
                >
                  {statusLine}
                </p>
                <p
                  style={{
                    color: muted,
                    fontSize: 14,
                    margin: "0 0 8px",
                  }}
                >
                  {bookingIdLabel}: <span style={{ color: text }}>{bookingId}</span>
                </p>
                <p style={{ color: muted, fontSize: 14, margin: "24px 0 0" }}>
                  {footerHint}
                </p>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  backgroundColor: "#f3f4f6",
                  borderRadius: "0 0 12px 12px",
                  padding: "16px 32px",
                  border: `1px solid ${border}`,
                  borderTop: "none",
                  textAlign,
                }}
              >
                <span style={{ color: muted, fontSize: 12 }}>Rollin Locations</span>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
