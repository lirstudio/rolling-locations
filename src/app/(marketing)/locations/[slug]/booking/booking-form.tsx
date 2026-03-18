"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { he } from "date-fns/locale/he";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  MapPin,
  CalendarDays,
  Clock,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Receipt,
  User,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBookingRequest } from "@/app/actions/bookings";
import type { Location } from "@/types";

interface BookingFormProps {
  slug: string;
  initialLocation: Location;
}

export function BookingForm({ slug, initialLocation }: BookingFormProps) {
  const searchParams = useSearchParams();
  const t = useTranslations("marketing.bookingSummary");

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const dateFrom = useMemo(
    () => (fromParam ? new Date(fromParam) : null),
    [fromParam]
  );
  const dateTo = useMemo(
    () => (toParam ? new Date(toParam) : null),
    [toParam]
  );

  const { data: location = initialLocation } = useQuery({
    queryKey: queryKeys.locations.bySlug(slug),
    queryFn: async () => {
      const { fetchLocationBySlug } = await import("@/app/actions/locations");
      return fetchLocationBySlug(slug);
    },
    initialData: initialLocation,
    staleTime: 5 * 60 * 1000,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [availabilityStatus, setAvailabilityStatus] = useState<
    "checking" | "available" | "unavailable"
  >("checking");
  const [unavailableReason, setUnavailableReason] = useState<string | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<
    Array<{ start: string; end: string; durationDays: number }>
  >([]);

  const days = useMemo(() => {
    if (!dateFrom || !dateTo) return 0;
    const diff = Math.round(
      (dateTo.getTime() - dateFrom.getTime()) / 86_400_000
    );
    return diff >= 0 ? diff + 1 : 0;
  }, [dateFrom, dateTo]);

  useQuery({
    queryKey: [
      "availability",
      "check",
      location?.id,
      fromParam,
      toParam,
    ],
    queryFn: async () => {
      if (!location || !dateFrom || !dateTo || days <= 0) return null;
      const startStr = format(dateFrom, "yyyy-MM-dd");
      const endStr = format(dateTo, "yyyy-MM-dd");
      const r = await fetch(
        `/api/availability/check?locationId=${location.id}&start=${startStr}T00:00:00Z&end=${endStr}T23:59:59Z`
      );
      return r.json() as Promise<{ available: boolean; reason?: string }>;
    },
    enabled: !!location && !!dateFrom && !!dateTo && days > 0,
    onSuccess: async (data: { available: boolean; reason?: string } | null) => {
      if (!data) return;
      if (data.available) {
        setAvailabilityStatus("available");
        setUnavailableReason(null);
      } else {
        setAvailabilityStatus("unavailable");
        setUnavailableReason(data.reason ?? null);
        if (!dateFrom || !dateTo) return;
        const startStr = format(dateFrom, "yyyy-MM-dd");
        const endStr = format(dateTo, "yyyy-MM-dd");
        const r = await fetch(
          `/api/availability/suggest?locationId=${location!.id}&start=${startStr}&end=${endStr}&days=${days}`
        );
        const suggestData = await r.json();
        setSuggestions(suggestData.suggestions ?? []);
      }
    },
  } as Parameters<typeof useQuery>[0]);

  const subtotal = location ? location.pricing.dailyRate * days : 0;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  const canSubmit =
    name.trim().length > 1 &&
    email.includes("@") &&
    !isPending &&
    availabilityStatus !== "unavailable" &&
    availabilityStatus !== "checking";

  function handleSubmit() {
    if (!location || !dateFrom || !dateTo) return;
    setError(null);

    startTransition(async () => {
      const result = await createBookingRequest({
        locationId: location.id,
        locationTitle: location.title,
        locationAddress: `${location.address.street}, ${location.address.city}`,
        hostId: location.hostId,
        creatorName: name.trim(),
        creatorEmail: email.trim(),
        creatorPhone: phone.trim() || undefined,
        startDate: format(dateFrom, "yyyy-MM-dd"),
        endDate: format(dateTo, "yyyy-MM-dd"),
        durationDays: days,
        dailyRate: location.pricing.dailyRate,
        subtotal,
        total,
        notes: notes.trim() || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
      }
    });
  }

  if (!location || !dateFrom || !dateTo || days <= 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">{t("invalidBooking")}</p>
        <Button asChild className="mt-4">
          <Link href={`/locations/${encodeURIComponent(slug)}`}>
            {t("backToLocation")}
          </Link>
        </Button>
      </div>
    );
  }

  const coverUrl =
    location.mediaGallery.find((m) => m.isFeatured)?.url ??
    location.mediaGallery[0]?.url;

  if (submitted) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
        <div className="rounded-full bg-green-100 p-4">
          <CheckCircle2 className="size-12 text-green-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          {t("successTitle")}
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          {t("successMessage")}
        </p>
        <div className="mt-8 flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/locations">{t("browseMore")}</Link>
          </Button>
          <Button asChild>
            <Link href={`/locations/${encodeURIComponent(slug)}`}>
              {t("backToLocation")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href={`/locations/${encodeURIComponent(slug)}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          {t("backToLocation")}
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          {t("title")}
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Location card */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex gap-4">
                {coverUrl && (
                  <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-36">
                    <Image
                      src={coverUrl}
                      alt={location.title}
                      fill
                      className="object-cover"
                      sizes="144px"
                      unoptimized={
                        coverUrl.includes("supabase.co") &&
                        coverUrl.includes("/storage/")
                      }
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center gap-1">
                  <h2 className="text-lg font-semibold text-foreground">
                    {location.title}
                  </h2>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {location.address.street}, {location.address.city}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <CalendarDays className="h-5 w-5 text-primary" />
                {t("datesTitle")}
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{t("checkIn")}</p>
                  <p className="mt-1 font-medium text-foreground">
                    {format(dateFrom, "EEEE, d MMMM yyyy", { locale: he })}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{t("checkOut")}</p>
                  <p className="mt-1 font-medium text-foreground">
                    {format(dateTo, "EEEE, d MMMM yyyy", { locale: he })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                {days} {t("days")}
              </div>
            </CardContent>
          </Card>

          {/* Contact details */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <User className="h-5 w-5 text-primary" />
                {t("contactTitle")}
              </h3>
              <p className="text-sm text-muted-foreground">{t("contactSubtitle")}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking-name">
                  {t("nameLabel")} <span className="text-primary">*</span>
                </Label>
                <Input
                  id="booking-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-email">
                  {t("emailLabel")} <span className="text-primary">*</span>
                </Label>
                <Input
                  id="booking-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-phone">{t("phoneLabel")}</Label>
                <Input
                  id="booking-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("phonePlaceholder")}
                  autoComplete="tel"
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-base font-semibold text-foreground">
                {t("notesTitle")}
              </h3>
              <p className="text-sm text-muted-foreground">{t("notesSubtitle")}</p>
            </CardHeader>
            <CardContent>
              <Label htmlFor="booking-notes" className="sr-only">
                {t("notesTitle")}
              </Label>
              <Textarea
                id="booking-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("notesPlaceholder")}
                rows={4}
              />
            </CardContent>
          </Card>

          {availabilityStatus === "unavailable" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-orange-300 bg-orange-50 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-700">
                    {t("unavailableTitle")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {t("unavailableMessage")}
                  </p>
                </div>
              </div>

              {suggestions.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      {t("suggestedDatesTitle")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("suggestedDatesDesc")}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {suggestions.map((s) => (
                      <Link
                        key={s.start}
                        href={`/locations/${encodeURIComponent(slug)}/booking?from=${s.start}&to=${s.end}`}
                        className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-foreground">
                            {format(new Date(s.start), "d MMM", { locale: he })}
                            {" – "}
                            {format(new Date(s.end), "d MMM yyyy", { locale: he })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.durationDays} {t("days")}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          {t("selectAlternative")}
                        </Button>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {availabilityStatus === "checking" && (
            <div className="flex items-center gap-2 rounded-lg border p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("checkingAvailability")}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">{t("errorTitle")}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — price summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border border-border">
            <CardHeader className="pb-3">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Receipt className="h-5 w-5 text-primary" />
                {t("priceSummary")}
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    ₪{location.pricing.dailyRate} × {days} {t("days")}
                  </span>
                  <span className="text-foreground">
                    ₪{subtotal.toLocaleString("he-IL")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("serviceFee")}</span>
                  <span className="text-foreground">
                    ₪{serviceFee.toLocaleString("he-IL")}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between font-semibold">
                <span>{t("total")}</span>
                <span className="text-lg">₪{total.toLocaleString("he-IL")}</span>
              </div>

              <Separator />

              <Button
                className="w-full"
                size="lg"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {isPending ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t("sending")}
                  </>
                ) : (
                  t("confirmBooking")
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                {t("noChargeYet")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
