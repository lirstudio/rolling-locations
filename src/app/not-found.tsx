import Link from "next/link";
import { MapPinOff } from "lucide-react";
import heMessages from "@/locales/he";

const copy = heMessages.marketing.notFound;

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center max-w-md mx-auto bg-background">
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface-hover text-primary mb-6"
        aria-hidden
      >
        <MapPinOff className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{copy.title}</h1>
      <p className="mt-3 text-muted-foreground">{copy.message}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row flex-wrap justify-center sm:gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {copy.backHome}
        </Link>
        <Link
          href="/locations"
          className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {copy.browseLocations}
        </Link>
      </div>
    </div>
  );
}
