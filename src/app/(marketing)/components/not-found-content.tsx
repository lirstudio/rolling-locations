"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

export type NotFoundCopy = {
  title: string;
  message: string;
  backHome: string;
  browseLocations: string;
};

type NotFoundContentProps = {
  /** When provided (e.g. from server not-found), avoids useTranslations so 404 renders without provider */
  copy?: NotFoundCopy;
};

function NotFoundContentInner({ copy }: { copy: NotFoundCopy }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteNav />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface-hover text-primary mb-6"
            aria-hidden
          >
            <MapPinOff className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{copy.title}</h1>
          <p className="mt-3 text-muted-foreground">{copy.message}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <Button asChild>
              <Link href="/">{copy.backHome}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/locations">{copy.browseLocations}</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function NotFoundContentWithI18n() {
  const t = useTranslations("marketing.notFound");
  const copy: NotFoundCopy = {
    title: t("title"),
    message: t("message"),
    backHome: t("backHome"),
    browseLocations: t("browseLocations"),
  };
  return <NotFoundContentInner copy={copy} />;
}

/**
 * Full 404 page. When copy is passed from server (e.g. not-found.tsx), render minimal UI only:
 * no SiteNav/SiteFooter so nothing can throw after hydration (e.g. useTranslations in nav/footer).
 * When used inside a route with provider (no copy), render full page with nav/footer.
 */
export function NotFoundContent({ copy: copyProp }: NotFoundContentProps) {
  if (copyProp) return <NotFoundContentMinimal copy={copyProp} />;
  return <NotFoundContentWithI18n />;
}

/** Minimal 404 UI used when NotFoundContent throws (e.g. missing provider or nav/footer error). */
export function NotFoundContentMinimal({ copy }: { copy: NotFoundCopy }) {
  return (
    <div className="min-h-screen flex flex-col bg-background items-center justify-center px-4 py-16 text-center max-w-md mx-auto">
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface-hover text-primary mb-6"
        aria-hidden
      >
        <MapPinOff className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{copy.title}</h1>
      <p className="mt-3 text-muted-foreground">{copy.message}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row flex-wrap justify-center gap-4">
        <Button asChild>
          <Link href="/">{copy.backHome}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/locations">{copy.browseLocations}</Link>
        </Button>
      </div>
    </div>
  );
}

class NotFoundErrorBoundary extends React.Component<
  { copy: NotFoundCopy; children: React.ReactNode },
  { hasError: boolean }
> {
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  state = { hasError: false };
  render() {
    if (this.state.hasError) return <NotFoundContentMinimal copy={this.props.copy} />;
    return this.props.children;
  }
}

export function NotFoundWithBoundary({ copy, children }: { copy: NotFoundCopy; children: React.ReactNode }) {
  return (
    <NotFoundErrorBoundary copy={copy}>
      {children}
    </NotFoundErrorBoundary>
  );
}
