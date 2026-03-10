import * as React from "react";

export interface HostBookingEmailProps {
  hostName?: string;
  locationTitle: string;
  locationAddress: string;
  creatorName: string;
  creatorEmail: string;
  creatorPhone?: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  dailyRate: number;
  subtotal: number;
  total: number;
  notes?: string;
  bookingId: string;
}

const primary = "#ca2527";
const bg = "#f7f9fc";
const border = "#e5e7eb";
const text = "#3e4243";
const muted = "#6b7280";

export function HostBookingEmail({
  hostName,
  locationTitle,
  locationAddress,
  creatorName,
  creatorEmail,
  creatorPhone,
  startDate,
  endDate,
  durationDays,
  dailyRate,
  subtotal,
  total,
  notes,
  bookingId,
}: HostBookingEmailProps) {
  return (
    <html dir="rtl" lang="he">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>בקשת הזמנה חדשה — Rollin Locations</title>
      </head>
      <body
        style={{
          backgroundColor: bg,
          fontFamily: "'Segoe UI', Arial, sans-serif",
          margin: 0,
          padding: "32px 16px",
          direction: "rtl",
        }}
      >
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ maxWidth: 600, margin: "0 auto" }}
        >
          {/* Logo bar */}
          <tbody>
            <tr>
              <td
                style={{
                  backgroundColor: primary,
                  borderRadius: "12px 12px 0 0",
                  padding: "24px 32px",
                  textAlign: "right",
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

            {/* Main card */}
            <tr>
              <td
                style={{
                  backgroundColor: "#ffffff",
                  padding: "32px",
                  borderRight: `1px solid ${border}`,
                  borderLeft: `1px solid ${border}`,
                }}
              >
                <p
                  style={{
                    color: muted,
                    fontSize: 13,
                    margin: "0 0 8px",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  בקשת הזמנה חדשה
                </p>
                <h1
                  style={{
                    color: text,
                    fontSize: 24,
                    fontWeight: 700,
                    margin: "0 0 4px",
                  }}
                >
                  {hostName ? `שלום ${hostName},` : "שלום,"}
                </h1>
                <p style={{ color: muted, fontSize: 15, margin: "0 0 28px" }}>
                  קיבלת בקשת הזמנה חדשה ללוקיישן שלך.
                </p>

                {/* Location section */}
                <table
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    backgroundColor: bg,
                    borderRadius: 8,
                    border: `1px solid ${border}`,
                    marginBottom: 24,
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: "16px 20px" }}>
                        <p
                          style={{
                            color: muted,
                            fontSize: 11,
                            margin: "0 0 4px",
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                          }}
                        >
                          לוקיישן
                        </p>
                        <p
                          style={{
                            color: text,
                            fontSize: 17,
                            fontWeight: 600,
                            margin: "0 0 2px",
                          }}
                        >
                          {locationTitle}
                        </p>
                        <p style={{ color: muted, fontSize: 13, margin: 0 }}>
                          {locationAddress}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Dates + duration */}
                <table
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ marginBottom: 24 }}
                >
                  <tbody>
                    <tr>
                      <td
                        width="48%"
                        style={{
                          backgroundColor: bg,
                          border: `1px solid ${border}`,
                          borderRadius: 8,
                          padding: "14px 18px",
                        }}
                      >
                        <p
                          style={{
                            color: muted,
                            fontSize: 11,
                            margin: "0 0 4px",
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                          }}
                        >
                          תאריך התחלה
                        </p>
                        <p
                          style={{
                            color: text,
                            fontSize: 15,
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          {startDate}
                        </p>
                      </td>
                      <td width="4%" />
                      <td
                        width="48%"
                        style={{
                          backgroundColor: bg,
                          border: `1px solid ${border}`,
                          borderRadius: 8,
                          padding: "14px 18px",
                        }}
                      >
                        <p
                          style={{
                            color: muted,
                            fontSize: 11,
                            margin: "0 0 4px",
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                          }}
                        >
                          תאריך סיום
                        </p>
                        <p
                          style={{
                            color: text,
                            fontSize: 15,
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          {endDate}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p style={{ color: muted, fontSize: 14, margin: "0 0 24px" }}>
                  <strong style={{ color: text }}>{durationDays} ימים</strong>{" "}
                  של הזמנה
                </p>

                {/* Price breakdown */}
                <table
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                    marginBottom: 24,
                    overflow: "hidden",
                  }}
                >
                  <tbody>
                    <tr style={{ backgroundColor: bg }}>
                      <td
                        style={{
                          padding: "12px 20px",
                          color: muted,
                          fontSize: 14,
                        }}
                      >
                        ₪{dailyRate} × {durationDays} ימים
                      </td>
                      <td
                        style={{
                          padding: "12px 20px",
                          color: text,
                          fontSize: 14,
                          textAlign: "left",
                        }}
                      >
                        ₪{subtotal.toLocaleString("he-IL")}
                      </td>
                    </tr>
                    <tr
                      style={{
                        borderTop: `1px solid ${border}`,
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <td
                        style={{
                          padding: "14px 20px",
                          color: text,
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        סה״כ (כולל עמלת שירות)
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          color: primary,
                          fontSize: 18,
                          fontWeight: 700,
                          textAlign: "left",
                        }}
                      >
                        ₪{total.toLocaleString("he-IL")}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Creator info */}
                <table
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    backgroundColor: bg,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                    marginBottom: 24,
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: "16px 20px" }}>
                        <p
                          style={{
                            color: muted,
                            fontSize: 11,
                            margin: "0 0 10px",
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                          }}
                        >
                          פרטי מבקש ההזמנה
                        </p>
                        <p
                          style={{
                            color: text,
                            fontSize: 15,
                            fontWeight: 600,
                            margin: "0 0 4px",
                          }}
                        >
                          {creatorName}
                        </p>
                        <p style={{ color: muted, fontSize: 14, margin: "0 0 2px" }}>
                          📧 {creatorEmail}
                        </p>
                        {creatorPhone && (
                          <p style={{ color: muted, fontSize: 14, margin: 0 }}>
                            📞 {creatorPhone}
                          </p>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Notes */}
                {notes && (
                  <table
                    width="100%"
                    cellPadding={0}
                    cellSpacing={0}
                    style={{
                      backgroundColor: "#fff8f8",
                      border: `1px solid #fecaca`,
                      borderRadius: 8,
                      marginBottom: 24,
                    }}
                  >
                    <tbody>
                      <tr>
                        <td style={{ padding: "16px 20px" }}>
                          <p
                            style={{
                              color: primary,
                              fontSize: 12,
                              margin: "0 0 6px",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: 0.8,
                            }}
                          >
                            הערות מהלקוח
                          </p>
                          <p
                            style={{
                              color: text,
                              fontSize: 14,
                              margin: 0,
                              lineHeight: 1.6,
                            }}
                          >
                            {notes}
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}

                <p style={{ color: muted, fontSize: 13, margin: "0 0 4px" }}>
                  מזהה בקשה: <code style={{ color: text }}>{bookingId}</code>
                </p>
                <p style={{ color: muted, fontSize: 13, margin: "0 0 24px" }}>
                  יצרו קשר עם הלקוח ישירות לסגירת העסקה.
                </p>
              </td>
            </tr>

            {/* Footer */}
            <tr>
              <td
                style={{
                  backgroundColor: bg,
                  borderRadius: "0 0 12px 12px",
                  border: `1px solid ${border}`,
                  borderTop: "none",
                  padding: "20px 32px",
                  textAlign: "center",
                }}
              >
                <p style={{ color: muted, fontSize: 12, margin: 0 }}>
                  Rollin Locations · מצאו ובצעו הזמנה יומית של לוקיישנים ייחודיים לצילום.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
