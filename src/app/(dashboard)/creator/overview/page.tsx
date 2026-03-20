"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Clock, CheckCircle, DollarSign, Heart } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationCard } from "@/components/locations/location-card";
import { useCreatorStore } from "@/stores/creator-store";
import { useFavorites } from "@/hooks/use-favorites";
import type { BookingStatus } from "@/types";

const CREATOR_ID = "user-creator-1";

function formatCurrency(amount: number) {
  return `₪${amount.toLocaleString("he-IL")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
  });
}

const statusVariant: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  requested: "default",
  approved: "secondary",
  rejected: "destructive",
  cancelled: "outline",
};

export default function CreatorOverviewPage() {
  const t = useTranslations("creator");
  const bookingRequests = useCreatorStore((s) => s.bookingRequests);
  const locations = useCreatorStore((s) => s.locations);
  const { locations: favoriteLocations } = useFavorites();
  const creatorBookings = useMemo(
    () => bookingRequests.filter((r) => r.creatorId === CREATOR_ID),
    [bookingRequests]
  );

  const activeBookings = creatorBookings.filter(
    (r) => r.status === "approved"
  ).length;
  const pendingRequests = creatorBookings.filter(
    (r) => r.status === "requested"
  ).length;
  const completedBookings = creatorBookings.filter(
    (r) => r.status === "approved" && new Date(r.end) < new Date()
  ).length;
  const totalSpent = creatorBookings
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.priceEstimate, 0);

  const kpis = [
    { label: t("overview.activeBookings"), value: activeBookings, icon: BookOpen },
    { label: t("overview.pendingRequests"), value: pendingRequests, icon: Clock },
    { label: t("overview.completedBookings"), value: completedBookings, icon: CheckCircle },
    { label: t("overview.totalSpent"), value: formatCurrency(totalSpent), icon: DollarSign },
  ];

  const recentBookings = [...creatorBookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("overview.title")}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="card-hover rounded-2xl border-border/60 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-sm font-medium">
                {kpi.label}
              </CardDescription>
              <kpi.icon className="size-4.5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/60 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("overview.recentBookings")}</CardTitle>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/creator/bookings">{t("overview.viewAll")}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("overview.noBookings")}
            </p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => {
                const location = locations.find(
                  (l) => l.id === booking.locationId
                );
                return (
                  <Link
                    key={booking.id}
                    href={`/creator/bookings/${booking.id}`}
                    className="flex items-center justify-between rounded-xl border border-border/60 p-3.5 transition-all hover:bg-muted/50 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">
                        {location?.title ?? "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(booking.start)} · {formatCurrency(booking.priceEstimate)}
                      </span>
                    </div>
                    <Badge variant={statusVariant[booking.status]}>
                      {t(`bookings.status.${booking.status}` as "bookings.status.requested")}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("overview.favorites")}</CardTitle>
            <CardDescription>{t("overview.favoritesDesc")}</CardDescription>
          </div>
          {favoriteLocations.length > 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/creator/favorites">{t("overview.viewAll")}</Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {favoriteLocations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Heart className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                {t("overview.noFavorites")}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/locations">{t("favorites.browseLocations")}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteLocations.slice(0, 6).map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  showFavoriteButton={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
