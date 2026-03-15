"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatorStore } from "@/stores/creator-store";
import type { BookingStatus } from "@/types";

const CREATOR_ID = "user-creator-1";

const statusVariant: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  requested: "default",
  approved: "secondary",
  rejected: "destructive",
  cancelled: "outline",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CreatorBookingsPage() {
  const t = useTranslations("creator");
  const bookingRequests = useCreatorStore((s) => s.bookingRequests);
  const locations = useCreatorStore((s) => s.locations);
  const creatorBookings = React.useMemo(
    () => bookingRequests.filter((r) => r.creatorId === CREATOR_ID),
    [bookingRequests]
  );

  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filtered = creatorBookings.filter(
    (r) => statusFilter === "all" || r.status === statusFilter
  );

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("bookings.title")}
        </h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("bookings.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("bookings.allStatuses")}</SelectItem>
            <SelectItem value="requested">{t("bookings.status.requested")}</SelectItem>
            <SelectItem value="approved">{t("bookings.status.approved")}</SelectItem>
            <SelectItem value="rejected">{t("bookings.status.rejected")}</SelectItem>
            <SelectItem value="cancelled">{t("bookings.status.cancelled")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="mb-4 size-12 text-muted-foreground" />
            <CardTitle className="mb-2">{t("bookings.noBookings")}</CardTitle>
            <CardDescription>{t("bookings.noBookingsDesc")}</CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((booking) => {
            const location = locations.find((l) => l.id === booking.locationId);

            return (
              <Link key={booking.id} href={`/creator/bookings/${booking.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {location?.mediaGallery[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={location.mediaGallery[0].url}
                            alt={location.title}
                            className="size-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate font-medium">
                          {location?.title ?? "—"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDateTime(booking.start)} ·{" "}
                          {formatTime(booking.start)}–{formatTime(booking.end)}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 sm:justify-end">
                      <span className="text-sm font-semibold">
                        ₪{booking.priceEstimate.toLocaleString("he-IL")}
                      </span>
                      <Badge variant={statusVariant[booking.status]}>
                        {t(`bookings.status.${booking.status}` as "bookings.status.requested")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
