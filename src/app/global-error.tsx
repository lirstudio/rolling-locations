"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

/**
 * Catches errors in the root layout. Must render a full document (html + body).
 * No dependency on root layout or providers.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="he" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem 1.5rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#fff",
          color: "#3e4243",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "4rem",
            height: "4rem",
            borderRadius: "0.75rem",
            backgroundColor: "rgba(220, 38, 38, 0.1)",
            color: "#dc2626",
            marginBottom: "1.5rem",
          }}
          aria-hidden
        >
          <AlertCircle size={32} />
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
          אירעה שגיאה
        </h1>
        <p style={{ marginTop: "0.75rem", color: "#64748b", fontSize: "0.875rem" }}>
          {error.message || "משהו השתבש."}
        </p>
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              backgroundColor: "#ca2527",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            נסה שוב
          </button>
          <Link
            href="/"
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "1px solid #e2e8f0",
              backgroundColor: "#fff",
              color: "#3e4243",
              textDecoration: "none",
            }}
          >
            חזרה לדף הבית
          </Link>
        </div>
      </body>
    </html>
  );
}
