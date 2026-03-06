import "./globals.css";
import { Heebo } from "next/font/google";
import heMessages from "@/locales/he";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  display: "swap",
});

const copy = heMessages.marketing.notFound;

export const metadata = {
  title: "404 - הדף לא נמצא | Rollin Locations",
  description: copy.message,
};

export default function GlobalNotFound() {
  return (
    <html lang="he" dir="rtl" className={heebo.className}>
      <body className="min-h-screen antialiased bg-background text-foreground">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center max-w-md mx-auto">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary mb-6"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.75 7.09a3 3 0 0 1 2.16 2.16" />
              <path d="M17.072 17.072c-1.634 2.17-3.527 3.912-4.471 4.727a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 1.432-4.568" />
              <path d="M20 10a8 8 0 0 0-2.929-6.071" />
              <line x1="2" x2="22" y1="2" y2="22" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{copy.title}</h1>
          <p className="mt-3 text-muted-foreground">{copy.message}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row flex-wrap justify-center sm:gap-4">
            <a
              href="/"
              className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors no-underline"
            >
              {copy.backHome}
            </a>
            <a
              href="/locations"
              className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors no-underline"
            >
              {copy.browseLocations}
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
